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
  const [toastExiting, setToastExiting] = useState(false);
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

  // Show round result toast for 4 seconds with exit animation
  useEffect(() => {
    if (lastRoundResult && lastRoundResult.round !== lastSeenRound) {
      setLastSeenRound(lastRoundResult.round);
      setToastExiting(false);
      setRoundToast(lastRoundResult);

      // Start exit animation at 3.5s, remove at 4s
      const exitTimer = setTimeout(() => setToastExiting(true), 3500);
      const removeTimer = setTimeout(() => {
        setRoundToast(null);
        setToastExiting(false);
      }, 4000);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
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
    R: { label: "Red", className: "color-red" },
    B: { label: "Blue", className: "color-blue" },
    G: { label: "Green", className: "color-green" },
    Y: { label: "Yellow", className: "color-yellow" },
  };

  const getColorClass = (color) => colorConfig[color]?.className || "";
  const getColorLabel = (color) => colorConfig[color]?.label || color;

  // Card value to display symbol (UNO style)
  const getValueDisplay = (value) => {
    switch (value) {
      case "Skip": return "⊘";
      case "Reverse": return "⟲";
      case "+2": return "+2";
      default: return value;
    }
  };

  // Get spatial positions for the 4 players
  const myIndex = seating.findIndex((p) => p.id === myId);
  const getPositionedPlayers = () => {
    if (myIndex === -1) return { top: null, left: null, right: null, bottom: null };
    const order = [0, 1, 2, 3].map((offset) => seating[(myIndex + offset) % 4]);
    return {
      bottom: order[0],
      left: order[1],
      top: order[2],
      right: order[3],
    };
  };

  const positioned = getPositionedPlayers();

  // ── Render an UNO-style card ──
  const renderUnoCard = (color, value, size = "normal", ownerName = null) => {
    const sizeClass = size === "small" ? "uno-card-sm" : size === "mini" ? "uno-card-mini" : "";
    const displayVal = getValueDisplay(value);
    const isSpecial = ["Skip", "Reverse", "+2"].includes(value);

    return (
      <div className={`uno-card ${getColorClass(color)} ${sizeClass}`}>
        {/* White border frame */}
        <div className="uno-inner">
          {/* Top-left corner */}
          <div className="uno-corner uno-corner-tl">
            <span className={`uno-corner-val ${isSpecial ? "special-val" : ""}`}>
              {displayVal}
            </span>
          </div>

          {/* Center oval with value */}
          <div className="uno-oval">
            <span className={`uno-center-val ${isSpecial ? "special-center" : ""}`}>
              {value === "+2" ? (
                <span className="plus2-display">
                  <span className="plus2-cards">🂠🂠</span>
                  <span className="plus2-text">+2</span>
                </span>
              ) : value === "Skip" ? (
                <span className="skip-icon">⊘</span>
              ) : value === "Reverse" ? (
                <span className="reverse-icon">⟲</span>
              ) : (
                displayVal
              )}
            </span>
          </div>

          {/* Bottom-right corner (rotated 180°) */}
          <div className="uno-corner uno-corner-br">
            <span className={`uno-corner-val ${isSpecial ? "special-val" : ""}`}>
              {displayVal}
            </span>
          </div>
        </div>

        {/* Owner name tag for table cards */}
        {ownerName && (
          <div className="uno-card-owner">{ownerName}</div>
        )}
      </div>
    );
  };

  // Render a player seat
  const renderSeat = (player, position) => {
    if (!player) return null;
    const isCurrent = player.id === currentTurn;
    const isMe = player.id === myId;
    const isTeammate =
      seating.find((p) => p.id === myId)?.team === player.team && !isMe;

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
          <div className="seat-played-card card-enter">
            {renderUnoCard(playedCard.card.color, playedCard.card.value, "mini")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-container">
      {/* ── Round Result Toast ── */}
      {roundToast && (
        <div className={`round-toast ${toastExiting ? "toast-exit" : "toast-enter"}`}>
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
                {getValueDisplay(roundToast.winningCard.value)}{" "}
                {getColorLabel(roundToast.winningCard.color)}
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
                {getColorLabel(starColor)}
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
        <div className="arena-top">{renderSeat(positioned.top, "top")}</div>

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
                      className="table-card-wrap card-enter"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {renderUnoCard(
                        t.card.color,
                        t.card.value,
                        "small",
                        getPlayerName(t.playerId)
                      )}
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
                className={`hand-card-btn ${
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
                {renderUnoCard(card.color, card.value)}
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
