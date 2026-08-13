---
id: 735c49b1-2065-40a5-9249-97394ab858f1-29
type: decision
title: The booking endpoint requires the caller to state what deposit it collected…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/booking.ts
---
The booking endpoint requires the caller to state what deposit it collected (`amountMinor`); the server computes what was owed and rejects a mismatch (`deposit_short`) rather than silently adjusting, and also rejects a deposit offered when none is owed

## Why
silently discarding or adjusting money a caller believes it took would leave the books disagreeing with the till

## Where
apps/api/src/domain/booking.ts
