export default function GameTable({ gameState }) {
  const { hand, seating, currentTurn, round, scores } = gameState;

  return (
    <div style={{ padding: 30 }}>
      <h1>Seven Star 🃏</h1>

      <h3>Round: {round}</h3>
      <h3>
        TEAM 1: {scores.TEAM1} | TEAM 2: {scores.TEAM2}
      </h3>

      <h3>Players (Seating Order)</h3>
      <ol>
        {seating.map((p) => (
          <li key={p.id}>
            {p.name} ({p.team})
            {p.id === currentTurn && " ← TURN"}
          </li>
        ))}
      </ol>

      <h3>Your Hand</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {hand.map((card, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid black",
              padding: 10,
              width: 60,
              textAlign: "center"
            }}
          >
            <div>{card.color}</div>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
