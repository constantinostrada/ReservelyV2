import type { Reservation } from "./reservations.js";

/**
 * When a booking may be called off.
 *
 * Alongside `no-show.ts` and for the same reason: it guards a write, and the
 * conditions belong somewhere readable rather than inside a route handler.
 *
 * Note what is *not* a condition here — the time. A table can be given back an
 * hour before service or halfway through it, and the restaurant calling one off
 * mid-service is exactly the case worth recording. Where a no-show can only be
 * recorded looking backwards, a cancellation is refused only by what has
 * already become of the booking.
 */

export type CancellationRefusal = {
  ok: false;
  /** Machine-readable so callers can branch without matching on prose. */
  reason: "already_cancelled" | "already_no_show";
  message: string;
};

export type CancellationCheck = { ok: true } | CancellationRefusal;

/** Decides whether `reservation` can be cancelled as things stand. */
export function checkCancellation(reservation: Reservation): CancellationCheck {
  if (reservation.status === "cancelled") {
    return {
      ok: false,
      reason: "already_cancelled",
      message: "This reservation is already cancelled.",
    };
  }

  if (reservation.status === "no_show") {
    // The sitting has already been and gone unfilled. Cancelling it now would
    // rewrite what happened into what was planned, and would take a no-show
    // off a guest's record through a door meant for calling tables off.
    return {
      ok: false,
      reason: "already_no_show",
      message: "This reservation is recorded as a no-show and can't be cancelled.",
    };
  }

  return { ok: true };
}
