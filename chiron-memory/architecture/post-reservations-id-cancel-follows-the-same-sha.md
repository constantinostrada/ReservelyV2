---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-23
type: architecture
title: `POST /reservations/:id/cancel` follows the same shape as the no-show endpoint
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts.
---
`POST /reservations/:id/cancel` follows the same shape as the no-show endpoint — it accepts an optional `?table=` filter and responds with the full rebuilt day book (not just the single reservation).

## Why
Mirrors the existing no-show endpoint convention, since either action can affect other rows on the same screen (e.g. a deposit threshold), so the whole book needs to be current after a write.

## Where
apps/api/src/routes/reservations.ts.
