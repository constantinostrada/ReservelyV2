import express from "express";

/**
 * The service.
 *
 * Deliberately one file: how this is organised — layers, folders, where the
 * domain lives — is part of the work ahead, not something the skeleton should
 * settle in advance.
 */
const app = express();
app.use(express.json());

// The one endpoint that exists so both halves can prove they're wired.
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reservely-api" });
});

const port = Number(process.env.PORT ?? 3100);
app.listen(port, () => {
  console.log(`reservely-api listening on http://localhost:${port}`);
});
