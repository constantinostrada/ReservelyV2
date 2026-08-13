---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-13
type: architecture
title: In ReservationsScreen.tsx, the selected table filter is held as state independent from…
tags: [architecture]
created: 2026-08-13
resource: apps/web/src/reservations/ReservationsScreen.tsx
---
In ReservationsScreen.tsx, the selected table filter is held as state independent from the selected date, not derived from or reset by it

## Why
so stepping between dates preserves the active table filter, and changing the table filter does not reset the currently viewed date

## Where
apps/web/src/reservations/ReservationsScreen.tsx
