const RoomManager = require("../game/RoomManager");
const GameEngine = require("../game/GameEngine");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // ======================
    // CREATE ROOM
    // ======================
    socket.on("createRoom", ({ name }, cb) => {
      const roomCode = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

      const host = {
        id: socket.id,
        name,
        team: null,
        isHost: true
      };

      socket.join(roomCode);
      RoomManager.createRoom(roomCode, host);

      io.to(roomCode).emit("roomUpdate", [host]);
      cb(roomCode);
    });

    // ======================
    // JOIN ROOM
    // ======================
    socket.on("joinRoom", ({ roomCode, name }, cb) => {
      const room = RoomManager.getRoom(roomCode);

      if (!room) {
        cb({ error: "Room not found" });
        return;
      }

      if (room.players.length >= 4) {
        cb({ error: "Room is full" });
        return;
      }

      const player = {
        id: socket.id,
        name,
        team: null,
        isHost: false
      };

      room.players.push(player);
      socket.join(roomCode);

      io.to(roomCode).emit("roomUpdate", room.players);
      cb({ success: true });
    });

    // ======================
    // SELECT TEAM
    // ======================
    socket.on("selectTeam", ({ roomCode, team }) => {
      const room = RoomManager.getRoom(roomCode);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.team) return;

      const count = room.players.filter(p => p.team === team).length;
      if (count >= 2) return;

      player.team = team;
      io.to(roomCode).emit("roomUpdate", room.players);
    });

    // ======================
    // START GAME (HOST ONLY)
    // ======================
    socket.on("startGame", (roomCode, cb) => {
      const room = RoomManager.getRoom(roomCode);
      if (!room) return;

      if (room.host.id !== socket.id) {
        cb({ error: "Only host can start the game" });
        return;
      }

      if (room.players.length !== 4) {
        cb({ error: "Exactly 4 players required" });
        return;
      }

      const team1 = room.players.filter(p => p.team === "TEAM1");
      const team2 = room.players.filter(p => p.team === "TEAM2");

      if (team1.length !== 2 || team2.length !== 2) {
        cb({ error: "Teams must be 2 vs 2" });
        return;
      }

      // Enforce non-adjacent seating
      room.seating = [
        team1[0],
        team2[0],
        team1[1],
        team2[1]
      ];

      // Create game engine
      room.game = new GameEngine(room.seating);

      // Send private game state to each player
      room.seating.forEach((player) => {
        io.to(player.id).emit("gameState", {
          hand: room.game.hands[player.id],
          seating: room.seating,
          currentTurn: room.game.getCurrentPlayer().id,
          round: room.game.round,
          scores: room.game.scores
        });
      });

      cb({ success: true });
    });
  });
};
