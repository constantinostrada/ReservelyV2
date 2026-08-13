---
id: 735c49b1-2065-40a5-9249-97394ab858f1-11
type: convention
title: An endpoint that mutates one record but can change derived state on sibling records (e.g.…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts (POST /reservations/:id/no-show)
---
An endpoint that mutates one record but can change derived state on sibling records (e.g. marking a no-show can push a *different* reservation of the same guest over the deposit threshold) returns the whole rebuilt collection (the full day book), not just the mutated record.

## Why
keeps the screen consistent in one round trip and preserves the project rule that the client never recomputes derived state itself.

## Where
apps/api/src/routes/reservations.ts (POST /reservations/:id/no-show)
