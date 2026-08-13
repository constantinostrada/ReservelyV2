---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-3
type: architecture
title: The `POST /reservations` 201 response replaced `depositTaken
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/routes/reservations.ts; the stored `depositTakenMinor` field on the reservation record itself is unchanged.
---
The `POST /reservations` 201 response replaced `depositTaken: Money | null` with `deposit: DepositConfirmation`, a worded guest-facing verdict rather than a raw nullable amount.

## Why
acceptance criteria required stating the amount, the reason, and an explicit "no deposit" line rather than an absent field.

## Where
apps/api/src/routes/reservations.ts; the stored `depositTakenMinor` field on the reservation record itself is unchanged.
