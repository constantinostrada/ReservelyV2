import { Router } from "express";
import {
  findGuest,
  findReservation,
  guestsById,
  listReservations,
  recordNoShow,
} from "../data/book.js";
import { checkNoShow, noShowFrom } from "../domain/no-show.js";
import { buildDayBook, today } from "../domain/reservations.js";

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
