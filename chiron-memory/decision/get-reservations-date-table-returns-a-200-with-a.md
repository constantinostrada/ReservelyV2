---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-11
type: decision
title: GET /reservations?date=&table= returns a 200 with an empty reservation list (not a 404)…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts
---
GET /reservations?date=&table= returns a 200 with an empty reservation list (not a 404) when the requested table has no sittings on that date

## Why
the screen keeps the table filter active while navigating between dates, so "no sittings for this table on this date" is a normal, expected state rather than an error

## Where
apps/api/src/routes/reservations.ts
