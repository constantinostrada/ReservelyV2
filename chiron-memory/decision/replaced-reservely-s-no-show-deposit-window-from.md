---
id: 735c49b1-2065-40a5-9249-97394ab858f1-18
type: decision
title: Replaced Reservely's no-show deposit window from a rolling N-month lookback to a count of…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (countingWindow/DEPOSIT rule)
---
Replaced Reservely's no-show deposit window from a rolling N-month lookback to a count of no-shows in the last N *completed* calendar months (current in-progress month excluded)

## Why
acceptance criteria required a stable, unambiguous count instead of a day-based rolling window that shifts depending on exact read time

## Learned
this makes the deposit rule lag the live book by up to a month — a no-show recorded today doesn't affect deposit status until the 1st of next month.

## Where
apps/api/src/domain/reservations.ts (countingWindow/DEPOSIT rule)
