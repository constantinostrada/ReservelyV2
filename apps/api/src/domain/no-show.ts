import { sittingTime, type NoShow, type Reservation } from "./reservations.js";

/**
 * When a no-show may be recorded.
 *
 * Only one rule, but it earns its own file because it guards a write: a
 * no-show follows a guest around, so the conditions for creating one are worth
 * stating in a single readable place rather than buried in a route handler.
 */

export type NoShowRefusal = {
  ok: false;
  /** Machine-readable so callers can branch without matching on prose. */
  reason: "not_yet_sat" | "already_marked";
  message: string;
};

export type NoShowCheck = { ok: true } | NoShowRefusal;

/**
 * Decides whether `reservation` can be marked a no-show at `now`.
 *
 * "Past" is the sitting time, not the date. A guest is a no-show once their
 * table has come and gone, which happens during service — waiting for the date
 * to roll over would mean tonight's empty tables couldn't be recorded until
 * tomorrow.
 */
export function checkNoShow(reservation: Reservation, now: Date): NoShowCheck {
  if (reservation.status === "no_show") {
    return {
      ok: false,
      reason: "already_marked",
      message: "This reservation is already recorded as a no-show.",
    };
  }

  if (sittingTime(reservation) > now) {
    return {
      ok: false,
      reason: "not_yet_sat",
      message: `This table isn't due until ${reservation.time}. A no-show can only be recorded once the sitting has passed.`,
    };
  }

  return { ok: true };
}

/** The record a missed reservation leaves on the guest it belongs to. */
export function noShowFrom(reservation: Reservation): NoShow {
  return { date: reservation.date, reservationId: reservation.id };
}
