---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-8
type: decision
title: The day's-book table filter is applied server-side (in buildDayBook and the GET/no-show…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts, apps/api/src/routes/reservations.ts
---
The day's-book table filter is applied server-side (in buildDayBook and the GET/no-show routes), not client-side in the React screen

## Why
client-side filtering would leave the summary counts (covers, deposits, no-shows) computed over the whole day while only filtered rows are shown; fixing that would force the screen to recompute domain aggregates itself, which breaks the convention that the screen stays storage/domain-agnostic and just renders what the API returns

## Where
apps/api/src/domain/reservations.ts, apps/api/src/routes/reservations.ts
