---
id: 735c49b1-2065-40a5-9249-97394ab858f1-19
type: convention
title: When changing a rule's semantics, rename its config field (e.g. lookbackMonths →…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
When changing a rule's semantics, rename its config field (e.g. lookbackMonths → completedMonths) rather than keeping the old name

## Why
used deliberately as a forcing function so any stale/leftover reference to the old field fails the TypeScript build instead of silently computing the old behavior

## Where
apps/api/src/domain/reservations.ts
