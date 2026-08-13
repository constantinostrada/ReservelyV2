---
id: 735c49b1-2065-40a5-9249-97394ab858f1-6
type: architecture
title: `ReservationsScreen.tsx` presenta la tabla de reservas con columnas…
tags: [architecture]
created: 2026-08-13
resource: apps/web/src/reservations/ReservationsScreen.tsx.
---
`ReservationsScreen.tsx` presenta la tabla de reservas con columnas mesa/hora/comensales/guest, y muestra el flag de depósito como badge inline en la fila del guest más un banner arriba que cuenta cuántos depósitos se requieren en el día.

## Why
Cumple los criterios de aceptación 1 y 2 (listar mesa/hora/tamaño de grupo, y que el depósito sea visible antes del booking) con un patrón de badge+banner en vez de una columna separada o un modal.

## Learned
Mantener este patrón (badge en la fila + banner de conteo) si se agregan otros flags de guest a futuro, para consistencia visual.

## Where
apps/web/src/reservations/ReservationsScreen.tsx.
