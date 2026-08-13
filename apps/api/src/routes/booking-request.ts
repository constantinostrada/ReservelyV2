/**
 * Reading a booking off the wire.
 *
 * Nothing here knows the deposit rule — it only establishes that the request
 * says what it needs to say. Note what it does *not* accept: the deposit's
 * amount is taken as a statement of what the caller collected, never as the
 * price. Working out the price is the rule's job, and the two are compared
 * afterwards.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export type BookingRequest = {
  date: string;
  time: string;
  table: string;
  partySize: number;
  guestId: string;
  /** Minor units the caller says it collected, or `null` if it collected none. */
  offeredMinor: number | null;
};

export type Parsed =
  | { ok: true; value: BookingRequest }
  | { ok: false; message: string };

function fieldOf(body: Record<string, unknown>, name: string): unknown {
  return body[name];
}

function stringField(
  body: Record<string, unknown>,
  name: string,
  pattern?: { re: RegExp; shape: string }
): string | { error: string } {
  const raw = fieldOf(body, name);
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: `${name} is required` };
  }
  if (pattern && !pattern.re.test(raw)) {
    return { error: `${name} must look like ${pattern.shape}, got "${raw}"` };
  }
  return raw;
}

function isError(v: unknown): v is { error: string } {
  return typeof v === "object" && v !== null && "error" in v;
}

/** Whole number, at least `least` — party sizes and money are both counted this way. */
function wholeAtLeast(value: unknown, least: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= least;
}

export function parseBookingRequest(body: unknown): Parsed {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, message: "a booking object is required" };
  }
  const fields = body as Record<string, unknown>;

  const date = stringField(fields, "date", { re: ISO_DATE, shape: "YYYY-MM-DD" });
  if (isError(date)) return { ok: false, message: date.error };

  const time = stringField(fields, "time", { re: CLOCK_TIME, shape: "HH:MM" });
  if (isError(time)) return { ok: false, message: time.error };

  const table = stringField(fields, "table");
  if (isError(table)) return { ok: false, message: table.error };

  const guestId = stringField(fields, "guestId");
  if (isError(guestId)) return { ok: false, message: guestId.error };

  const partySize = fieldOf(fields, "partySize");
  if (!wholeAtLeast(partySize, 1)) {
    return { ok: false, message: "partySize must be a whole number of one or more" };
  }

  const offered = parseOffer(fieldOf(fields, "deposit"));
  if (isError(offered)) return { ok: false, message: offered.error };

  return {
    ok: true,
    value: { date, time, table, guestId, partySize, offeredMinor: offered },
  };
}

/** `{ amountMinor }`, or nothing at all. */
function parseOffer(raw: unknown): number | null | { error: string } {
  if (raw === undefined || raw === null) return null;

  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "deposit must be an object with an amountMinor" };
  }

  const amountMinor = (raw as Record<string, unknown>)["amountMinor"];
  if (!wholeAtLeast(amountMinor, 0)) {
    return {
      error: "deposit.amountMinor must be a whole number of minor units (e.g. 6000 for €60.00)",
    };
  }

  return amountMinor;
}
