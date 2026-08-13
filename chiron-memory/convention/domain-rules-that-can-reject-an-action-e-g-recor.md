---
id: 735c49b1-2065-40a5-9249-97394ab858f1-10
type: convention
title: Domain rules that can reject an action (e.g. recording a no-show) return a…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/no-show.ts
---
Domain rules that can reject an action (e.g. recording a no-show) return a machine-readable reason code (`not_yet_sat`, `already_marked`) alongside the message, instead of only prose.

## Why
lets the route/client branch on the reason without parsing error text, and keeps the refusal wording centralized in the domain layer.

## Learned
pairs with the project's existing uniform error contract — the reason code is the 'why', the message is what's shown.

## Where
apps/api/src/domain/no-show.ts
