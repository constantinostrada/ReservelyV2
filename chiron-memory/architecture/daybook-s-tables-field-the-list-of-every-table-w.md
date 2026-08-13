---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-9
type: architecture
title: DayBook's `tables` field (the list of every table with a sitting that day, used to…
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (buildDayBook)
---
DayBook's `tables` field (the list of every table with a sitting that day, used to populate the filter dropdown) is computed before the table filter narrows the reservation list, not from the already-filtered rows

## Why
it is the source of the filter's own options — narrowing it first would make the currently selected table vanish from the dropdown once filtered

## Where
apps/api/src/domain/reservations.ts (buildDayBook)
