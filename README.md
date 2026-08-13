# Reservely

Table reservations for a restaurant — booking a table for a party at a time,
and keeping track of the guests who don't show up.

## Running it

    npm install
    npm run dev:api     # http://localhost:3100
    npm run dev:web     # http://localhost:5180

The web client reads the API's health endpoint on load, so if both are up the
page says so.

## Layout

    apps/api    the service
    apps/web    the client

Nothing else is decided yet: how the domain is modelled, how the two talk, and
how anything is stored are open, and belong to the work that follows.
