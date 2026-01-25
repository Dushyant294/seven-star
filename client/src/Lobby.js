import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Lobby({ roomCode }) {
  const [players, setPlayers] = useState([]);

  // 🔹 Listen for lobby updates
  useEffect(() => {
    socket.on("roomUpdate", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("roomUpdate");
    };
  }, []);

  // 🔹 Team selection
  const selectTeam = (team) => {
    socket.emit("selectTeam", { roomCode, team });
  };

  // 🔹 Identify current player
  const mySocketId = socket.id;
  const me = players.find((p) => p.id === mySocketId);
  const isHost = me?.isHost;

  // 🔹 Host starts game
  const startGame = () => {
    socket.emit("startGame", roomCode, (res) => {
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Game starting!");
      }
    });
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Room Code: {roomCode}</h2>

      {/* Players List */}
      <h3>Players</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name}{" "}
            {p.isHost && "(HOST)"} —{" "}
            {p.team ? p.team : "No Team"}
          </li>
        ))}
      </ul>

      {/* Team Selection */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={!!me?.team}
          onClick={() => selectTeam("TEAM1")}
        >
          Join TEAM 1
        </button>

        <button
          disabled={!!me?.team}
          onClick={() => selectTeam("TEAM2")}
        >
          Join TEAM 2
        </button>
      </div>

      {/* Host Only Start Button */}
      {isHost && (
        <div style={{ marginTop: 30 }}>
          <button onClick={startGame}>
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}
