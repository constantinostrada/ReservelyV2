---
id: 735c49b1-2065-40a5-9249-97394ab858f1-36
type: architecture
title: A dedicated `Money` type and a single `money()` conversion helper were added to…
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts
---
A dedicated `Money` type and a single `money()` conversion helper were added to domain/reservations.ts so minor-units-in, formatted-string-out happens in exactly one place

## Why
needed once the write path required minor-unit amounts alongside the pre-existing display-only formatted strings, to avoid two separate formatting implementations drifting

## Where
apps/api/src/domain/reservations.ts
