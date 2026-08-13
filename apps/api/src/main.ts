import express from "express";
import { reservationsRouter } from "./routes/reservations.js";

/**
 * The service.
 *
 * Three layers so far: `domain` holds the rules, `data` holds the book, and
 * `routes` exposes it. Rules never live in a route — the deposit rule in
 * particular is decided in the domain and shipped to clients already applied.
 */
const app = express();
app.use(express.json());

// The one endpoint that exists so both halves can prove they're wired.
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reservely-api" });
});

app.use(reservationsRouter);

const port = Number(process.env.PORT ?? 3100);
app.listen(port, () => {
  console.log(`reservely-api listening on http://localhost:${port}`);
});
