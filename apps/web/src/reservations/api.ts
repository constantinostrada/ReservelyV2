/**
 * The shape the API hands back for a day's book.
 *
 * These types mirror `apps/api/src/domain/reservations.ts`. There is no shared
 * package between the two halves yet, so the mirror is by hand; if a third
 * consumer appears, that's the moment to extract one.
 *
 * Note what the client is *not* given: no no-show history, no per-head rate,
 * no thresholds. The deposit verdict arrives decided, worded and priced, and
 * the screen's only job is to show it.
 */

export type Deposit =
  | { required: false }
  | { required: true; amount: string; reason: string };

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
  /** The date as a person reads it — worded by the API, not by the screen. */
  label: string;
  summary: { reservations: number; covers: number; depositsRequired: number };
  reservations: BookedReservation[];
};

/** Fetches the day's book. Omit `date` for today. */
export async function fetchDayBook(date?: string): Promise<DayBook> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await fetch(`/api/reservations${query}`);

  if (!response.ok) {
    throw new Error(`The book couldn't be loaded (${response.status}).`);
  }

  return (await response.json()) as DayBook;
}
