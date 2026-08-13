---
id: 735c49b1-2065-40a5-9249-97394ab858f1-34
type: convention
title: Request parsing/validation for a new endpoint lives in its own module…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/routes/booking-request.ts, apps/api/src/domain/booking.ts
---
Request parsing/validation for a new endpoint lives in its own module (routes/booking-request.ts) that is deliberately kept ignorant of the domain rule, separate from the rule-gate module (domain/booking.ts) that weighs the parsed request against what the rule demands

## Why
keeps HTTP-shape concerns (missing fields, bad formats) decoupled from business-rule concerns (deposit owed vs offered) so each can change independently

## Where
apps/api/src/routes/booking-request.ts, apps/api/src/domain/booking.ts
