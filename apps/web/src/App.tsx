import { ReservationsScreen } from "./reservations/ReservationsScreen.js";

/**
 * The client.
 *
 * One screen so far — the day's book. The health check the skeleton carried is
 * gone: the book itself now proves the two halves are talking, and does it
 * while showing something worth looking at.
 */
export function App(): React.JSX.Element {
  return <ReservationsScreen />;
}
