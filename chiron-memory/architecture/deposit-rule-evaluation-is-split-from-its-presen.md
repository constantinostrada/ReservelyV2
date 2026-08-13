---
id: 735c49b1-2065-40a5-9249-97394ab858f1-27
type: architecture
title: Deposit rule evaluation is split from its presentation
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
Deposit rule evaluation is split from its presentation — `depositRequirement()` in domain/reservations.ts is the single source of truth returning full detail including minor-unit amounts, while `assessDeposit()` projects that into the display-only shape the UI already consumed

## Why
the write path (booking endpoint) needs minor units to verify what was actually collected, but the read model deliberately ships only formatted strings with no client-side arithmetic

## Learned
keep one evaluation function and project multiple shapes from it rather than duplicating rule logic per consumer.

## Where
apps/api/src/domain/reservations.ts
