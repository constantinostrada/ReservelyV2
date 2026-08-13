---
id: 735c49b1-2065-40a5-9249-97394ab858f1-7
type: decision
title: Se eliminó la pantalla placeholder de health-check que traía el skeleton de…
tags: [decision]
created: 2026-08-13
resource: apps/web/src/App.tsx.
---
Se eliminó la pantalla placeholder de health-check que traía el skeleton de `apps/web/src/App.tsx` y se reemplazó por `ReservationsScreen` como vista por defecto de la app.

## Why
El día completo renderizando datos reales de la API ya demuestra que ambas mitades (web+api) se comunican correctamente, dejando el health-check redundante.

## Learned
No hace falta mantener una pantalla de diagnóstico separada una vez que la feature principal cubre ese propósito end-to-end.

## Where
apps/web/src/App.tsx.
