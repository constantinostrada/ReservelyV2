import { Router } from "express";
import { listReservations } from "../data/book.js";
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

  res.json(buildDayBook(listReservations(), requested ?? today()));
});
