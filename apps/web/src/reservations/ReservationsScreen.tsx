import { useCallback, useEffect, useState } from "react";
import {
  cancelReservation,
  fetchDayBook,
  markNoShow,
  REASON_MAX_LENGTH,
  type BookedReservation,
  type DayBook,
} from "./api.js";

/**
 * The reservations screen — the day's book.
 *
 * Everything on it comes from the API as-is: the sitting order, the totals,
 * the deposit verdict on each line, and whether a no-show may be recorded
 * against it. The screen sorts nothing, counts nothing and decides nothing; if
 * a number looks wrong, it is wrong upstream.
 */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    padding: "3rem",
    lineHeight: 1.6,
    maxWidth: "64rem",
    margin: "0 auto",
    color: "#1a1a1a",
  },
  muted: { color: "#666" },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "1.5rem",
  },
  th: {
    textAlign: "left" as const,
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#666",
    fontWeight: 600,
    padding: "0 0.75rem 0.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  td: {
    padding: "0.85rem 0.75rem",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top" as const,
  },
  notice: {
    marginTop: "1.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    background: "#fff8e6",
    border: "1px solid #f0d69a",
  },
  problem: {
    marginTop: "1.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.375rem",
    background: "#fdeceb",
    border: "1px solid #f0b3ae",
    color: "#8a1d13",
  },
  step: {
    font: "inherit",
    padding: "0.25rem 0.7rem",
    borderRadius: "0.375rem",
    border: "1px solid #d0d0d0",
    background: "#fff",
    cursor: "pointer",
  },
  select: {
    font: "inherit",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d0d0d0",
    background: "#fff",
    cursor: "pointer",
  },
  input: {
    font: "inherit",
    fontSize: "0.8125rem",
    padding: "0.3rem 0.5rem",
    borderRadius: "0.375rem",
    border: "1px solid #d0d0d0",
    width: "100%",
    minWidth: "11rem",
    boxSizing: "border-box" as const,
  },
  note: { color: "#666", fontSize: "0.8125rem", marginTop: "0.15rem" },
} satisfies Record<string, React.CSSProperties>;

/** The pill both finished states are shown as, told apart by weight of colour. */
function badge(background: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "0.125rem 0.5rem",
    borderRadius: "999px",
    background,
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 600,
  };
}

/** The value standing for "no filter" — `<option>` values can only be strings. */
const ALL_TABLES = "";

/**
 * The table filter.
 *
 * The tables offered are the day's own, listed by the API; the screen doesn't
 * gather them from the rows it happens to be showing, which would leave the
 * list collapsing to one entry as soon as a table was picked.
 */
