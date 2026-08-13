---
id: 735c49b1-2065-40a5-9249-97394ab858f1-28
type: decision
title: `Reservation` stores the deposit actually collected (`depositTakenMinor`) rather than…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (Reservation type), apps/api/src/data/book.ts
---
`Reservation` stores the deposit actually collected (`depositTakenMinor`) rather than recomputing it later

## Why
the no-show counting window rolls over monthly, so a deposit recomputed after the fact could disagree with what was actually taken at booking time — the stored value must stay the reconciliation source of truth

## Learned
money actually collected must be persisted, not derived, whenever an input to its calculation (like a rolling time window) can change after the fact.

## Where
apps/api/src/domain/reservations.ts (Reservation type), apps/api/src/data/book.ts
