const COLORS = ["R", "B", "G", "Y"];

const CARD_COUNTS = {
  "5": 1,
  "6": 2,
  "7": 2,
  "8": 2,
  "9": 2,
  "Skip": 2,
  "Reverse": 2,
  "+2": 2
};

const VALUE_ORDER = ["5", "6", "7", "8", "9", "Skip", "Reverse", "+2"];

function createDeck() {
  const deck = [];

  for (const value in CARD_COUNTS) {
    COLORS.forEach((color) => {
      for (let i = 0; i < CARD_COUNTS[value]; i++) {
        deck.push({ color, value });
      }
    });
  }

  return shuffle(deck);
}

function shuffle(cards) {
  return cards.sort(() => Math.random() - 0.5);
}

module.exports = {
  createDeck,
  VALUE_ORDER
};
