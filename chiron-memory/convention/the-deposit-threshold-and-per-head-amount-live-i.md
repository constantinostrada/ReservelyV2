---
id: 735c49b1-2065-40a5-9249-97394ab858f1-31
type: convention
title: The deposit threshold and per-head amount live in a single `DEPOSIT_RULE` config object…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
The deposit threshold and per-head amount live in a single `DEPOSIT_RULE` config object in domain/reservations.ts, with no numeric threshold/money literals at any call site (route, booking gate, or UI)

## Why
satisfies the 'configurable, not hard-coded at the call site' acceptance criterion — verified experimentally by changing only DEPOSIT_RULE (threshold 1, €25/head) and confirming both the API and the existing screen's warnings moved together with zero other edits

## Learned
grepping call-site files for bare numeric literals is a cheap way to verify config isn't leaking out.

## Where
apps/api/src/domain/reservations.ts
