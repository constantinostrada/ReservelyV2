import { toIsoDate, today, type Reservation } from "../domain/reservations.js";

/**
 * The book, in memory.
 *
 * Where reservations are actually stored is still open (see the README), so
 * this stands in behind the same shape the rest of the service reads. Swapping
 * it for a real store means replacing `listReservations`, nothing above it.
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

const reservations: Reservation[] = [
  {
    id: "res_01",
    date: service,
    time: "18:00",
    table: "4",
    partySize: 2,
    guest: { id: "gst_01", name: "Aoife Brennan", noShows: [] },
  },
  {
    id: "res_02",
    date: service,
    time: "18:30",
    table: "12",
    partySize: 4,
    // Two no-shows inside the lookback — the rule applies.
    guest: {
      id: "gst_02",
      name: "Dara Whitfield",
      noShows: [daysAgo(38), daysAgo(96)],
    },
  },
  {
    id: "res_03",
    date: service,
    time: "19:00",
    table: "7",
    partySize: 6,
    // One recent no-show, one long past — under the threshold, no deposit.
    guest: {
      id: "gst_03",
      name: "Marcus Oyelaran",
      noShows: [daysAgo(52), daysAgo(410)],
    },
  },
  {
    id: "res_04",
    date: service,
    time: "19:00",
    table: "Bar 2",
    partySize: 2,
    guest: { id: "gst_04", name: "Priya Raghunathan", noShows: [] },
  },
  {
    id: "res_05",
    date: service,
    time: "19:45",
    table: "9",
    partySize: 8,
    // Three no-shows, all recent — the largest party owing a deposit.
    guest: {
      id: "gst_05",
      name: "Tomas Lindqvist",
      noShows: [daysAgo(12), daysAgo(64), daysAgo(150)],
    },
  },
  {
    id: "res_06",
    date: service,
    time: "20:15",
    table: "3",
    partySize: 3,
    guest: { id: "gst_06", name: "Hannah Okonkwo", noShows: [daysAgo(200)] },
  },
  {
    id: "res_07",
    date: service,
    time: "21:00",
    table: "12",
    partySize: 5,
    guest: { id: "gst_07", name: "Léa Marchetti", noShows: [] },
  },
];

export function listReservations(): Reservation[] {
  return reservations;
}
