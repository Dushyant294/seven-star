const { createDeck, VALUE_ORDER } = require("./Deck");

class GameEngine {
  constructor(seating) {
    this.players = seating; // fixed circular order
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

  playCard(playerId, card) {
    // Turn check
    if (this.getCurrentPlayer().id !== playerId) {
      throw new Error("Not your turn");
    }

    const hand = this.hands[playerId];
    if (!hand) throw new Error("Invalid player");

    // Card ownership check
    const index = hand.findIndex(
      (c) => c.color === card.color && c.value === card.value
    );
    if (index === -1) {
      throw new Error("Card not in hand");
    }

    // Same color enforcement
    if (this.trick.length > 0) {
      const leadColor = this.trick[0].card.color;
      if (card.color !== leadColor) {
        throw new Error("Must follow same color");
      }
    }

    // Play card
    hand.splice(index, 1);
    this.trick.push({ playerId, card });

    // Move turn
    this.turnIndex = (this.turnIndex + 1) % 4;

    // Resolve round if needed
    if (this.trick.length === 4) {
      this.resolveTrick();
    }
  }

  resolveTrick() {
    let winnerPlay = this.trick[0];

    this.trick.forEach((play) => {
      if (
        VALUE_ORDER.indexOf(play.card.value) >
        VALUE_ORDER.indexOf(winnerPlay.card.value)
      ) {
        winnerPlay = play;
      }
    });

    const winnerPlayer = this.players.find(
      (p) => p.id === winnerPlay.playerId
    );

    // Score
    this.scores[winnerPlayer.team] += 1;

    // Winner starts next round
    this.turnIndex = this.players.indexOf(winnerPlayer);

    this.trick = [];
    this.round += 1;
  }

  isGameOver() {
    return this.round > 15;
  }

  getWinner() {
    if (this.scores.TEAM1 > this.scores.TEAM2) return "TEAM1";
    if (this.scores.TEAM2 > this.scores.TEAM1) return "TEAM2";
    return "DRAW";
  }
}

module.exports = GameEngine;
