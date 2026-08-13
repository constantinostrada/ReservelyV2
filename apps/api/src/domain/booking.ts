import { money, type DepositRequirement, type Money } from "./reservations.js";

/**
 * Taking a booking.
 *
 * The deposit rule decides whether a guest may book; this decides whether what
 * was offered satisfies it. The two are kept apart because the rule is about a
 * guest's standing and this is about one transaction — and because the sum is
 * never taken on trust from the caller. The caller states what it collected,
 * and it has to match what the rule worked out independently.
 */

export type DepositRefusal =
  | "deposit_required"
  | "deposit_short"
  | "deposit_not_required";

/**
 * A deposit the booking actually collected.
 *
 * The reason travels with the sum rather than being looked up again later: it
 * is why *this* money was taken, and the rule's answer moves on as the counting
 * window turns over.
 */
export type TakenDeposit = { deposit: Money; reason: string };

export type DepositCheck =
  | { ok: true; taken: TakenDeposit | null }
  | {
      ok: false;
      /** Machine-readable so callers can branch without matching on prose. */
      reason: DepositRefusal;
      message: string;
      /** What should have been collected, when that is the problem. */
      required: Money | null;
    };

/**
 * Weighs what the booking offered against what the rule demands.
 *
 * `offeredMinor` is what the caller says it has taken, in minor units, or
 * `null` for a booking offering nothing.
 *
 * An offer that does not match is refused rather than quietly adjusted: taking
 * the wrong sum and recording the right one, or the reverse, would leave the
 * books disagreeing with the till.
 */
export function checkDeposit(
  requirement: DepositRequirement,
  offeredMinor: number | null
): DepositCheck {
  if (!requirement.required) {
    if (offeredMinor === null) return { ok: true, taken: null };

    // Refused rather than ignored: a caller that believes it has taken money
    // must not be told the booking succeeded as though it hadn't.
    return {
      ok: false,
      reason: "deposit_not_required",
      message: "This guest doesn't owe a deposit, so none should be collected.",
      required: null,
    };
  }

  const { deposit, reason } = requirement;

  if (offeredMinor === null) {
    return {
      ok: false,
      reason: "deposit_required",
      message: `${reason} — a deposit of ${deposit.amount} is required to book.`,
      required: deposit,
    };
  }

  if (offeredMinor !== deposit.amountMinor) {
    return {
      ok: false,
      reason: "deposit_short",
      message:
        `The deposit for this booking is ${deposit.amount}, ` +
        `but ${money(offeredMinor).amount} was offered.`,
      required: deposit,
    };
  }

  return { ok: true, taken: { deposit, reason } };
}

/**
 * What the guest is told about the deposit on their confirmation.
 *
 * Both arms carry a `summary`, because a booking that took nothing has to say
 * so: silence reads as an omission, and a guest who was charged nothing should
 * see that stated as plainly as one who was charged.
 *
 * Worded here, priced here. Like every other verdict this API sends, the
 * confirmation arrives written the way it should be shown — the amount already
 * formatted, minor units left behind — so no client has to word the rule's
 * result for itself.
 */
export type DepositConfirmation =
  | { taken: false; summary: string }
  | { taken: true; amount: string; reason: string; summary: string };

/**
 * The deposit line on a booking confirmation.
 *
 * Built from what was actually collected, not from the rule read afresh: the
 * confirmation is a receipt for a booking that has been taken, and it should
 * still say the same thing when the counting window has moved on.
 */
export function confirmDeposit(taken: TakenDeposit | null): DepositConfirmation {
  if (taken === null) {
    return { taken: false, summary: "No deposit was taken — this booking didn't require one." };
  }

  return {
    taken: true,
    amount: taken.deposit.amount,
    reason: taken.reason,
    summary: `Deposit of ${taken.deposit.amount} taken — ${taken.reason}.`,
  };
}
