---
id: 735c49b1-2065-40a5-9249-97394ab858f1-26
type: architecture
title: Building the deposit rule required first creating the reservation-creation flow itself…
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts, apps/api/src/routes/booking-request.ts
---
Building the deposit rule required first creating the reservation-creation flow itself (`POST /reservations`), since only reading the book and marking no-shows existed before

## Why
the task assumed a 'booking flow' to wire the rule into, but no endpoint created reservations yet

## Learned
verify a flow actually exists before assuming a task is a pure rule-change.

## Where
apps/api/src/routes/reservations.ts, apps/api/src/routes/booking-request.ts
