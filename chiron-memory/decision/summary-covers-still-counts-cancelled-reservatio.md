---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-22
type: decision
title: `summary.covers` still counts cancelled reservation lines, same as it already does for…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts, README.md (flagged as a point to revisit if covers is meant to be a live forecast).
---
`summary.covers` still counts cancelled reservation lines, same as it already does for no-shows; a new `summary.cancellations` counter was added instead of redefining `covers`.

## Why
`covers` represents what the day was booked at (a capacity/forecast number), not a live occupancy count — discounting cancelled tables would change its meaning, which is out of scope for this ticket.

## Where
apps/api/src/domain/reservations.ts, README.md (flagged as a point to revisit if covers is meant to be a live forecast).
