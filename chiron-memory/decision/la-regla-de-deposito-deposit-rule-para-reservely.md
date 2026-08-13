---
id: 735c49b1-2065-40a5-9249-97394ab858f1-0
type: decision
title: La regla de depósito (deposit rule) para Reservely no estaba definida en…
tags: [decision]
created: 2026-08-13
resource: apps/api/src/domain/reservations.ts, constante DEPOSIT_RULE.
---
La regla de depósito (deposit rule) para Reservely no estaba definida en memoria/ontología del proyecto, así que se fijó como placeholder: 2+ no-shows en los últimos 6 meses → depósito de €15 por persona.

## Why
No existía ninguna fuente (memory_search, ontology_search, README) que definiera los números; se eligió ese umbral para calzar con el framing del README sobre guests que no se presentan.

## Learned
Falta confirmar estos valores con quien sea owner de la política de depósitos; al estar aislados en una única constante, cambiarlos es un cambio de una línea.

## Where
apps/api/src/domain/reservations.ts, constante DEPOSIT_RULE.
