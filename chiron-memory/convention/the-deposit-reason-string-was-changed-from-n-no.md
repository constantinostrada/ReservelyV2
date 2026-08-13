---
id: 735c49b1-2065-40a5-9249-97394ab858f1-23
type: convention
title: The deposit reason string was changed from "N no-shows in the last 6 months" to "N…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
The deposit reason string was changed from "N no-shows in the last 6 months" to "N no-shows in the 6 months to <month name>"

## Why
the old rolling-window phrasing became misleading once the count stops at the end of last month rather than a sliding cutoff; this string is the only part of the rule exposed to the client, so wording must track the semantics exactly

## Where
apps/api/src/domain/reservations.ts
