---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-20
type: convention
title: Cancellation reason parsing (apps/api/src/routes/cancellation-request.ts) trims the…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/routes/cancellation-request.ts.
---
Cancellation reason parsing (apps/api/src/routes/cancellation-request.ts) trims the input, caps it at REASON_MAX_LENGTH = 200 chars measured after trimming, and converts a whitespace-only string to `null` rather than rejecting it.

## Why
Mirrors the existing booking-request.ts pattern of keeping the request parser ignorant of domain rules while normalizing free text consistently.

## Where
apps/api/src/routes/cancellation-request.ts.
