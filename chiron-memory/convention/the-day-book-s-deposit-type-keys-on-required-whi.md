---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-2
type: convention
title: The day book's `Deposit` type keys on `required` while the booking confirmation's…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (Deposit) vs apps/api/src/domain/booking.ts (DepositConfirmation)
---
The day book's `Deposit` type keys on `required` while the booking confirmation's `DepositConfirmation` type keys on `taken` — these are deliberately different shapes, not unified into one.

## Why
the day book states what the no-show rule currently demands of a guest right now, whereas the confirmation is a receipt for what was actually collected at booking time; the two can legitimately disagree once the counting window turns over (e.g. a no-show ages out of the 6-month window after the deposit was already taken).

## Where
apps/api/src/domain/reservations.ts (Deposit) vs apps/api/src/domain/booking.ts (DepositConfirmation)
