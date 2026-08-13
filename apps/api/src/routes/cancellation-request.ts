/**
 * Reading a cancellation off the wire.
 *
 * Only the reason to read, and like `booking-request.ts` this knows nothing of
 * when a booking may be called off — that is the rule's job, weighed after.
 */

/**
 * How much reason a cancellation may carry.
 *
 * A line on the book, not a report: enough to say who called it off and why,
 * short enough that whoever reads the day can take it in at a glance. Counted
 * after trimming, so surrounding whitespace never costs anyone the last words.
 */
export const REASON_MAX_LENGTH = 200;

export type ParsedCancellation =
  | { ok: true; reason: string | null }
  | { ok: false; message: string };

/**
 * Reads `{ reason }` off a cancellation request. The whole body is optional —
 * cancelling with nothing to say is the ordinary case, not a malformed one.
 *
 * Whitespace-only is `null` rather than an error: a blank box submitted is a
 * cancellation without a reason, which is something the book already knows how
 * to hold.
 */
export function parseCancellation(body: unknown): ParsedCancellation {
  if (body === undefined || body === null) return { ok: true, reason: null };

  if (typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "a cancellation object is required" };
  }

  const raw = (body as Record<string, unknown>)["reason"];
  if (raw === undefined || raw === null) return { ok: true, reason: null };

  if (typeof raw !== "string") return { ok: false, message: "reason must be text" };

  const reason = raw.trim();
  if (reason === "") return { ok: true, reason: null };

  if (reason.length > REASON_MAX_LENGTH) {
    return {
      ok: false,
      message: `reason must be ${REASON_MAX_LENGTH} characters or fewer, got ${reason.length}`,
    };
  }

  return { ok: true, reason };
}
