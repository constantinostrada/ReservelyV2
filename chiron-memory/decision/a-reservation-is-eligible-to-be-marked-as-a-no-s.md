---
id: 735c49b1-2065-40a5-9249-97394ab858f1-9
type: decision
title: A reservation is eligible to be marked as a no-show based on comparing 'now' against the…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/no-show.ts, apps/api/src/domain/reservations.ts (sittingTime)
---
A reservation is eligible to be marked as a no-show based on comparing 'now' against the reservation's actual date+time (has the sitting passed), not just comparing calendar dates.

## Why
a sitting passes mid-service; date-only comparison would make tonight's already-past sittings unmarkable until the next calendar day, which doesn't match how a restaurant actually operates.

## Learned
verified concretely that same-day sittings split correctly — an earlier-today sitting is markable while a later-today sitting is refused with reason not_yet_sat.

## Where
apps/api/src/domain/no-show.ts, apps/api/src/domain/reservations.ts (sittingTime)
