---
id: 735c49b1-2065-40a5-9249-97394ab858f1-1
type: convention
title: El contrato de la API modela el resultado del deposit rule como discriminated union…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (tipo Deposit), consumido en apps/web/src/reservations/api.ts.
---
El contrato de la API modela el resultado del deposit rule como discriminated union (`{required:false}` vs `{required:true, amount, reason}`) en vez de un flag más campos opcionales.

## Why
Esto fuerza a nivel de tipos que el cliente no pueda ni necesite recomputar el motivo o el monto — solo puede leer la rama que ya vino resuelta.

## Learned
Preferir discriminated unions sobre flags+opcionales cuando se quiere impedir recomputo client-side por diseño del tipo.

## Where
apps/api/src/domain/reservations.ts (tipo Deposit), consumido en apps/web/src/reservations/api.ts.
