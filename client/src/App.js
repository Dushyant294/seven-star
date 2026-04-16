import { useEffect, useState } from "react";
import { socket } from "./socket";
import Lobby from "./Lobby";
import GameTable from "./GameTable";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    socket.on("gameState", setGameState);
    socket.on("gameOver", setGameOver);

    return () => {
      socket.off("gameState");
      socket.off("gameOver");
    };
  }, []);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3500);
  };

  const createRoom = () => {
    if (!name.trim()) return showError("Please enter your name");
    socket.emit("createRoom", { name: name.trim() }, (res) => {
      if (res?.error) return showError(res.error);
      window.roomCode = res;
      setRoomCode(res);
    });
  };

  const joinRoom = () => {
    if (!name.trim()) return showError("Please enter your name");
    if (!joinCode.trim()) return showError("Please enter a room code");
    socket.emit("joinRoom", { roomCode: joinCode.trim().toUpperCase(), name: name.trim() }, (res) => {
      if (res?.error) return showError(res.error);
      const code = joinCode.trim().toUpperCase();
      window.roomCode = code;
      setRoomCode(code);
    });
  };

  const colorConfig = {
    R: { label: "Red", symbol: "🔴" },
    B: { label: "Blue", symbol: "🔵" },
    G: { label: "Green", symbol: "🟢" },
    Y: { label: "Yellow", symbol: "🟡" },
  };

  // ── GAME OVER SCREEN ──
  if (gameOver) {
    const winLabel =
      gameOver.winner === "DRAW"
        ? "It's a Draw!"
        : `${gameOver.winner} Wins!`;
    const starInfo = gameOver.starColor
      ? `${colorConfig[gameOver.starColor]?.symbol || ""} ${colorConfig[gameOver.starColor]?.label || gameOver.starColor}`
      : "None";

    return (
      <div className="screen-center">
        <div className="gameover-card">
          <div className="gameover-trophy">🏆</div>
          <h1 className="gameover-title">Game Over</h1>
          <h2 className="gameover-winner">{winLabel}</h2>
          <div className="gameover-scores">
            <div className="go-team go-team1">
              <span className="go-label">TEAM 1</span>
              <span className="go-score">{gameOver.scores.TEAM1}</span>
            </div>
            <span className="go-vs">vs</span>
            <div className="go-team go-team2">
              <span className="go-label">TEAM 2</span>
              <span className="go-score">{gameOver.scores.TEAM2}</span>
            </div>
          </div>
          <div className="gameover-star">
            ⭐ Star Color: <strong>{starInfo}</strong>
          </div>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── GAME TABLE ──
  if (gameState) return <GameTable gameState={gameState} />;

  // ── LOBBY ──
  if (roomCode) return <Lobby roomCode={roomCode} />;

  // ── HOME SCREEN ──
  return (
    <div className="screen-center">
      <div className="home-card">
        <div className="home-logo">⭐</div>
        <h1 className="home-title">Seven Star</h1>
        <p className="home-subtitle">4-Player Team Card Game</p>

        {error && <div className="home-error">{error}</div>}

        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input
            className="input-field"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
          />
        </div>

        <button className="btn-primary btn-full" onClick={createRoom}>
          Create Room
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="input-group">
          <label className="input-label">Room Code</label>
          <input
            className="input-field"
            placeholder="Enter 5-character code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={5}
          />
        </div>

        <button className="btn-secondary btn-full" onClick={joinRoom}>
          Join Room
        </button>
      </div>
    </div>
  );
}

export default App;
