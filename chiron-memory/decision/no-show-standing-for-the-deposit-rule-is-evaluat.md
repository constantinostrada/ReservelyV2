---
id: 735c49b1-2065-40a5-9249-97394ab858f1-30
type: decision
title: No-show standing for the deposit rule is evaluated as of today (server time), never as of…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/booking.ts, apps/api/src/domain/reservations.ts
---
No-show standing for the deposit rule is evaluated as of today (server time), never as of the date being booked

## Why
the deposit is a condition of booking now, and the counting window can't sensibly be read from a future date that hasn't happened yet

## Where
apps/api/src/domain/booking.ts, apps/api/src/domain/reservations.ts
