---
id: 735c49b1-2065-40a5-9249-97394ab858f1-4
type: architecture
title: El API de Reservely para reservas se estructuró en tres capas
tags: [architecture]
created: 2026-08-13
resource: apps/api/src/{domain,data,routes}/.
---
El API de Reservely para reservas se estructuró en tres capas: domain/reservations.ts (tipos + regla de depósito + construcción del day book), data/book.ts (almacenamiento en memoria, standin de persistencia real), routes/reservations.ts (endpoint HTTP).

## Why
El repo era un esqueleto sin dominio; se decidió separar reglas de negocio, datos y transporte HTTP desde el principio en vez de meterlo todo en el route handler.

## Learned
Seguir este mismo split de capas al agregar nuevas features al API de Reservely.

## Where
apps/api/src/{domain,data,routes}/.
