/**
 * The reservations domain.
 *
 * The deposit rule lives here and nowhere else. The client is given the
 * verdict, never the inputs to reach it, so there is exactly one place where
 * "does this guest owe a deposit" is answered.
 */

/** A guest, and the history the deposit rule is drawn from. */
export type Guest = {
  id: string;
  name: string;
  /** Dates (YYYY-MM-DD) this guest booked and never arrived. */
  noShows: string[];
};

export type Reservation = {
  id: string;
  /** Service date, YYYY-MM-DD. */
  date: string;
  /** Local time of the sitting, HH:MM on a 24h clock. */
  time: string;
  /** How the floor refers to the table, e.g. "12" or "Bar 3". */
  table: string;
  partySize: number;
  guest: Guest;
};

/**
 * The deposit rule's verdict on one reservation.
 *
 * A union rather than a flag plus optional fields: when no deposit is due
 * there is no amount and no reason to render, and the type says so.
 */
export type Deposit =
  | { required: false }
  | { required: true; amount: string; reason: string };

/** A reservation as the book shows it — the verdict already reached. */
export type BookedReservation = {
  id: string;
  time: string;
  table: string;
  partySize: number;
  guest: { id: string; name: string };
  deposit: Deposit;
};

export type DayBook = {
  date: string;
  /** The date as a person reads it, e.g. "Thursday 13 August 2026". */
  label: string;
  summary: { reservations: number; covers: number; depositsRequired: number };
  reservations: BookedReservation[];
};

/**
 * The deposit rule.
 *
 * ASSUMPTION: no prior decision on this rule exists in the project's memory,
 * its docs, or the code. These numbers are a stand-in chosen to match the
 * README's framing ("keeping track of the guests who don't show up") and are
 * the single place to change when the real policy is settled.
 */
export const DEPOSIT_RULE = {
  /** No-shows within the lookback that trigger a deposit. */
  noShowThreshold: 2,
  lookbackMonths: 6,
  /** Charged per head, in minor units of `currency`. */
  perHeadMinor: 1500,
  currency: "EUR",
} as const;

const money = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: DEPOSIT_RULE.currency,
});

const dayLabel = new Intl.DateTimeFormat("en-IE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Counts a guest's no-shows falling inside the rule's lookback window. */
function recentNoShows(guest: Guest, asOf: string): number {
  const cutoff = new Date(`${asOf}T00:00:00`);
  cutoff.setMonth(cutoff.getMonth() - DEPOSIT_RULE.lookbackMonths);
  const cutoffIso = toIsoDate(cutoff);
  return guest.noShows.filter((d) => d >= cutoffIso && d <= asOf).length;
}

/**
 * Applies the deposit rule to one reservation.
 *
 * Returns everything the screen needs to render the verdict — including the
 * amount already formatted and the reason already worded — so that nothing
 * downstream has to know the rule to describe it.
 */
export function assessDeposit(
  guest: Guest,
  partySize: number,
  asOf: string
): Deposit {
  const count = recentNoShows(guest, asOf);
  if (count < DEPOSIT_RULE.noShowThreshold) return { required: false };

  return {
    required: true,
    amount: money.format((partySize * DEPOSIT_RULE.perHeadMinor) / 100),
    reason: `${count} no-show${count === 1 ? "" : "s"} in the last ${DEPOSIT_RULE.lookbackMonths} months`,
  };
}

/**
 * Builds the day's book: the sitting order, each reservation already judged
 * against the deposit rule, and the totals the screen shows.
 */
export function buildDayBook(reservations: Reservation[], date: string): DayBook {
  const forTheDay = reservations
    .filter((r) => r.date === date)
    .sort((a, b) => a.time.localeCompare(b.time) || a.table.localeCompare(b.table))
    .map<BookedReservation>((r) => ({
      id: r.id,
      time: r.time,
      table: r.table,
      partySize: r.partySize,
      guest: { id: r.guest.id, name: r.guest.name },
      deposit: assessDeposit(r.guest, r.partySize, date),
    }));

  return {
    date,
    label: dayLabel.format(new Date(`${date}T00:00:00`)),
    summary: {
      reservations: forTheDay.length,
      covers: forTheDay.reduce((n, r) => n + r.partySize, 0),
      depositsRequired: forTheDay.filter((r) => r.deposit.required).length,
    },
    reservations: forTheDay,
  };
}

/** A date as YYYY-MM-DD in the restaurant's own timezone, not UTC. */
export function toIsoDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function today(): string {
  return toIsoDate(new Date());
}
