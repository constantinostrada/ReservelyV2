---
id: 735c49b1-2065-40a5-9249-97394ab858f1-16
type: architecture
title: A guest's no-show history (`Guest.noShows`) is stored as an array of `{date,…
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts.
---
A guest's no-show history (`Guest.noShows`) is stored as an array of `{date, reservationId}` records, not a bare count.

## Why
keeps each no-show traceable back to the specific reservation that caused it, which is what the deposit rule and any future audit/undo feature need to reference.

## Where
apps/api/src/domain/reservations.ts.
