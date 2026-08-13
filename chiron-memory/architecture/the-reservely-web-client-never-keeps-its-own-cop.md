---
id: 735c49b1-2065-40a5-9249-97394ab858f1-22
type: architecture
title: The reservely web client never keeps its own copy of the deposit rule
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts is the single source; web app has no duplicate logic.
---
The reservely web client never keeps its own copy of the deposit rule — it only renders the reason string the API returns (e.g. "2 no-shows in the 6 months to July 2026")

## Why
verified by confirming the client bundle hash was byte-identical before and after the domain-side rule change, and grepping the bundle for the rule's wording/constants found nothing

## Where
apps/api/src/domain/reservations.ts is the single source; web app has no duplicate logic.