function TableFilter({
  book,
  onChange,
}: {
  book: DayBook;
  onChange: (table: string | null) => void;
}): React.JSX.Element | null {
  if (book.tables.length === 0 && book.table === null) return null;

  // The filter holds while stepping between days, so the table being shown may
  // have no sittings on this one. It stays on the list regardless — dropping it
  // would leave the control blank while plainly still filtering.
  const offered =
    book.table !== null && !book.tables.includes(book.table)
      ? [book.table, ...book.tables]
      : book.tables;

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ ...styles.muted, fontSize: "0.875rem" }}>Table</span>
      <select
        style={styles.select}
        value={book.table ?? ALL_TABLES}
        onChange={(e) => onChange(e.target.value === ALL_TABLES ? null : e.target.value)}
      >
        <option value={ALL_TABLES}>All tables</option>
        {offered.map((table) => (
          <option key={table} value={table}>
            {table}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * The deposit flag.
 *
 * Rendered inline on the guest's row rather than behind a click, so whoever is
 * working the book sees the deposit before they take the booking, not after.
 */
function DepositFlag({ deposit }: { deposit: BookedReservation["deposit"] }): React.JSX.Element {
  if (!deposit.required) {
    return <span style={{ ...styles.muted, fontSize: "0.875rem" }}>—</span>;
  }

  return (
    <div>
      <span
        style={{
          display: "inline-block",
          padding: "0.125rem 0.5rem",
          borderRadius: "999px",
          background: "#8a3d00",
          color: "#fff",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        Deposit {deposit.amount}
      </span>
      <div style={{ ...styles.muted, fontSize: "0.8125rem" }}>{deposit.reason}</div>
    </div>
  );
}

/**
 * What became of one line, and what can still be done to it.
 *
 * Whether either control can be pressed is the API's answer — `canMarkNoShow`
 * and `canCancel` — never a comparison the screen makes against its own clock
 * or its own reading of the status. Both endpoints weigh the same rules again
 * on the way in; these flags only decide what is worth offering.
 *
 * A cancelled line shows the reason it was given underneath, as it was typed.
 */
function ArrivalCell({
  reservation,
  busy,
  cancelReason,
  onMark,
  onOpenCancel,
  onChangeReason,
  onConfirmCancel,
  onDismissCancel,
}: {
  reservation: BookedReservation;
  busy: boolean;
  /** The reason being typed, or `null` when the box isn't open on this line. */
  cancelReason: string | null;
  onMark: () => void;
  onOpenCancel: () => void;
  onChangeReason: (reason: string) => void;
  onConfirmCancel: () => void;
  onDismissCancel: () => void;
}): React.JSX.Element {
  if (reservation.status === "no_show") {
    return <span style={badge("#3a3a3a")}>No-show</span>;
  }

  if (reservation.status === "cancelled") {
    return (
      <div>
        <span style={badge("#6b6b6b")}>Cancelled</span>
        {reservation.cancellationReason !== null && (
          <div style={styles.note}>{reservation.cancellationReason}</div>
        )}
      </div>
    );
  }

  if (cancelReason !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <input
          autoFocus
          value={cancelReason}
          maxLength={REASON_MAX_LENGTH}
          placeholder="Reason (optional)"
          aria-label={`Why ${reservation.guest.name}'s table is being called off`}
          onChange={(e) => onChangeReason(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirmCancel();
            if (e.key === "Escape") onDismissCancel();
          }}
          style={styles.input}
        />
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {/* Named for what it does, not for the word on the control that
              opened it — "Cancel" next to "Back" is a coin toss. */}
          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={busy}
            style={{ ...styles.step, fontSize: "0.8125rem" }}
          >
            {busy ? "Cancelling…" : "Cancel booking"}
          </button>
          <button
            type="button"
            onClick={onDismissCancel}
            disabled={busy}
            style={{ ...styles.step, fontSize: "0.8125rem", color: "#666" }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={onMark}
        disabled={!reservation.canMarkNoShow || busy}
        title={
          reservation.canMarkNoShow
            ? `Record ${reservation.guest.name} as a no-show`
            : "The sitting hasn't passed yet"
        }
        style={{
          ...styles.step,
          cursor: reservation.canMarkNoShow && !busy ? "pointer" : "not-allowed",
          color: reservation.canMarkNoShow ? "#1a1a1a" : "#aaa",
          fontSize: "0.8125rem",
        }}
      >
        {busy ? "Recording…" : "Mark no-show"}
      </button>
      <button
        type="button"
        onClick={onOpenCancel}
        disabled={!reservation.canCancel || busy}
        title={`Call off ${reservation.guest.name}'s table`}
        style={{
          ...styles.step,
          cursor: reservation.canCancel && !busy ? "pointer" : "not-allowed",
          color: reservation.canCancel ? "#1a1a1a" : "#aaa",
          fontSize: "0.8125rem",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function Book({
  book,
  busy,
  cancelling,
  onMark,
  onOpenCancel,
  onChangeReason,
  onConfirmCancel,
  onDismissCancel,
}: {
  book: DayBook;
  /** The line with a write in flight, if any. */
  busy: string | null;
  /** The line whose cancellation box is open, and what has been typed in it. */
  cancelling: { id: string; reason: string } | null;
  onMark: (id: string) => void;
  onOpenCancel: (id: string) => void;
  onChangeReason: (reason: string) => void;
  onConfirmCancel: () => void;
  onDismissCancel: () => void;
}): React.JSX.Element {
  if (book.reservations.length === 0) {
    return (
      <p style={styles.muted}>
        {book.table === null
          ? "Nothing in the book for this day."
          : `Nothing on table ${book.table} this day.`}
      </p>
    );
  }

  return (
    <>
      {book.summary.depositsRequired > 0 && (
        <p style={styles.notice}>
          <strong>
            {book.summary.depositsRequired} of {book.summary.reservations}
          </strong>{" "}
          {book.summary.depositsRequired === 1 ? "guest owes" : "guests owe"} a deposit before
          booking.
        </p>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Table</th>
            <th style={styles.th}>Party</th>
            <th style={styles.th}>Guest</th>
            <th style={styles.th}>Deposit</th>
            <th style={styles.th}>Arrival</th>
          </tr>
        </thead>
        <tbody>
          {book.reservations.map((r) => (
            <tr key={r.id} style={r.status === "booked" ? undefined : { background: "#fafafa" }}>
              <td style={{ ...styles.td, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {r.time}
              </td>
              <td style={styles.td}>{r.table}</td>
              <td style={{ ...styles.td, fontVariantNumeric: "tabular-nums" }}>{r.partySize}</td>
              <td style={styles.td}>{r.guest.name}</td>
              <td style={styles.td}>
                <DepositFlag deposit={r.deposit} />
              </td>
              <td style={styles.td}>
                <ArrivalCell
                  reservation={r}
                  busy={busy === r.id}
                  cancelReason={cancelling?.id === r.id ? cancelling.reason : null}
                  onMark={() => onMark(r.id)}
                  onOpenCancel={() => onOpenCancel(r.id)}
                  onChangeReason={onChangeReason}
                  onConfirmCancel={onConfirmCancel}
                  onDismissCancel={onDismissCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ReservationsScreen(): React.JSX.Element {
  /** The day being viewed; `null` means "today", which the API resolves. */
  const [date, setDate] = useState<string | null>(null);
  /** The table being watched; `null` is the whole day. Held apart from the
   * date, so stepping days keeps the table and changing table keeps the day. */
  const [table, setTable] = useState<string | null>(null);
  const [book, setBook] = useState<DayBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The line with a write in flight — either kind, only ever one at a time. */
  const [busy, setBusy] = useState<string | null>(null);
  /** The line being called off, and the reason as it's being typed. */
  const [cancelling, setCancelling] = useState<{ id: string; reason: string } | null>(null);

  useEffect(() => {
    let live = true;
    setBook(null);
    setError(null);
    // These rows are on their way out; a box open on one of them isn't about
    // any line in the book that replaces them.
    setCancelling(null);

    fetchDayBook(date, table)
      .then((loaded) => live && setBook(loaded))
      .catch((cause: unknown) => {
        if (live) setError(messageFor(cause, "The book couldn't be loaded."));
      });

    return () => {
      live = false;
    };
  }, [date, table]);

  const onMark = useCallback(
    (id: string) => {
      setBusy(id);
      setError(null);

      // The filter goes with it, so what comes back is the book being read.
      markNoShow(id, table)
        // The API answers with the rebuilt day, so a guest who has just crossed
        // the deposit threshold shows it on their other bookings straight away.
        .then(setBook)
        .catch((cause: unknown) => setError(messageFor(cause, "The no-show couldn't be recorded.")))
        .finally(() => setBusy(null));
    },
    [table]
  );

  const onConfirmCancel = useCallback(() => {
    if (cancelling === null) return;
    const { id, reason } = cancelling;

    setBusy(id);
    setError(null);

    // An empty box is a cancellation with nothing said, not an empty reason.
    cancelReservation(id, reason.trim() === "" ? null : reason, table)
      .then((rebuilt) => {
        setBook(rebuilt);
        setCancelling(null);
      })
      .catch((cause: unknown) =>
        // The box stays open, holding what was typed, so a refusal doesn't cost
        // whoever is working the book the words they had already found.
        setError(messageFor(cause, "The cancellation couldn't be recorded."))
      )
      .finally(() => setBusy(null));
  }, [cancelling, table]);

  return (
    <main style={styles.page}>
      <h1 style={{ margin: 0 }}>Reservations</h1>

      {book !== null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            margin: "1rem 0",
          }}
        >
          <button type="button" style={styles.step} onClick={() => setDate(book.previousDate)}>
            ‹
          </button>
          <button type="button" style={styles.step} onClick={() => setDate(book.nextDate)}>
            ›
          </button>
          <TableFilter book={book} onChange={setTable} />
          <span style={styles.muted}>
            {book.label} · {book.summary.reservations} reservations · {book.summary.covers} covers
            {book.summary.noShows > 0 && ` · ${book.summary.noShows} no-shows`}
            {book.summary.cancellations > 0 && ` · ${book.summary.cancellations} cancelled`}
            {book.table !== null && ` · table ${book.table} only`}
          </span>
        </div>
      )}

      {error !== null && <p style={styles.problem}>{error}</p>}

      {book === null ? (
        error === null ? (
          <p style={styles.muted}>Loading the book…</p>
        ) : null
      ) : (
        <Book
          book={book}
          busy={busy}
          cancelling={cancelling}
          onMark={onMark}
          onOpenCancel={(id) => setCancelling({ id, reason: "" })}
          onChangeReason={(reason) =>
            setCancelling((open) => (open === null ? null : { ...open, reason }))
          }
          onConfirmCancel={onConfirmCancel}
          onDismissCancel={() => setCancelling(null)}
        />
      )}
    </main>
  );
}

function messageFor(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}
