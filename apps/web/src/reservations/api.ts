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

export type ReservationStatus = "booked" | "no_show";

export type BookedReservation = {
  id: string;
  time: string;
  table: string;
  partySize: number;
  guest: { id: string; name: string };
  deposit: Deposit;
  status: ReservationStatus;
  /** Whether the API will accept a no-show against this line. Its call, not ours. */
  canMarkNoShow: boolean;
};

export type DayBook = {
  date: string;
  /** The date as a person reads it — worded by the API, not by the screen. */
  label: string;
  /** The days either side, so the screen steps through the book without date maths. */
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

/** Fetches the day's book. Omit `date` for today. */
export async function fetchDayBook(date?: string): Promise<DayBook> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await fetch(`/api/reservations${query}`);

  if (!response.ok) throw await errorFrom(response, "The book couldn't be loaded");

  return (await response.json()) as DayBook;
}

/**
 * Records a no-show against the guest who missed this reservation.
 *
 * Returns the day's book as it stands afterwards — the guest's new history can
 * push another of their bookings over the deposit threshold, so the API sends
 * back the whole day rather than the one line that was marked.
 */
export async function markNoShow(reservationId: string): Promise<DayBook> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}/no-show`, {
    method: "POST",
  });

  if (!response.ok) throw await errorFrom(response, "The no-show couldn't be recorded");

  return (await response.json()) as DayBook;
}
