---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-0
type: decision
title: `DepositCheck.taken` now carries a `TakenDeposit` (`{ deposit, reason }`) instead of a…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/booking.ts
---
`DepositCheck.taken` now carries a `TakenDeposit` (`{ deposit, reason }`) instead of a bare `Money`.

## Why
the reason a deposit was taken must travel with the money itself rather than being re-derived later — the no-show rule's verdict can shift as the counting window rolls forward, but an amount already taken must not retroactively change its stated reason.

## Where
apps/api/src/domain/booking.ts
