import { socket } from "./socket";
import "./GameTable.css";

export default function GameTable({ gameState }) {
  const { hand, seating, currentTurn, round, scores, trick, starColor } = gameState;

  const playCard = (card) => {
    socket.emit("playCard", {
      roomCode: window.roomCode,
      card
    });
  };

  const getSuitSymbol = (color) => {
    const suitMap = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠"
    };
    return suitMap[color] || color;
  };

  const getCardClass = (color) => {
    return color.toLowerCase();
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-title">
          <h1>Seven Star 🃏</h1>
          <div className="star-info">
            <span className="star-label">⭐ STAR COLOR:</span>
            <span className={`star-value ${starColor?.toLowerCase() || ""}`}>
              {starColor || "None"}
            </span>
          </div>
        </div>
      </header>

      <div className="game-content">
        <div className="info-section">
          <div className="round-box">
            <p className="round-label">Round</p>
            <p className="round-number">{round}</p>
          </div>

          <div className="scores-box">
            <div className="team-score team-1">
              <p className="team-label">TEAM 1</p>
              <p className="score-value">{scores.TEAM1}</p>
            </div>
            <div className="vs">vs</div>
            <div className="team-score team-2">
              <p className="team-label">TEAM 2</p>
              <p className="score-value">{scores.TEAM2}</p>
            </div>
          </div>
        </div>

        <div className="game-board">
          <div className="table-section">
            <h2 className="section-title">Table Cards</h2>
            <div className="center-cards">
              {trick.length === 0 ? (
                <p className="empty-state">No cards played yet</p>
              ) : (
                trick.map((t, i) => (
                  <div
                    key={i}
                    className={`card ${getCardClass(t.card.color)}`}
                  >
                    <div className="card-value">{t.card.value}</div>
                    <div className="card-suit">{getSuitSymbol(t.card.color)}</div>
                    <div className="card-player">{t.playedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="players-section">
            <h2 className="section-title">Players</h2>
            <div className="players-list">
              {seating.map((p) => (
                <div
                  key={p.id}
                  className={`player-item ${
                    p.id === currentTurn ? "current-turn" : ""
                  }`}
                >
                  <div className="player-indicator">
                    {p.id === currentTurn && <span className="turn-badge">↪</span>}
                  </div>
                  <div className="player-info">
                    <p className="player-name">{p.name}</p>
                    <p className="player-status">
                      {p.id === currentTurn ? "Your Turn" : "Waiting"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hand-section">
          <h2 className="section-title">Your Hand</h2>
          <div className="hand-cards">
            {hand.length === 0 ? (
              <p className="empty-state">No cards in hand</p>
            ) : (
              hand.map((card, i) => (
                <button
                  key={i}
                  className={`card ${getCardClass(card.color)} card-button`}
                  onClick={() => playCard(card)}
                  title={`Play ${card.value} of ${card.color}`}
                >
                  <div className="card-value">{card.value}</div>
                  <div className="card-suit">{getSuitSymbol(card.color)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
