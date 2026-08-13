/**
 * The reservations domain.
 *
 * The deposit rule lives here and nowhere else. The client is given the
 * verdict, never the inputs to reach it, so there is exactly one place where
 * "does this guest owe a deposit" is answered.
 */

/** One occasion a guest booked and never arrived. */
export type NoShow = {
  /** Service date of the reservation that was missed, YYYY-MM-DD. */
  date: string;
  /** The reservation it was recorded against. */
  reservationId: string;
};

/**
 * A guest.
 *
 * No-shows hang off the guest, not off the reservation they happened on — the
 * restaurant's interest is in the person, and a guest who misses one booking
 * is the same guest standing behind every other booking in their name. A
 * reservation points at a guest by id so there is one record of that history
 * rather than a copy per booking.
 */
export type Guest = {
  id: string;
  name: string;
  noShows: NoShow[];
};

/** Whether the guest turned up. */
export type ReservationStatus = "booked" | "no_show";

export type Reservation = {
  id: string;
  /** Service date, YYYY-MM-DD. */
  date: string;
  /** Local time of the sitting, HH:MM on a 24h clock. */
  time: string;
  /** How the floor refers to the table, e.g. "12" or "Bar 3". */
  table: string;
  partySize: number;
  guestId: string;
  status: ReservationStatus;
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
  status: ReservationStatus;
  /**
   * Whether a no-show may be recorded against this line right now — decided
   * here, so the screen never works out for itself whether a sitting has
   * passed. It's a hint for rendering the control, not the safeguard: the
   * clock moves on after the book is fetched, and the write path checks again.
   */
  canMarkNoShow: boolean;
};

export type DayBook = {
  date: string;
  /** The date as a person reads it, e.g. "Thursday 13 August 2026". */
  label: string;
  /** The days either side, so stepping through the book needs no date maths. */
  previousDate: string;
  nextDate: string;
  summary: {
    reservations: number;
    covers: number;
    depositsRequired: number;
    noShows: number;
  };
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
  /** No-shows within the counting window that trigger a deposit. */
  noShowThreshold: 2,
  /**
   * How many *completed* calendar months are counted.
   *
   * The month in progress is not one of them. Counting whole months means the
   * window only moves when a month closes, so a guest's standing holds steady
   * through a service instead of drifting by a day every day — but it also
   * means a no-show recorded this month does not bear on the rule until the
   * month is out.
   */
  completedMonths: 6,
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

const monthLabel = new Intl.DateTimeFormat("en-IE", { month: "long", year: "numeric" });

/** The stretch of time the deposit rule counts over. */
export type CountingWindow = {
  /** First day of the earliest month counted, YYYY-MM-DD. */
  from: string;
  /** First day of the month in progress — the day after the window, so compare with `<`. */
  until: string;
  /** The last completed month, e.g. "July 2026". */
  endsWith: string;
};

/**
 * The last `DEPOSIT_RULE.completedMonths` calendar months to have finished,
 * as of `asOf`.
 *
 * Whole months, so the window runs from the first of the earliest month up to
 * the last day of the month before `asOf` — the month `asOf` falls in is still
 * running and is left out entirely.
 */
export function countingWindow(asOf: string): CountingWindow {
  const d = new Date(`${asOf}T00:00:00`);
  const year = d.getFullYear();
  const month = d.getMonth();

  return {
    from: toIsoDate(new Date(year, month - DEPOSIT_RULE.completedMonths, 1)),
    until: toIsoDate(new Date(year, month, 1)),
    endsWith: monthLabel.format(new Date(year, month - 1, 1)),
  };
}

/** Counts a guest's no-shows falling inside the counting window. */
function noShowsWithin(guest: Guest, window: CountingWindow): number {
  return guest.noShows.filter((n) => n.date >= window.from && n.date < window.until).length;
}

/** "1 month", "6 months". */
function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/**
 * Applies the deposit rule to one reservation.
 *
 * Returns everything the screen needs to render the verdict — including the
 * amount already formatted and the reason already worded — so that nothing
 * downstream has to know the rule to describe it. The reason names the month
 * the window closes on, because "the last 6 months" would now be a misleading
 * way to describe a count that stops at the end of last month.
 */
export function assessDeposit(guest: Guest, partySize: number, asOf: string): Deposit {
  const window = countingWindow(asOf);
  const count = noShowsWithin(guest, window);
  if (count < DEPOSIT_RULE.noShowThreshold) return { required: false };

  return {
    required: true,
    amount: money.format((partySize * DEPOSIT_RULE.perHeadMinor) / 100),
    reason:
      `${plural(count, "no-show")} in the ` +
      `${plural(DEPOSIT_RULE.completedMonths, "month")} to ${window.endsWith}`,
  };
}

/** When a sitting is due, in the restaurant's own timezone. */
export function sittingTime(reservation: Reservation): Date {
  return new Date(`${reservation.date}T${reservation.time}:00`);
}

/**
 * Builds the day's book: the sitting order, each reservation already judged
 * against the deposit rule, and the totals the screen shows.
 *
 * `now` decides which sittings have already passed; it is a parameter rather
 * than a call to the clock so the book can be built for a known moment.
 */
export function buildDayBook(
  reservations: Reservation[],
  guests: ReadonlyMap<string, Guest>,
  date: string,
  now: Date
): DayBook {
  const forTheDay = reservations
    .filter((r) => r.date === date)
    .sort((a, b) => a.time.localeCompare(b.time) || a.table.localeCompare(b.table))
    .map<BookedReservation>((r) => {
      const guest = guests.get(r.guestId);
      if (guest === undefined) {
        throw new Error(`reservation ${r.id} points at unknown guest ${r.guestId}`);
      }

      return {
        id: r.id,
        time: r.time,
        table: r.table,
        partySize: r.partySize,
        guest: { id: guest.id, name: guest.name },
        deposit: assessDeposit(guest, r.partySize, date),
        status: r.status,
        canMarkNoShow: r.status === "booked" && sittingTime(r) <= now,
      };
    });

  return {
    date,
    label: dayLabel.format(new Date(`${date}T00:00:00`)),
    previousDate: shiftDate(date, -1),
    nextDate: shiftDate(date, 1),
    summary: {
      reservations: forTheDay.length,
      covers: forTheDay.reduce((n, r) => n + r.partySize, 0),
      depositsRequired: forTheDay.filter((r) => r.deposit.required).length,
      noShows: forTheDay.filter((r) => r.status === "no_show").length,
    },
    reservations: forTheDay,
  };
}

/** The date `days` away from `date`, as YYYY-MM-DD. */
function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
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
