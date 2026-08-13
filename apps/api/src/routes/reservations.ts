import { Router } from "express";
import {
  addReservation,
  findGuest,
  findReservation,
  guestsById,
  listReservations,
  recordNoShow,
} from "../data/book.js";
import { checkDeposit } from "../domain/booking.js";
import { checkNoShow, noShowFrom } from "../domain/no-show.js";
import { buildDayBook, depositRequirement, today } from "../domain/reservations.js";
import { parseBookingRequest } from "./booking-request.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const reservationsRouter: Router = Router();

/**
 * GET /reservations?date=YYYY-MM-DD
 *
 * The day's book, in sitting order, with the deposit rule already applied to
 * every line. Defaults to today. The response is what the screen renders, as
 * it renders it — amounts formatted, reasons worded, totals counted — so no
 * client has to hold a copy of the rule to show its result.
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

  const date = requested ?? today();
  res.json(buildDayBook(listReservations(), guestsById(), date, new Date()));
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
    depositTakenMinor: verdict.taken?.amountMinor ?? null,
  });

  res.status(201).json({
    reservationId: reservation.id,
    depositTaken: verdict.taken,
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
 */
reservationsRouter.post("/reservations/:id/no-show", (req, res) => {
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

  res.json(buildDayBook(listReservations(), guestsById(), reservation.date, new Date()));
});
