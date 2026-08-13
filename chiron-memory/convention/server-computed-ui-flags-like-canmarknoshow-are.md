---
id: 735c49b1-2065-40a5-9249-97394ab858f1-12
type: convention
title: Server-computed UI flags like `canMarkNoShow` are advisory hints for rendering only
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/no-show.ts, apps/web/src/reservations/ReservationsScreen.tsx
---
Server-computed UI flags like `canMarkNoShow` are advisory hints for rendering only; the mutating endpoint independently re-validates the same rule against the current time server-side rather than trusting the client's copy of the flag.

## Why
the clock keeps moving after the book is fetched, so a hint fetched a few minutes ago can go stale — verified by marking a reservation out-of-band and confirming the UI's stale action was still refused server-side with the API's own wording shown.

## Where
apps/api/src/domain/no-show.ts, apps/web/src/reservations/ReservationsScreen.tsx
