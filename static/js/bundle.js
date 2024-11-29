"use strict";
(() => {
  // static/ts/game.ts
  var Suit = /* @__PURE__ */ ((Suit2) => {
    Suit2["Hearts"] = "Hearts";
    Suit2["Diamonds"] = "Diamonds";
    Suit2["Clubs"] = "Clubs";
    Suit2["Spades"] = "Spades";
    return Suit2;
  })(Suit || {});
  var Rank = /* @__PURE__ */ ((Rank2) => {
    Rank2["Ace"] = "Ace";
    Rank2["Two"] = "2";
    Rank2["Three"] = "3";
    Rank2["Four"] = "4";
    Rank2["Five"] = "5";
    Rank2["Six"] = "6";
    Rank2["Seven"] = "7";
    Rank2["Eight"] = "8";
    Rank2["Nine"] = "9";
    Rank2["Ten"] = "10";
    Rank2["Jack"] = "Jack";
    Rank2["Queen"] = "Queen";
    Rank2["King"] = "King";
    return Rank2;
  })(Rank || {});
  var PlayingCard = class {
    constructor(suit, rank) {
      this.suit = suit;
      this.rank = rank;
    }
  };
  var Deck = class {
    constructor() {
      this.cards = [];
      for (let suit in Suit) {
        for (let rank in Rank) {
          this.cards.push(new PlayingCard(suit, rank));
        }
      }
    }
    shuffle() {
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
    }
    deal(numberOfCards = 1) {
      return this.cards.splice(0, numberOfCards);
    }
  };
  var Game = class _Game {
    static {
      _Game.init();
    }
    static init() {
      _Game.deck = new Deck();
      _Game.deck.shuffle();
      _Game.level = 1;
      _Game.highestScore = 0;
      _Game.handsRemaining = 5;
      _Game.redrawsRemaining = 3;
      _Game.pointsNeeded = 1e3;
      _Game.dealtCards = [];
      _Game.selectedCards = [];
    }
    static start() {
      _Game.dealtCards = _Game.deck.deal(5);
    }
    static selectCard(card) {
      _Game.selectedCards.push(card);
    }
    static deselectCard(card) {
      _Game.selectedCards = _Game.selectedCards.filter((c) => c !== card);
    }
    static redrawSelectedCards() {
      if (_Game.redrawsRemaining === 0) {
        return;
      }
      _Game.dealtCards = _Game.dealtCards.map((card) => {
        if (_Game.selectedCards.includes(card)) {
          return _Game.deck.deal()[0];
        }
        return card;
      });
      _Game.selectedCards = [];
      _Game.redrawsRemaining--;
    }
    static playSelectedCards() {
      if (_Game.handsRemaining === 0) {
        return;
      }
      const selectedCards = _Game.selectedCards;
      _Game.dealtCards = _Game.dealtCards.filter((card) => !selectedCards.includes(card));
      _Game.selectedCards = [];
      _Game.handsRemaining--;
      const points = _Game.calculatePoints();
      _Game.pointsNeeded -= points;
      _Game.highestScore = Math.max(_Game.highestScore, points);
      if (_Game.checkLevelFinished()) {
        _Game.level++;
        _Game.handsRemaining = 5;
        _Game.redrawsRemaining = 3;
        _Game.pointsNeeded = 1e3;
      }
    }
    static redrawAllCards() {
      _Game.dealtCards = _Game.deck.deal(5);
      _Game.selectedCards = [];
    }
    static calculatePoints() {
      const points = _Game.selectedCards.reduce((acc, card) => {
        if (card.rank === "Ace" /* Ace */) {
          return acc + 11;
        }
        if (card.rank === "Jack" /* Jack */ || card.rank === "Queen" /* Queen */ || card.rank === "King" /* King */) {
          return acc + 10;
        }
        return acc + parseInt(card.rank);
      }, 0);
      return points;
    }
    static checkGameOver() {
      if (_Game.handsRemaining === 0) {
        return true;
      }
      return false;
    }
    static checkLevelFinished() {
      if (_Game.pointsNeeded <= 0) {
        return true;
      }
      return false;
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is ready");
    const playBtn = document.getElementById("playButton");
    if (playBtn) {
      playBtn.innerHTML = "Player's Hand";
    }
  });
})();
