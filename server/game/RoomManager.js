class RoomManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomCode, host) {
    this.rooms[roomCode] = {
      code: roomCode,
      host,
      players: [host],
      seating: [],
      game: null
    };
  }

  getRoom(roomCode) {
    return this.rooms[roomCode];
  }
}

module.exports = new RoomManager();
