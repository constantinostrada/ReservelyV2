---
id: 735c49b1-2065-40a5-9249-97394ab858f1-8
type: architecture
title: In the Reservely app, guests were pulled out into their own collection with each…
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts, apps/api/src/data/book.ts
---
In the Reservely app, guests were pulled out into their own collection with each reservation pointing at a guest via `guestId`, replacing a `Guest` object embedded per-reservation.

## Why
no-shows must be attributable to the guest across all their reservations (not just the missed one); an embedded `Guest` gave every reservation its own private copy of guest history, so writing a no-show there would satisfy 'a no-show can be recorded' but silently fail 'it's recorded against the guest' — the record would exist but only be visible on the one reservation.

## Learned
when an acceptance criterion says a fact must be attributable to an entity that is currently embedded/duplicated per-parent, check whether the embedding itself blocks the requirement before writing the feature logic.

## Where
apps/api/src/domain/reservations.ts, apps/api/src/data/book.ts
