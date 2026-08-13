---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-10
type: convention
title: Table identifiers are sorted with a numeric-aware comparator (byTable), not plain string…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
Table identifiers are sorted with a numeric-aware comparator (byTable), not plain string comparison

## Why
table ids are strings, so default sort would order them "11, 12, 3" instead of the expected "3, 5, 12"

## Learned
this same comparator was also adopted as the tie-break for reservations at the same time slot, replacing the prior plain string tie-break — a behavior change to note if same-time ordering looks different than before

## Where
apps/api/src/domain/reservations.ts
