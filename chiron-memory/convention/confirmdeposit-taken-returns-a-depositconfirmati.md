---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-1
type: convention
title: `confirmDeposit(taken)` returns a `DepositConfirmation` union
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/booking.ts
---
`confirmDeposit(taken)` returns a `DepositConfirmation` union — `{ taken: true, amount, reason, summary }` or `{ taken: false, summary }` — and both arms always include a `summary` string.

## Why
so a booking with no deposit states that explicitly instead of the field being silently absent.

## Where
apps/api/src/domain/booking.ts
