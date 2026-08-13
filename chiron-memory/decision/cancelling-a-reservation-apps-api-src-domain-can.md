---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-18
type: decision
title: Cancelling a reservation (apps/api/src/domain/cancellation.ts, checkCancellation) has no…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/cancellation.ts.
---
Cancelling a reservation (apps/api/src/domain/cancellation.ts, checkCancellation) has no time-based restriction, unlike recording a no-show.

## Why
A table can be given back mid-service, so there's no equivalent to the no-show's sitting-time rule; cancellation only refuses already_cancelled and already_no_show states.

## Where
apps/api/src/domain/cancellation.ts.
