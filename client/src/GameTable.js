import { socket } from "./socket";

export default function GameTable({ gameState }) {
  const { hand, seating, currentTurn, round, scores, trick } = gameState;

  const playCard = (card) => {
    socket.emit("playCard", {
      roomCode: window.roomCode,
      card
    });
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Seven Star 🃏</h1>

      <h3>Round {round}</h3>
      <h3>
        TEAM 1: {scores.TEAM1} | TEAM 2: {scores.TEAM2}
      </h3>

      <h4>Turn Order</h4>
      <ul>
        {seating.map((p) => (
          <li key={p.id}>
            {p.name} {p.id === currentTurn && "← TURN"}
          </li>
        ))}
      </ul>

      <h4>Center Cards</h4>
      <div style={{ display: "flex", gap: 10 }}>
        {trick.map((t, i) => (
          <div key={i}>
            {t.card.color} {t.card.value}
          </div>
        ))}
      </div>

      <h4>Your Hand</h4>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {hand.map((card, i) => (
          <button key={i} onClick={() => playCard(card)}>
            {card.color} {card.value}
          </button>
        ))}
      </div>
    </div>
  );
}
