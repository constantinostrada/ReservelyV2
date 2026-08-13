---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-16
type: convention
title: The day-book empty state in ReservationsScreen echoes the active table filter in its copy…
tags: [convention]
created: 2026-08-13
resource: apps/web/src/reservations/ReservationsScreen.tsx
---
The day-book empty state in ReservationsScreen echoes the active table filter in its copy (e.g. "Nothing on table 12 this day.") instead of a generic "no reservations" message

## Why
keeps the empty state legible about *why* the list is empty (filtered vs. actually no sittings)

## Where
apps/web/src/reservations/ReservationsScreen.tsx
