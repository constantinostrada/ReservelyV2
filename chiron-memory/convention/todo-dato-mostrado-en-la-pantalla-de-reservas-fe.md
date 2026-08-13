---
id: 735c49b1-2065-40a5-9249-97394ab858f1-2
type: convention
title: Todo dato mostrado en la pantalla de reservas (fecha en formato humano, montos de…
tags: [convention]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts (helpers como money() y el label de fecha), apps/web/src/reservations/ReservationsScreen.tsx.
---
Todo dato mostrado en la pantalla de reservas (fecha en formato humano, montos de depósito, totales del día) llega pre-formateado desde la API; el cliente no reformatea nada.

## Why
Criterio de aceptación explícito: "the screen displays what the API returns and recomputes none of it".

## Learned
Cuando una pantalla debe ser un espejo puro del backend, mover el formateo (fechas, moneda) al servidor evita duplicar lógica y previene drift entre cliente y servidor.

## Where
apps/api/src/domain/reservations.ts (helpers como money() y el label de fecha), apps/web/src/reservations/ReservationsScreen.tsx.
