---
id: 735c49b1-2065-40a5-9249-97394ab858f1-35
type: convention
title: To verify a domain-layer refactor didn't leak into the frontend's read model, compare the…
tags: [convention]
created: 2026-08-13
resource: apps/api (build step), verified via `npm run build`
---
To verify a domain-layer refactor didn't leak into the frontend's read model, compare the built client bundle's output hash before and after the change instead of only inspecting the diff

## Why
confirmed `assessDeposit()`'s refactor left the UI-facing shape identical — bundle output was byte-identical across the change

## Where
apps/api (build step), verified via `npm run build`
