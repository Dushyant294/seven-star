const RoomManager = require("../game/RoomManager");
const GameEngine = require("../game/GameEngine");

module.exports = (io) => {
  io.on("connection", (socket) => {

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
      if (!room) return cb({ error: "Room not found" });
      if (room.players.length >= 4) return cb({ error: "Room full" });

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
    // START GAME
    // ======================
    socket.on("startGame", (roomCode, cb) => {
      const room = RoomManager.getRoom(roomCode);
      if (!room) return;

      if (room.host.id !== socket.id) {
        return cb({ error: "Only host can start" });
      }

      if (room.players.length !== 4) {
        return cb({ error: "Need exactly 4 players" });
      }

      const team1 = room.players.filter(p => p.team === "TEAM1");
      const team2 = room.players.filter(p => p.team === "TEAM2");

      if (team1.length !== 2 || team2.length !== 2) {
        return cb({ error: "Teams must be 2 vs 2" });
      }

      room.seating = [
        team1[0],
        team2[0],
        team1[1],
        team2[1]
      ];

      room.game = new GameEngine(room.seating);

      room.seating.forEach((player) => {
        io.to(player.id).emit("gameState", {
          hand: room.game.hands[player.id],
          seating: room.seating,
          currentTurn: room.game.getCurrentPlayer().id,
          round: room.game.round,
          scores: room.game.scores,
          trick: []
        });
      });

      cb({ success: true });
    });

    // ======================
    // PLAY CARD
    // ======================
    socket.on("playCard", ({ roomCode, card }) => {
      const room = RoomManager.getRoom(roomCode);
      if (!room || !room.game) return;

      try {
        room.game.playCard(socket.id, card);
      } catch (err) {
        io.to(socket.id).emit("errorMessage", err.message);
        return;
      }

      // Game over
      if (room.game.isGameOver()) {
        io.to(roomCode).emit("gameOver", {
          scores: room.game.scores,
          winner: room.game.getWinner()
        });
        return;
      }

      // Broadcast updated state
      room.seating.forEach((player) => {
        io.to(player.id).emit("gameState", {
          hand: room.game.hands[player.id],
          seating: room.seating,
          currentTurn: room.game.getCurrentPlayer().id,
          round: room.game.round,
          scores: room.game.scores,
          trick: room.game.trick
        });
      });
    });

  });
};
