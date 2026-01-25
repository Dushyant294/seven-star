import { useEffect, useState } from "react";
import { socket } from "./socket";
import Lobby from "./Lobby";
import GameTable from "./GameTable";

function App() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [gameState, setGameState] = useState(null);

  // 🔥 Listen for game state from server
  useEffect(() => {
    socket.on("gameState", (state) => {
      setGameState(state);
    });

    return () => {
      socket.off("gameState");
    };
  }, []);

  // CREATE ROOM
  const createRoom = () => {
    if (!name) {
      alert("Enter your name");
      return;
    }

    socket.emit("createRoom", { name }, (code) => {
      setRoomCode(code);
    });
  };

  // JOIN ROOM
  const joinRoom = () => {
    if (!name || !joinCode) {
      alert("Enter name and room code");
      return;
    }

    socket.emit("joinRoom", { roomCode: joinCode, name }, (res) => {
      if (res?.error) {
        alert(res.error);
      } else {
        setRoomCode(joinCode);
      }
    });
  };

  // 🎮 GAME SCREEN
  if (gameState) {
    return <GameTable gameState={gameState} />;
  }

  // 🧩 LOBBY SCREEN
  if (roomCode) {
    return <Lobby roomCode={roomCode} />;
  }

  // 🏠 HOME SCREEN
  return (
    <div style={{ padding: 40 }}>
      <h1>Seven Star 🌟</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div>
        <button onClick={createRoom}>Create Room</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Room Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}

export default App;
