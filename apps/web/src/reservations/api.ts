/**
 * The shape the API hands back for a day's book.
 *
 * These types mirror `apps/api/src/domain/reservations.ts`. There is no shared
 * package between the two halves yet, so the mirror is by hand; if a third
 * consumer appears, that's the moment to extract one.
 *
 * Note what the client is *not* given: no no-show history, no per-head rate,
 * no thresholds, and no say in whether a sitting has passed. Every verdict
 * arrives decided, worded and priced, and the screen's only job is to show it.
 */

export type Deposit =
  | { required: false }
  | { required: true; amount: string; reason: string };

export type ReservationStatus = "booked" | "no_show" | "cancelled";

export type BookedReservation = {
  id: string;
  time: string;
  table: string;
  partySize: number;
  guest: { id: string; name: string };
  deposit: Deposit;
  status: ReservationStatus;
  /** Why it was called off, as it was given. `null` if nothing was said. */
  cancellationReason: string | null;
  /** Whether the API will accept a no-show against this line. Its call, not ours. */
  canMarkNoShow: boolean;
  /** Whether the API will accept a cancellation. Also its call. */
  canCancel: boolean;
};

/**
 * The longest reason the API will take, mirrored from `REASON_MAX_LENGTH` in
 * `apps/api/src/routes/cancellation-request.ts` — by hand, like the types
 * above, and for the same want of a shared package.
 *
 * It stops the box overrunning as it's typed. It is not the rule: the API
 * measures what it is sent and refuses anything longer on its own account.
 */
export const REASON_MAX_LENGTH = 200;

export type DayBook = {
  date: string;
  /** The date as a person reads it — worded by the API, not by the screen. */
  label: string;
  /** The days either side, so the screen steps through the book without date maths. */
  previousDate: string;
  nextDate: string;
  /**
   * The day's tables, for the filter to offer. Always the whole day's, even
   * when the book below is narrowed to one of them — gathered by the API, not
   * scraped out of the rows by the screen.
   */
  tables: string[];
  /** The table this book is narrowed to, or `null` for the whole day. */
  table: string | null;
  /** Counts for the lines below — this table's, when narrowed to one. */
  summary: {
    reservations: number;
    covers: number;
    depositsRequired: number;
    noShows: number;
    cancellations: number;
  };
  reservations: BookedReservation[];
};

/** Pulls the API's own wording out of a failed response, if it sent one. */
async function errorFrom(response: Response, fallback: string): Promise<Error> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "error" in body) {
      const { error } = body as { error: unknown };
      if (typeof error === "string") return new Error(error);
    }
  } catch {
    // No JSON body to read; fall through to the generic wording.
  }
  return new Error(`${fallback} (${response.status}).`);
}

/** Builds the query the book is read through. Both parts are optional. */
function bookQuery(date: string | null, table: string | null): string {
  const query = new URLSearchParams();
  if (date !== null) query.set("date", date);
  if (table !== null) query.set("table", table);
  const written = query.toString();
  return written === "" ? "" : `?${written}`;
}

/**
 * Fetches the day's book. `date` null for today, `table` null for every table.
 *
 * The filtering is asked of the API rather than done here, so the totals and
 * the deposit count that come back belong to the lines that come back.
 */
export async function fetchDayBook(
  date: string | null = null,
  table: string | null = null
): Promise<DayBook> {
  const response = await fetch(`/api/reservations${bookQuery(date, table)}`);

  if (!response.ok) throw await errorFrom(response, "The book couldn't be loaded");

  return (await response.json()) as DayBook;
}

/**
 * Records a no-show against the guest who missed this reservation.
 *
 * Returns the day's book as it stands afterwards — the guest's new history can
 * push another of their bookings over the deposit threshold, so the API sends
 * back the whole day rather than the one line that was marked.
 *
 * `table` is passed on so the book that comes back is the one being read: a
 * screen filtered to a table stays filtered to it across the mark.
 */
export async function markNoShow(
  reservationId: string,
  table: string | null = null
): Promise<DayBook> {
  const query = bookQuery(null, table);
  const response = await fetch(
    `/api/reservations/${encodeURIComponent(reservationId)}/no-show${query}`,
    { method: "POST" }
  );

  if (!response.ok) throw await errorFrom(response, "The no-show couldn't be recorded");

  return (await response.json()) as DayBook;
}

/**
 * Calls a booking off, with an optional note on why — `null` for none, which
 * is the ordinary case and sends no reason at all rather than an empty one.
 *
 * Answers with the day's book, filtered as the screen is reading it, the same
 * way marking a no-show does.
 */
export async function cancelReservation(
  reservationId: string,
  reason: string | null = null,
  table: string | null = null
): Promise<DayBook> {
  const query = bookQuery(null, table);
  const response = await fetch(
    `/api/reservations/${encodeURIComponent(reservationId)}/cancel${query}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reason === null ? {} : { reason }),
    }
  );

  if (!response.ok) throw await errorFrom(response, "The cancellation couldn't be recorded");

  return (await response.json()) as DayBook;
}
