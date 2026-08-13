import { Router } from "express";
import {
  addReservation,
  findGuest,
  findReservation,
  guestsById,
  listReservations,
  recordNoShow,
} from "../data/book.js";
import { checkDeposit, confirmDeposit } from "../domain/booking.js";
import { checkNoShow, noShowFrom } from "../domain/no-show.js";
import { buildDayBook, depositRequirement, today } from "../domain/reservations.js";
import { parseBookingRequest } from "./booking-request.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const reservationsRouter: Router = Router();

type Filter =
  | { ok: true; table: string | null }
  | { ok: false; message: string };

/**
 * The `table` query parameter: which table to narrow the book to, if any.
 *
 * An unrecognised table is not an error — it answers with an empty book. A
 * table is only ever "unknown" for a given day, and the screen holds its filter
 * while stepping between days, so a table that isn't in tonight's book is an
 * ordinary thing to ask about rather than a mistake.
 */
function tableFilter(raw: unknown): Filter {
  if (raw === undefined) return { ok: true, table: null };
  if (typeof raw !== "string") return { ok: false, message: "table must be a single value" };
  if (raw.trim() === "") return { ok: false, message: "table must not be empty" };
  return { ok: true, table: raw };
}

/**
 * GET /reservations?date=YYYY-MM-DD&table=12
 *
 * The day's book, in sitting order, with the deposit rule already applied to
 * every line. Defaults to today. The response is what the screen renders, as
 * it renders it — amounts formatted, reasons worded, totals counted — so no
 * client has to hold a copy of the rule to show its result.
 *
 * `table` narrows it to one table's sittings, and the same principle holds:
 * the narrowing is done here, so the totals that come back describe the lines
 * that come back. The book also carries the day's `tables`, which is the list
 * the filter is built from — the screen never gathers it from the rows itself.
 */
reservationsRouter.get("/reservations", (req, res) => {
  const requested = req.query.date;

  if (requested !== undefined && typeof requested !== "string") {
    res.status(400).json({ error: "date must be a single YYYY-MM-DD value" });
    return;
  }
  if (requested !== undefined && !ISO_DATE.test(requested)) {
    res.status(400).json({ error: `date must look like YYYY-MM-DD, got "${requested}"` });
    return;
  }

  const filter = tableFilter(req.query.table);
  if (!filter.ok) {
    res.status(400).json({ error: filter.message });
    return;
  }

  const date = requested ?? today();
  res.json(buildDayBook(listReservations(), guestsById(), date, new Date(), filter.table));
});

/**
 * POST /reservations
 *
 * Takes a booking, if the guest is allowed to make one.
 *
 * A guest over the no-show threshold must leave a deposit to book again. This
 * route holds no numbers: it asks `depositRequirement` what the rule demands —
 * the same call the screen's warning goes through — and `checkDeposit` whether
 * the booking satisfies it. Changing the threshold or the per-head rate is a
 * change to `DEPOSIT_RULE` and to nothing here.
 *
 * A guest's standing is read as of **today**, the moment the booking is taken,
 * not as of the date being booked. The deposit is a condition of booking now,
 * and the counting window would otherwise be read from a date that hasn't
 * happened.
 *
 * The confirmation answers with the deposit line already worded: what was
 * taken, and the standing that called for it — or, when nothing was taken, a
 * line saying as much rather than no line at all.
 */
reservationsRouter.post("/reservations", (req, res) => {
  const parsed = parseBookingRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.message });
    return;
  }
  const { date, time, table, partySize, guestId, offeredMinor } = parsed.value;

  const guest = findGuest(guestId);
  if (guest === undefined) {
    res.status(404).json({ error: `No guest ${guestId}.` });
    return;
  }

  const verdict = checkDeposit(depositRequirement(guest, partySize, today()), offeredMinor);
  if (!verdict.ok) {
    res.status(409).json({
      error: verdict.message,
      reason: verdict.reason,
      deposit: verdict.required,
    });
    return;
  }

  const reservation = addReservation({
    date,
    time,
    table,
    partySize,
    guestId,
    status: "booked",
    depositTakenMinor: verdict.taken?.deposit.amountMinor ?? null,
  });

  res.status(201).json({
    reservationId: reservation.id,
    deposit: confirmDeposit(verdict.taken),
    book: buildDayBook(listReservations(), guestsById(), reservation.date, new Date()),
  });
});

/**
 * POST /reservations/:id/no-show
 *
 * Records that the guest never arrived. The no-show is filed against the
 * guest, so it counts towards the deposit rule on every booking in their name,
 * not only this one.
 *
 * Answers with the whole day's book rather than the single line. Marking a
 * no-show can change another row on the same screen — a guest crossing the
 * deposit threshold — so returning the rebuilt book keeps the screen
 * consistent in one round trip and keeps it out of the business of working out
 * what else the change touched.
 *
 * `?table=` says which book to send back: a screen narrowed to one table is
 * answered with that table, not with the whole day it was reading a moment
 * ago. The filter is a view the caller states, and the reply honours it.
 */
reservationsRouter.post("/reservations/:id/no-show", (req, res) => {
  const filter = tableFilter(req.query.table);
  if (!filter.ok) {
    res.status(400).json({ error: filter.message });
    return;
  }

  const reservation = findReservation(req.params.id);
  if (reservation === undefined) {
    res.status(404).json({ error: `No reservation ${req.params.id}.` });
    return;
  }

  const guest = findGuest(reservation.guestId);
  if (guest === undefined) {
    res.status(500).json({ error: `Reservation ${reservation.id} has no guest on file.` });
    return;
  }

  const verdict = checkNoShow(reservation, new Date());
  if (!verdict.ok) {
    res.status(409).json({ error: verdict.message, reason: verdict.reason });
    return;
  }

  recordNoShow(reservation, guest, noShowFrom(reservation));

  res.json(
    buildDayBook(listReservations(), guestsById(), reservation.date, new Date(), filter.table)
  );
});
