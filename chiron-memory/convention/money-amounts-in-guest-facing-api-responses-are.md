---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-6
type: convention
title: Money amounts in guest-facing API responses are formatted as display strings (e.g.…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (money formatting) and apps/api/src/routes/reservations.ts
---
Money amounts in guest-facing API responses are formatted as display strings (e.g. "€60.00"), not raw minor-unit integers; the raw integer minor-unit value is kept only on internal/stored fields (e.g. depositTakenMinor).

## Where
apps/api/src/domain/reservations.ts (money formatting) and apps/api/src/routes/reservations.ts
