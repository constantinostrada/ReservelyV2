import { useEffect, useState } from "react";
import { fetchDayBook, type BookedReservation, type DayBook } from "./api.js";

/**
 * The reservations screen — the day's book.
 *
 * Everything on it comes from the API as-is: the sitting order, the totals,
 * and the deposit verdict on each line. The screen sorts nothing, counts
 * nothing and decides nothing; if a number looks wrong, it is wrong upstream.
 */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    padding: "3rem",
    lineHeight: 1.6,
    maxWidth: "60rem",
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
} satisfies Record<string, React.CSSProperties>;

/**
 * The deposit flag.
 *
 * Rendered inline on the guest's row rather than behind a click, so whoever is
 * working the book sees the deposit before they take the booking, not after.
 */
function DepositFlag({ reservation }: { reservation: BookedReservation }): React.JSX.Element {
  if (!reservation.deposit.required) {
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
        Deposit {reservation.deposit.amount}
      </span>
      <div style={{ ...styles.muted, fontSize: "0.8125rem" }}>{reservation.deposit.reason}</div>
    </div>
  );
}

function Book({ book }: { book: DayBook }): React.JSX.Element {
  if (book.reservations.length === 0) {
    return <p style={styles.muted}>Nothing in the book for this day.</p>;
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
          </tr>
        </thead>
        <tbody>
          {book.reservations.map((r) => (
            <tr key={r.id}>
              <td style={{ ...styles.td, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {r.time}
              </td>
              <td style={styles.td}>{r.table}</td>
              <td style={{ ...styles.td, fontVariantNumeric: "tabular-nums" }}>{r.partySize}</td>
              <td style={styles.td}>{r.guest.name}</td>
              <td style={styles.td}>
                <DepositFlag reservation={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ReservationsScreen(): React.JSX.Element {
  const [book, setBook] = useState<DayBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;

    fetchDayBook()
      .then((loaded) => live && setBook(loaded))
      .catch((cause: unknown) => {
        if (live) setError(cause instanceof Error ? cause.message : "The book couldn't be loaded.");
      });

    return () => {
      live = false;
    };
  }, []);

  return (
    <main style={styles.page}>
      <h1 style={{ margin: 0 }}>Reservations</h1>

      {error !== null ? (
        <p style={{ color: "#a12", marginTop: "1.5rem" }}>{error}</p>
      ) : book === null ? (
        <p style={styles.muted}>Loading the book…</p>
      ) : (
        <>
          <p style={styles.muted}>
            {book.label} · {book.summary.reservations} reservations · {book.summary.covers} covers
          </p>
          <Book book={book} />
        </>
      )}
    </main>
  );
}
