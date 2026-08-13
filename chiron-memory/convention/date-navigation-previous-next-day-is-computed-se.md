---
id: 735c49b1-2065-40a5-9249-97394ab858f1-13
type: convention
title: Date navigation (previous/next day) is computed server-side and handed to the client as…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (DayBook neighbouring dates), apps/web/src/reservations/api.ts
---
Date navigation (previous/next day) is computed server-side and handed to the client as data, rather than the client doing its own date arithmetic.

## Why
follows the project's established principle that the client is given verdicts/derived values, never the inputs to recompute them itself.

## Where
apps/api/src/domain/reservations.ts (DayBook neighbouring dates), apps/web/src/reservations/api.ts
