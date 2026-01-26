const { createDeck, VALUE_ORDER } = require("./Deck");

class GameEngine {
  constructor(seating) {
    this.players = seating;              // fixed circular order
    this.turnIndex = Math.floor(Math.random() * 4);
    this.round = 1;

    this.deck = createDeck();
    this.hands = {};
    this.trick = [];

    this.scores = { TEAM1: 0, TEAM2: 0 };

    // ⭐ GLOBAL STAR (persists entire game)
    this.starColor = null;

    // deal 15 cards each
    seating.forEach(p => {
      this.hands[p.id] = this.deck.splice(0, 15);
    });
  }

  getCurrentPlayer() {
    return this.players[this.turnIndex];
  }

  playCard(playerId, card) {
    // turn validation
    if (this.getCurrentPlayer().id !== playerId) {
      throw new Error("Not your turn");
    }

    const hand = this.hands[playerId];
    if (!hand) throw new Error("Invalid player");

    // ownership check
    const idx = hand.findIndex(
      c => c.color === card.color && c.value === card.value
    );
    if (idx === -1) throw new Error("Card not in hand");

    const leadColor = this.trick.length > 0
      ? this.trick[0].card.color
      : null;

    // must follow lead color if present
    if (leadColor) {
      const hasLead = hand.some(c => c.color === leadColor);
      if (hasLead && card.color !== leadColor) {
        throw new Error("Must follow lead color");
      }
    }

    // ⭐ STAR CREATION (ONLY ONCE IN GAME)
    if (
      !this.starColor &&
      leadColor &&
      card.value === "Skip" &&
      card.color !== leadColor
    ) {
      const hasLead = hand.some(c => c.color === leadColor);
      if (!hasLead) {
        this.starColor = card.color; // GLOBAL, NEVER CHANGES
      }
    }

    // play card
    hand.splice(idx, 1);
    this.trick.push({ playerId, card });

    // advance turn
    this.turnIndex = (this.turnIndex + 1) % 4;

    // resolve round
    if (this.trick.length === 4) {
      this.resolveRound();
    }
  }

  resolveRound() {
    let winnerPlay = null;

    // 1️⃣ STAR color dominance
    if (this.starColor) {
      const starPlays = this.trick.filter(
        t => t.card.color === this.starColor
      );
      if (starPlays.length > 0) {
        winnerPlay = starPlays.reduce((a, b) =>
          VALUE_ORDER.indexOf(b.card.value) >
          VALUE_ORDER.indexOf(a.card.value)
            ? b
            : a
        );
      }
    }

    // 2️⃣ Lead color dominance
    if (!winnerPlay) {
      const leadColor = this.trick[0].card.color;
      const leadPlays = this.trick.filter(
        t => t.card.color === leadColor
      );

      winnerPlay = leadPlays.reduce((a, b) =>
        VALUE_ORDER.indexOf(b.card.value) >
        VALUE_ORDER.indexOf(a.card.value)
          ? b
          : a
      );
    }

    const winnerPlayer = this.players.find(
      p => p.id === winnerPlay.playerId
    );

    this.scores[winnerPlayer.team] += 1;

    // winner starts next round
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
