---
id: 682672fd-80e6-4a0e-b271-23248d7456d4-21
type: decision
title: Cancelling a reservation does not touch depositTakenMinor and does not write anything to…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/data/book.ts (recordCancellation), README.md.
---
Cancelling a reservation does not touch depositTakenMinor and does not write anything to the guest's history.

## Why
There's no refund policy defined yet, and a cancellation shouldn't count as a mark against the guest the way a no-show does; this was a judgment call flagged in the README rather than a spec'd requirement.

## Where
apps/api/src/data/book.ts (recordCancellation), README.md.
