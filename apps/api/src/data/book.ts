import {
  toIsoDate,
  today,
  type Guest,
  type NoShow,
  type Reservation,
} from "../domain/reservations.js";

/**
 * The book, in memory.
 *
 * Where reservations are actually stored is still open (see the README), so
 * this stands in behind the same shape the rest of the service reads.
 *
 * Guests are held apart from reservations and referenced by id. That is the
 * whole point of the arrangement: a no-show recorded against a guest is
 * immediately true of every other booking in their name, because there is only
 * one copy of their history to write to.
 *
 * Seeded against the current date so the day's book is never empty, and so the
 * deposit rule's lookback window is exercised by real dates rather than by
 * fixtures that quietly age out.
 */

/** A date `days` before today, as YYYY-MM-DD. */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
}

const service = today();
const yesterday = daysAgo(1);

/**
 * History predating the book we hold in memory, so the missed reservations it
 * refers to aren't in `reservations` below.
 */
function archived(date: string, ref: string): NoShow {
  return { date, reservationId: `res_arc_${ref}` };
}

const guests: Guest[] = [
  { id: "gst_01", name: "Aoife Brennan", noShows: [] },
  {
    id: "gst_02",
    name: "Dara Whitfield",
    // Two inside the lookback — already over the threshold.
    noShows: [archived(daysAgo(38), "02a"), archived(daysAgo(96), "02b")],
  },
  {
    id: "gst_03",
    name: "Marcus Oyelaran",
    // One recent, one long past — the old one falls outside the lookback.
    noShows: [archived(daysAgo(52), "03a"), archived(daysAgo(410), "03b")],
  },
  { id: "gst_04", name: "Priya Raghunathan", noShows: [] },
  {
    id: "gst_05",
    name: "Tomas Lindqvist",
    noShows: [
      archived(daysAgo(12), "05a"),
      archived(daysAgo(64), "05b"),
      archived(daysAgo(150), "05c"),
    ],
  },
  {
    id: "gst_06",
    name: "Hannah Okonkwo",
    // One short of the threshold, and holding two bookings — marking the one
    // she missed yesterday is what tips her tonight's table into a deposit.
    noShows: [archived(daysAgo(40), "06a")],
  },
  { id: "gst_07", name: "Léa Marchetti", noShows: [] },
];

const reservations: Reservation[] = [
  // Yesterday — every sitting has passed, so all of it can be marked.
  { id: "res_y1", date: yesterday, time: "12:30", table: "5", partySize: 2, guestId: "gst_07", status: "booked" },
  { id: "res_y2", date: yesterday, time: "19:30", table: "8", partySize: 4, guestId: "gst_06", status: "booked" },
  { id: "res_y3", date: yesterday, time: "20:00", table: "11", partySize: 6, guestId: "gst_03", status: "booked" },

  // Today — lunch has passed by any normal afternoon, dinner has not.
  { id: "res_01", date: service, time: "12:30", table: "5", partySize: 2, guestId: "gst_01", status: "booked" },
  { id: "res_02", date: service, time: "13:00", table: "6", partySize: 3, guestId: "gst_03", status: "booked" },
  { id: "res_03", date: service, time: "18:30", table: "12", partySize: 4, guestId: "gst_02", status: "booked" },
  { id: "res_04", date: service, time: "19:00", table: "7", partySize: 6, guestId: "gst_04", status: "booked" },
  { id: "res_05", date: service, time: "19:45", table: "9", partySize: 8, guestId: "gst_05", status: "booked" },
  { id: "res_06", date: service, time: "20:15", table: "3", partySize: 3, guestId: "gst_06", status: "booked" },
  { id: "res_07", date: service, time: "21:00", table: "12", partySize: 5, guestId: "gst_07", status: "booked" },
];

export function listReservations(): Reservation[] {
  return reservations;
}

export function findReservation(id: string): Reservation | undefined {
  return reservations.find((r) => r.id === id);
}

export function guestsById(): ReadonlyMap<string, Guest> {
  return new Map(guests.map((g) => [g.id, g]));
}

export function findGuest(id: string): Guest | undefined {
  return guests.find((g) => g.id === id);
}

/**
 * Persists a no-show: the reservation is marked, and the record is filed
 * against the guest — the second of which is what makes it stick across their
 * other bookings.
 */
export function recordNoShow(reservation: Reservation, guest: Guest, noShow: NoShow): void {
  reservation.status = "no_show";
  guest.noShows.push(noShow);
}
