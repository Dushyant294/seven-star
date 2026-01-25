const { createDeck } = require("./Deck");

class GameEngine {
  constructor(seating) {
    this.players = seating; // fixed seating order
    this.turnIndex = Math.floor(Math.random() * 4);
    this.round = 1;
    this.deck = createDeck();
    this.hands = {};
    this.trick = [];
    this.scores = {
      TEAM1: 0,
      TEAM2: 0
    };

    // Deal 15 cards each
    seating.forEach((player) => {
      this.hands[player.id] = this.deck.splice(0, 15);
    });
  }

  getCurrentPlayer() {
    return this.players[this.turnIndex];
  }
}

module.exports = GameEngine;
