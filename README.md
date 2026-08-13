# Reservely

Table reservations for a restaurant — booking a table for a party at a time,
and keeping track of the guests who don't show up.

## Running it

    npm install
    npm run dev:api     # http://localhost:3100
    npm run dev:web     # http://localhost:5180

The web client opens on the day's book, so if both are up you'll see today's
reservations. The arrows step a day either way.

## Layout

    apps/api    the service
      domain/   the rules — the deposit rule, and when a no-show may be recorded
      data/     guests and the book (in memory for now)
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

## No-shows

`POST /reservations/:id/no-show` records that a guest never arrived.

The record is filed **against the guest, not the reservation**. Guests are held
in their own collection and reservations point at them by id, so there is a
single history to write to — a no-show recorded on one booking counts towards
the deposit rule on every other booking in that guest's name, including ones
already in the book. Marking a missed table can therefore change a *different*
row on screen, which is why the endpoint answers with the whole rebuilt day
rather than the one line that changed.

It can only be recorded once the sitting has passed, and "passed" means the
date *and* time: a guest is a no-show when their table has come and gone, which
happens mid-service — waiting for the date to roll over would mean tonight's
empty tables couldn't be recorded until tomorrow. A future sitting is refused
with `409 not_yet_sat`, an already-marked one with `409 already_marked`.

The screen never makes that judgement itself. Each line carries a
`canMarkNoShow` flag from the API, which decides whether the control is live;
the flag is only a hint for rendering, since the clock moves on after the book
is fetched, and the write path checks again before accepting.

## Still open

Where reservations and guests are actually stored (`data/book.ts` is a stand-in
seeded against today and yesterday), how bookings are made rather than just
read, and undoing a no-show recorded by mistake.
