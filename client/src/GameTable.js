import { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import "./GameTable.css";

export default function GameTable({ gameState }) {
  const {
    hand,
    seating,
    currentTurn,
    round,
    scores,
    trick,
    starColor,
    lastRoundResult,
  } = gameState;

  const [roundToast, setRoundToast] = useState(null);
  const [lastSeenRound, setLastSeenRound] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Listen for error messages inline
  useEffect(() => {
    const handleError = (msg) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    };
    socket.on("errorMessage", handleError);
    return () => socket.off("errorMessage", handleError);
  }, []);

  // Show round result toast for 4 seconds
  useEffect(() => {
    if (lastRoundResult && lastRoundResult.round !== lastSeenRound) {
      setLastSeenRound(lastRoundResult.round);
      setRoundToast(lastRoundResult);
      const timer = setTimeout(() => setRoundToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastRoundResult, lastSeenRound]);

  const myId = socket.id;
  const isMyTurn = currentTurn === myId;
  const isLeadPlayer = trick.length === 0 && isMyTurn;

  const getPlayerName = useCallback(
    (playerId) => {
      const player = seating.find((p) => p.id === playerId);
      return player?.name || "Unknown";
    },
    [seating]
  );

  const playCard = (card) => {
    if (!isMyTurn) return;
    socket.emit("playCard", {
      roomCode: window.roomCode,
      card,
    });
  };

  // Map colors to display values
  const colorConfig = {
    R: { label: "Red", symbol: "🔴", className: "color-red" },
    B: { label: "Blue", symbol: "🔵", className: "color-blue" },
    G: { label: "Green", symbol: "🟢", className: "color-green" },
    Y: { label: "Yellow", symbol: "🟡", className: "color-yellow" },
  };

  const getColorClass = (color) => colorConfig[color]?.className || "";
  const getColorSymbol = (color) => colorConfig[color]?.symbol || color;
  const getColorLabel = (color) => colorConfig[color]?.label || color;

  // Get spatial positions for the 4 players
  // My seat index → I'm always at bottom
  const myIndex = seating.findIndex((p) => p.id === myId);
  const getPositionedPlayers = () => {
    if (myIndex === -1) return { top: null, left: null, right: null, bottom: null };
    const order = [0, 1, 2, 3].map((offset) => seating[(myIndex + offset) % 4]);
    return {
      bottom: order[0], // me
      left: order[1],
      top: order[2], // teammate (opposite)
      right: order[3],
    };
  };

  const positioned = getPositionedPlayers();

  // Render a player seat
  const renderSeat = (player, position) => {
    if (!player) return null;
    const isCurrent = player.id === currentTurn;
    const isMe = player.id === myId;
    const isTeammate =
      seating.find((p) => p.id === myId)?.team === player.team && !isMe;

    // Get this player's played card in trick
    const playedCard = trick.find((t) => t.playerId === player.id);

    return (
      <div
        className={`seat seat-${position} ${isCurrent ? "seat-active" : ""} ${
          isMe ? "seat-me" : ""
        } ${isTeammate ? "seat-teammate" : ""}`}
      >
        <div className={`seat-avatar ${isCurrent ? "avatar-glow" : ""}`}>
          <span className="avatar-letter">{player.name[0]?.toUpperCase()}</span>
          {isCurrent && <div className="avatar-pulse" />}
        </div>
        <div className="seat-name">
          {player.name}
          {isMe && <span className="you-tag">YOU</span>}
        </div>
        <div className="seat-team-badge">{player.team}</div>
        {isCurrent && (
          <div className="turn-indicator">
            {isMe ? "🎯 Your Turn!" : "⏳ Playing..."}
          </div>
        )}
        {isLeadPlayer && isMe && isCurrent && (
          <div className="lead-badge">👑 LEAD</div>
        )}
        {/* Played card floating near this seat */}
        {playedCard && (
          <div
            className={`seat-played-card ${getColorClass(
              playedCard.card.color
            )} card-enter`}
          >
            <span className="played-card-value">{playedCard.card.value}</span>
            <span className="played-card-color">
              {getColorSymbol(playedCard.card.color)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-container">
      {/* ── Round Result Toast ── */}
      {roundToast && (
        <div className="round-toast toast-enter">
          <div className="toast-icon">🏆</div>
          <div className="toast-body">
            <div className="toast-title">
              Round {roundToast.round} Winner!
            </div>
            <div className="toast-detail">
              <strong>{roundToast.winnerName}</strong> ({roundToast.winnerTeam})
              won with{" "}
              <span
                className={`inline-card ${getColorClass(
                  roundToast.winningCard.color
                )}`}
              >
                {roundToast.winningCard.value}{" "}
                {getColorSymbol(roundToast.winningCard.color)}
              </span>
            </div>
            <div className="toast-next">
              {roundToast.winnerName} starts the next round →
            </div>
          </div>
          <div className="toast-progress" />
        </div>
      )}

      {/* ── Error Toast ── */}
      {errorMsg && (
        <div className="error-toast toast-enter">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* ── Header ── */}
      <header className="game-header">
        <div className="header-left">
          <h1 className="game-title">
            Seven Star <span className="title-star">⭐</span>
          </h1>
        </div>
        <div className="header-center">
          <div className="round-pill">
            <span className="round-label">Round</span>
            <span className="round-number">{round}</span>
            <span className="round-total">/ 15</span>
          </div>
        </div>
        <div className="header-right">
          <div className="star-display">
            <span className="star-label">Star Color</span>
            {starColor ? (
              <span className={`star-chip ${getColorClass(starColor)}`}>
                {getColorSymbol(starColor)} {getColorLabel(starColor)}
              </span>
            ) : (
              <span className="star-chip star-none">None</span>
            )}
          </div>
        </div>
      </header>

      {/* ── Scoreboard ── */}
      <div className="scoreboard">
        <div className="score-team score-team1">
          <span className="score-label">TEAM 1</span>
          <span className="score-num">{scores.TEAM1}</span>
        </div>
        <div className="score-divider">
          <span className="score-vs">VS</span>
        </div>
        <div className="score-team score-team2">
          <span className="score-label">TEAM 2</span>
          <span className="score-num">{scores.TEAM2}</span>
        </div>
      </div>

      {/* ── Game Table (Spatial Layout) ── */}
      <div className="table-arena">
        {/* Top player (teammate / opposite) */}
        <div className="arena-top">{renderSeat(positioned.top, "top")}</div>

        {/* Middle row: Left - Center Table - Right */}
        <div className="arena-middle">
          <div className="arena-left">
            {renderSeat(positioned.left, "left")}
          </div>

          <div className="table-center">
            <div className="table-felt">
              {trick.length === 0 && !roundToast ? (
                <div className="center-empty">
                  {isMyTurn ? (
                    <span className="play-prompt">
                      {isLeadPlayer
                        ? "👑 You lead — play any card!"
                        : "Pick a card to play"}
                    </span>
                  ) : (
                    <span className="waiting-text">
                      Waiting for{" "}
                      <strong>{getPlayerName(currentTurn)}</strong>...
                    </span>
                  )}
                </div>
              ) : (
                <div className="center-cards">
                  {trick.map((t, i) => (
                    <div
                      key={i}
                      className={`table-card ${getColorClass(
                        t.card.color
                      )} card-enter`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="table-card-value">{t.card.value}</div>
                      <div className="table-card-color">
                        {getColorSymbol(t.card.color)}
                      </div>
                      <div className="table-card-owner">
                        {getPlayerName(t.playerId)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="arena-right">
            {renderSeat(positioned.right, "right")}
          </div>
        </div>

        {/* Bottom player (YOU) */}
        <div className="arena-bottom">
          {renderSeat(positioned.bottom, "bottom")}
        </div>
      </div>

      {/* ── Your Hand ── */}
      <div className="hand-section">
        <div className="hand-header">
          <h2 className="hand-title">Your Hand</h2>
          <span className="hand-count">{hand.length} cards</span>
        </div>
        <div className="hand-cards">
          {hand.length === 0 ? (
            <p className="empty-hand">No cards remaining</p>
          ) : (
            hand.map((card, i) => (
              <button
                key={`${card.color}-${card.value}-${i}`}
                className={`hand-card ${getColorClass(card.color)} ${
                  isMyTurn ? "card-playable" : "card-disabled"
                }`}
                onClick={() => playCard(card)}
                disabled={!isMyTurn}
                style={{ animationDelay: `${i * 0.03}s` }}
                title={
                  isMyTurn
                    ? `Play ${card.value} of ${getColorLabel(card.color)}`
                    : "Not your turn"
                }
              >
                <div className="hcard-top">
                  <span className="hcard-value">{card.value}</span>
                  <span className="hcard-symbol">
                    {getColorSymbol(card.color)}
                  </span>
                </div>
                <div className="hcard-center">
                  {getColorSymbol(card.color)}
                </div>
                <div className="hcard-bottom">
                  <span className="hcard-symbol">
                    {getColorSymbol(card.color)}
                  </span>
                  <span className="hcard-value">{card.value}</span>
                </div>
              </button>
            ))
          )}
        </div>
        {isMyTurn && (
          <div className="turn-banner banner-enter">
            🎯{" "}
            {isLeadPlayer
              ? "You are the LEAD — play any card to start the round!"
              : "Your turn — you must follow the lead color if you have it!"}
          </div>
        )}
      </div>
    </div>
  );
}
