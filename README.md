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
completed calendar months**; it's **€15 per head**. The rule lives in one
place, `apps/api/src/domain/reservations.ts`, and the API applies it before
answering: `GET /reservations` returns each line's verdict already decided,
priced and worded. The client is never given a guest's no-show history, so it
can't reach a different answer than the kitchen does.

Those numbers are a placeholder — no real policy has been set yet. Changing
them means changing `DEPOSIT_RULE` and nothing else.

### Completed months, not a rolling window

The months counted are whole ones that have **finished**. Read on any day in
August 2026, the window is 1 February to 31 July: the same six months all
month long. The month in progress is not counted at all.

Two things follow, and they are the point of counting this way rather than
back-dating six months from today:

- A guest's standing holds steady through a service and through the month,
  instead of shifting by a day every day. Two people looking at the book a
  fortnight apart see the same verdict from the same history.
- **A no-show recorded this month does not bear on the rule until the month is
  out.** Mark a guest tonight and their deposit standing is unchanged; it
  changes on the 1st. The record is kept either way — it is deferred, not
  lost — but the deposit rule now lags the book by up to a month.

The wording the API sends names the closing month for exactly this reason
("2 no-shows in the 6 months to July 2026"): "the last 6 months" would be a
misleading way to describe a count that stops at the end of last month.

## Following one table

`GET /reservations?date=2026-08-13&table=12` narrows the book to a single
table's sittings; leave `table` off for the whole day. Each book carries the
day's `tables` — every table with a sitting that day — which is the list the
screen's filter is built from, and echoes back the `table` it was narrowed to.

The narrowing is done by the API, not by the screen, for the same reason
everything else here is: the totals in `summary` then describe the lines that
came with them. A screen that filtered its own rows would be showing one
table's sittings under the whole day's counts.

`tables` is always the whole day's, worked out before the filter is applied —
it is the choice of what to filter *to*, so narrowing the book must not narrow
it. The list survives stepping to a day the chosen table isn't sitting on,
which answers with an empty book rather than an error: the filter is held
across dates, and a table with nothing on it tonight is an ordinary question.

Marking a no-show takes the filter too (`POST /reservations/:id/no-show?table=12`),
so the rebuilt book that comes back is the one being read rather than the whole
day the screen had narrowed away from.

## Booking

`POST /reservations` takes a booking:

    { "date": "2026-08-20", "time": "19:30", "table": "12",
      "partySize": 4, "guestId": "gst_02",
      "deposit": { "amountMinor": 6000 } }

A guest at or over the no-show threshold must leave a deposit to book again.
Below it, `deposit` is left out and nothing is asked for; offering one anyway
is refused rather than ignored, so a caller that thinks it took money is never
told the booking succeeded as though it hadn't.

**The caller never sets the price.** `amountMinor` states what it *collected*,
in minor units; the API works out what was owed from `DEPOSIT_RULE` and refuses
anything that doesn't match. Refusals come back as `409` with a `reason` —
`deposit_required`, `deposit_short`, or `deposit_not_required` — and the sum
that should have been taken.

A guest's standing is read as of **today**, when the booking is taken, not as
of the date being booked: the deposit is a condition of booking now, and the
counting window can't be read from a date that hasn't happened yet.

The confirmation says what the deposit was and why:

    { "reservationId": "res_08",
      "deposit": { "taken": true, "amount": "€60.00",
                   "reason": "2 no-shows in the 6 months to July 2026",
                   "summary": "Deposit of €60.00 taken — 2 no-shows in the 6 months to July 2026." },
      "book": { ... } }

A booking that owed nothing gets `{ "taken": false, "summary": "No deposit was
taken — this booking didn't require one." }`. It is stated rather than left out:
a missing line reads as an oversight, and a guest charged nothing should see
that said as plainly as one who was charged. The wording comes from the API,
like every other verdict it sends.

What was collected is stored on the reservation in minor units
(`depositTakenMinor`) and formatted only on the way out. It is a record of what
happened, not something re-derived later — the rule's answer moves as the
counting window turns over, and a sum already taken does not.

The threshold and the rate live in `DEPOSIT_RULE` alone. The route holds no
numbers: it asks `depositRequirement` what is owed — the same call behind the
screen's warning — so the gate and the warning cannot drift apart.

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
