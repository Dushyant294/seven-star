import { useEffect, useState } from "react";
import { socket } from "./socket";
import Lobby from "./Lobby";
import GameTable from "./GameTable";

function App() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [gameState, setGameState] = useState(null);
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    socket.on("gameState", (state) => {
      setGameState(state);
    });

    socket.on("gameOver", (data) => {
      setGameOver(data);
    });

    socket.on("errorMessage", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("gameState");
      socket.off("gameOver");
      socket.off("errorMessage");
    };
  }, []);

  const createRoom = () => {
    socket.emit("createRoom", { name }, (code) => {
      window.roomCode = code;
      setRoomCode(code);
    });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", { roomCode: joinCode, name }, (res) => {
      if (res?.error) alert(res.error);
      else {
        window.roomCode = joinCode;
        setRoomCode(joinCode);
      }
    });
  };

  if (gameOver) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Game Over 🏆</h1>
        <h2>Winner: {gameOver.winner}</h2>
        <p>TEAM 1: {gameOver.scores.TEAM1}</p>
        <p>TEAM 2: {gameOver.scores.TEAM2}</p>
      </div>
    );
  }

  if (gameState) {
    return <GameTable gameState={gameState} />;
  }

  if (roomCode) {
    return <Lobby roomCode={roomCode} />;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Seven Star 🌟</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <button onClick={createRoom}>Create Room</button>
      </div>

      <div>
        <input
          placeholder="Room Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}

export default App;
