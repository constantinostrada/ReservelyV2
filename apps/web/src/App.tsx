import { useEffect, useState } from "react";

/**
 * The client.
 *
 * All it does is prove the two halves are talking. Everything a person would
 * actually come here for is still to be built.
 */
export function App(): React.JSX.Element {
  const [health, setHealth] = useState<"checking" | "up" | "down">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? setHealth("up") : setHealth("down")))
      .catch(() => setHealth("down"));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", lineHeight: 1.6 }}>
      <h1 style={{ margin: 0 }}>Reservely</h1>
      <p style={{ color: "#666" }}>Table reservations, and the guests who don't show up.</p>
      <p>
        API:{" "}
        {health === "checking" ? "checking…" : health === "up" ? "reachable" : "not reachable"}
      </p>
    </main>
  );
}
