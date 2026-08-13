# Reservely

Table reservations for a restaurant — booking a table for a party at a time,
and keeping track of the guests who don't show up.

## Running it

    npm install
    npm run dev:api     # http://localhost:3100
    npm run dev:web     # http://localhost:5180

The web client opens on the day's book, so if both are up you'll see today's
reservations.

## Layout

    apps/api    the service
      domain/   the rules — including the deposit rule
      data/     the book (in memory for now)
      routes/   what's exposed over HTTP
    apps/web    the client
      reservations/  the day's book

## The deposit rule

A guest owes a deposit when they have **2 or more no-shows in the last 6
months**; it's **€15 per head**. The rule lives in one place,
`apps/api/src/domain/reservations.ts`, and the API applies it before answering:
`GET /reservations` returns each line's verdict already decided, priced and
worded. The client is never given a guest's no-show history, so it can't reach
a different answer than the kitchen does.

Those numbers are a placeholder — no real policy has been set yet. Changing
them means changing `DEPOSIT_RULE` and nothing else.

## Still open

Where reservations are actually stored (`data/book.ts` is a stand-in seeded
against today), and how bookings are made rather than just read.
