---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-12
type: convention
title: POST /reservations/:id/no-show accepts the same ?table= query param as the GET day-book…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts
---
POST /reservations/:id/no-show accepts the same ?table= query param as the GET day-book endpoint, and returns the book rebuilt with that same filter applied

## Why
without it, marking a no-show while a table filter is active would return the unfiltered full-day book, causing the screen to silently lose its filter after the action

## Where
apps/api/src/routes/reservations.ts
