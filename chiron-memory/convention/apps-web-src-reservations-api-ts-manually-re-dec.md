---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-14
type: convention
title: apps/web/src/reservations/api.ts manually re-declares the API's response types (DayBook,…
tags: [convention]
created: 2026-08-13
resource: apps/web/src/reservations/api.ts
---
apps/web/src/reservations/api.ts manually re-declares the API's response types (DayBook, BookedReservation, etc.) rather than importing them from a shared package between apps/api and apps/web

## Why
there is no shared types package in the monorepo, so every field added server-side (like the new `tables`/`table` on DayBook) must be hand-mirrored in the client's api.ts or the client silently loses type safety on it

## Where
apps/web/src/reservations/api.ts
