import { useEffect, useState } from "react";
import { socket } from "./socket";
import "./App.css";

export default function Lobby({ roomCode }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("roomUpdate", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("roomUpdate");
    };
  }, []);

  const selectTeam = (team) => {
    socket.emit("selectTeam", { roomCode, team });
  };

  const mySocketId = socket.id;
  const me = players.find((p) => p.id === mySocketId);
  const isHost = me?.isHost;

  const startGame = () => {
    socket.emit("startGame", roomCode, (res) => {
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  const team1 = players.filter((p) => p.team === "TEAM1");
  const team2 = players.filter((p) => p.team === "TEAM2");
  const unassigned = players.filter((p) => !p.team);

  return (
    <div className="screen-center">
      <div className="lobby-card">
        <div className="lobby-header">
          <h1 className="lobby-title">Game Lobby</h1>
          <div className="room-code-display">
            <span className="rc-label">Room Code</span>
            <span className="rc-code">{roomCode}</span>
          </div>
        </div>

        <div className="lobby-players-count">
          <span>{players.length}/4 Players Joined</span>
          <div className="player-dots">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`player-dot ${i < players.length ? "dot-filled" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Teams Display */}
        <div className="teams-grid">
          <div className="team-col team-col-1">
            <h3 className="team-col-title">Team 1</h3>
            <div className="team-slots">
              {team1.map((p) => (
                <div key={p.id} className="team-slot filled">
                  <span className="slot-avatar">{p.name[0]?.toUpperCase()}</span>
                  <span className="slot-name">
                    {p.name}
                    {p.isHost && <span className="host-badge">HOST</span>}
                    {p.id === mySocketId && <span className="you-badge">YOU</span>}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, 2 - team1.length))].map((_, i) => (
                <div key={`empty1-${i}`} className="team-slot empty">
                  <span className="slot-placeholder">Waiting...</span>
                </div>
              ))}
            </div>
            {!me?.team && (
              <button className="btn-team btn-team1" onClick={() => selectTeam("TEAM1")}>
                Join Team 1
              </button>
            )}
          </div>

          <div className="teams-vs">VS</div>

          <div className="team-col team-col-2">
            <h3 className="team-col-title">Team 2</h3>
            <div className="team-slots">
              {team2.map((p) => (
                <div key={p.id} className="team-slot filled">
                  <span className="slot-avatar">{p.name[0]?.toUpperCase()}</span>
                  <span className="slot-name">
                    {p.name}
                    {p.isHost && <span className="host-badge">HOST</span>}
                    {p.id === mySocketId && <span className="you-badge">YOU</span>}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, 2 - team2.length))].map((_, i) => (
                <div key={`empty2-${i}`} className="team-slot empty">
                  <span className="slot-placeholder">Waiting...</span>
                </div>
              ))}
            </div>
            {!me?.team && (
              <button className="btn-team btn-team2" onClick={() => selectTeam("TEAM2")}>
                Join Team 2
              </button>
            )}
          </div>
        </div>

        {/* Unassigned players */}
        {unassigned.length > 0 && (
          <div className="unassigned-section">
            <span className="unassigned-label">Unassigned Players</span>
            <div className="unassigned-list">
              {unassigned.map((p) => (
                <span key={p.id} className="unassigned-chip">
                  {p.name}
                  {p.isHost && " 👑"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Start game button */}
        {isHost && (
          <button
            className="btn-primary btn-full btn-start"
            onClick={startGame}
            disabled={players.length !== 4 || team1.length !== 2 || team2.length !== 2}
          >
            🚀 Start Game
          </button>
        )}

        {!isHost && (
          <div className="waiting-host">
            Waiting for host to start the game...
          </div>
        )}
      </div>

      <style>{`
        .lobby-card {
          width: 100%;
          max-width: 560px;
          padding: 36px 32px;
          background: linear-gradient(135deg, rgba(25, 35, 60, 0.85), rgba(15, 20, 45, 0.9));
          border-radius: 24px;
          border: 1px solid rgba(100, 150, 240, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
          animation: fadeInUp 0.5s ease-out;
        }

        .lobby-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .lobby-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6em;
          font-weight: 900;
          margin: 0;
          color: #d0d8e8;
        }

        .room-code-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .rc-label {
          font-size: 0.6em;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #6a7a9a;
          font-weight: 700;
        }

        .rc-code {
          font-family: 'Outfit', monospace;
          font-size: 1.4em;
          font-weight: 900;
          color: #ffd700;
          letter-spacing: 4px;
          padding: 4px 14px;
          background: rgba(255, 215, 0, 0.08);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
        }

        .lobby-players-count {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 0.88em;
          color: #8899b4;
          font-weight: 600;
        }

        .player-dots {
          display: flex;
          gap: 6px;
        }

        .player-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(100, 130, 180, 0.2);
          border: 1px solid rgba(100, 130, 180, 0.3);
          transition: all 0.3s ease;
        }

        .dot-filled {
          background: #3b82f6;
          border-color: #5a9aff;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        }

        .teams-grid {
          display: flex;
          align-items: stretch;
          gap: 16px;
          margin-bottom: 20px;
        }

        .team-col {
          flex: 1;
          padding: 20px 16px;
          border-radius: 16px;
        }

        .team-col-1 {
          background: linear-gradient(135deg, rgba(60, 120, 200, 0.12), rgba(60, 120, 200, 0.04));
          border: 1px solid rgba(60, 120, 200, 0.2);
        }

        .team-col-2 {
          background: linear-gradient(135deg, rgba(220, 70, 70, 0.12), rgba(220, 70, 70, 0.04));
          border: 1px solid rgba(220, 70, 70, 0.2);
        }

        .team-col-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85em;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #8899b4;
          margin: 0 0 14px 0;
          text-align: center;
        }

        .team-slots {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .team-slot {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          min-height: 46px;
        }

        .team-slot.filled {
          border-color: rgba(100, 180, 255, 0.15);
          animation: fadeInUp 0.3s ease-out;
        }

        .slot-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3a5a8c, #2a4070);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85em;
          color: #fff;
        }

        .slot-name {
          font-weight: 600;
          font-size: 0.88em;
          color: #d0d8e8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .host-badge {
          font-size: 0.65em;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 215, 0, 0.15);
          color: #ffd700;
          font-weight: 800;
        }

        .you-badge {
          font-size: 0.65em;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(100, 180, 255, 0.15);
          color: #64b5ff;
          font-weight: 800;
        }

        .slot-placeholder {
          color: #4a5a78;
          font-size: 0.82em;
          font-style: italic;
        }

        .btn-team {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.82em;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }

        .btn-team1 {
          background: rgba(60, 120, 200, 0.15);
          border: 1px solid rgba(60, 120, 200, 0.3);
          color: #6aafff;
        }

        .btn-team1:hover {
          background: rgba(60, 120, 200, 0.25);
        }

        .btn-team2 {
          background: rgba(220, 70, 70, 0.15);
          border: 1px solid rgba(220, 70, 70, 0.3);
          color: #ff7b7b;
        }

        .btn-team2:hover {
          background: rgba(220, 70, 70, 0.25);
        }

        .teams-vs {
          display: flex;
          align-items: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 1.1em;
          color: #3a4a6a;
          letter-spacing: 3px;
        }

        .unassigned-section {
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .unassigned-label {
          font-size: 0.72em;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #6a7a9a;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }

        .unassigned-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .unassigned-chip {
          padding: 6px 14px;
          border-radius: 50px;
          background: rgba(100, 130, 180, 0.12);
          border: 1px solid rgba(100, 130, 180, 0.2);
          color: #a0b4d4;
          font-weight: 600;
          font-size: 0.85em;
        }

        .btn-start {
          margin-top: 8px;
          font-size: 1.05em;
          padding: 16px;
        }

        .btn-start:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .waiting-host {
          text-align: center;
          padding: 16px;
          color: #6a7a9a;
          font-weight: 600;
          font-size: 0.9em;
          font-style: italic;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
