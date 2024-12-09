"use strict";
(() => {
  // static/ts/cards.ts
  var Suit = /* @__PURE__ */ ((Suit2) => {
    Suit2["Diamonds"] = "Diamonds";
    Suit2["Hearts"] = "Hearts";
    Suit2["Clubs"] = "Clubs";
    Suit2["Spades"] = "Spades";
    return Suit2;
  })(Suit || {});
  var Rank = /* @__PURE__ */ ((Rank2) => {
    Rank2["Two"] = "Two";
    Rank2["Three"] = "Three";
    Rank2["Four"] = "Four";
    Rank2["Five"] = "Five";
    Rank2["Six"] = "Six";
    Rank2["Seven"] = "Seven";
    Rank2["Eight"] = "Eight";
    Rank2["Nine"] = "Nine";
    Rank2["Ten"] = "Ten";
    Rank2["Jack"] = "Jack";
    Rank2["Queen"] = "Queen";
    Rank2["King"] = "King";
    Rank2["Ace"] = "Ace";
    return Rank2;
  })(Rank || {});
  var PlayingCard = class _PlayingCard {
    static {
      this.cardRankPoints = {
        ["Two" /* Two */]: 2,
        ["Three" /* Three */]: 3,
        ["Four" /* Four */]: 4,
        ["Five" /* Five */]: 5,
        ["Six" /* Six */]: 6,
        ["Seven" /* Seven */]: 7,
        ["Eight" /* Eight */]: 8,
        ["Nine" /* Nine */]: 9,
        ["Ten" /* Ten */]: 10,
        ["Jack" /* Jack */]: 10,
        ["Queen" /* Queen */]: 10,
        ["King" /* King */]: 10,
        ["Ace" /* Ace */]: 11
      };
    }
    constructor(suit, rank) {
      this.suit = suit;
      this.rank = rank;
      this.selected = false;
      this.points = _PlayingCard.cardRankPoints[rank];
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
      this.dealtCards = [];
    }
    shuffle() {
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
    }
    deal(numberOfCards = 1) {
      const dealtCards = this.cards.splice(0, numberOfCards);
      this.dealtCards = this.dealtCards.concat(dealtCards);
      return dealtCards;
    }
    reset() {
      this.cards = this.cards.concat(this.dealtCards);
      this.dealtCards = [];
    }
  };

  // static/ts/joker.ts
  var Joker = class _Joker {
    constructor(name, description, scoreFunction) {
      this.name = name;
      this.description = description;
      this.scoreFunction = scoreFunction;
    }
    static async generateJoker(prompt2) {
      const url = `/api`;
      const inputData = {
        desc: prompt2
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(inputData)
      }).then((response) => response.json()).catch((error) => console.error("Error:", error));
      const res_json = JSON.parse(res);
      return new _Joker(res_json.name, res_json.description, new Function(res_json.function)());
    }
    getScore(cards) {
      return this.scoreFunction(cards);
    }
  };

  // static/ts/game.ts
  var GameNameSpace;
  ((GameNameSpace2) => {
    class Game {
      static {
        this.handRankPoints = {
          ["Nothing" /* Nothing */]: 0,
          ["High Card" /* HighCard */]: 10,
          ["One Pair" /* OnePair */]: 20,
          ["Two Pair" /* TwoPair */]: 50,
          ["Three of a Kind" /* ThreeOfAKind */]: 100,
          ["Straight" /* Straight */]: 200,
          ["Flush" /* Flush */]: 300,
          ["Full House" /* FullHouse */]: 400,
          ["Poker" /* Poker */]: 500,
          ["Straight Flush" /* StraightFlush */]: 750,
          ["Royal Flush" /* RoyalFlush */]: 1e3
        };
      }
      static init() {
        Game.playerName = window.username;
        Game.deck = new Deck();
        Game.deck.shuffle();
        Game.level = 1;
        Game.highestScore = 0;
        Game.startingHandSize = 5;
        Game.handsRemaining = Game.startingHandSize;
        Game.startingRedraws = 3;
        Game.redrawsRemaining = Game.startingRedraws;
        Game.startingPoints = 10;
        Game.pointsNeeded = Game.startingPoints;
        Game.handSize = 10;
        Game.lastSortedBy = true;
        Game.dealtCards = [];
        Game.playedCards = [];
        Game.jokers = [];
      }
      static initLevel() {
        Game.handsRemaining = Game.startingHandSize;
        Game.redrawsRemaining = Game.startingRedraws;
        Game.pointsNeeded = Game.startingPoints * Game.level;
        Game.dealtCards = [];
        Game.playedCards = [];
        Game.deck.reset();
        Game.deck.shuffle();
        Game.dealtCards = Game.deck.deal(Game.handSize);
      }
      static start() {
        Game.init();
        Game.dealtCards = Game.deck.deal(Game.handSize);
        Game.sortCards();
        Game.display();
      }
      static toogleCardSelection(card) {
        if (Game.dealtCards.filter((c) => c.selected).length === 5 && !card.selected) {
          return;
        }
        card.selected = !card.selected;
        Game.display();
      }
      static redrawSelectedCards() {
        if (Game.redrawsRemaining === 0) {
          return;
        }
        Game.dealtCards.forEach((card) => {
          if (card.selected) {
            Game.dealtCards = Game.dealtCards.filter((c) => c !== card);
            Game.dealtCards = Game.dealtCards.concat(Game.deck.deal(1));
          }
        });
        Game.redrawsRemaining--;
        Game.sortCards();
        Game.display();
      }
      static playSelectedCards() {
        if (Game.handsRemaining === 0) {
          return;
        }
        Game.playedCards = Game.dealtCards.filter((card) => card.selected);
        Game.redrawSelectedCards();
        Game.playedCards.forEach((card) => card.selected = false);
        Game.handsRemaining--;
        const points = Game.calculatePoints(Game.playedCards);
        Game.pointsNeeded -= points;
        Game.highestScore = Math.max(Game.highestScore, points);
        if (Game.checkLevelFinished()) {
          Game.level++;
          Game.createNewJoker();
          Game.initLevel();
        } else if (Game.checkGameOver()) {
          Game.sendGameOver();
        }
        Game.display();
      }
      static async createNewJoker() {
        const desc = prompt("Enter a description for the new joker: ");
        const joker = await Joker.generateJoker(desc || "Choose a bonus card that you think is the best.");
        Game.jokers.push(joker);
        Game.display();
      }
      static sendGameOver() {
        const data = {
          name: Game.playerName,
          score: Game.highestScore,
          level: Game.level
        };
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/gameover";
        Object.keys(data).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data[key].toString();
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
      static getHandRank(cards) {
        if (cards.length === 0) {
          return "Nothing" /* Nothing */;
        }
        cards.sort((a, b) => Game.greaterThanByValue(a, b));
        const isFlush = cards.length === 5 && cards.every((card) => card.suit === cards[0].suit);
        const isStraight = cards.length === 5 && (cards.every((card, index) => {
          if (index === 0) return true;
          const prevRankIndex = Object.values(Rank).indexOf(cards[index - 1].rank);
          const currRankIndex = Object.values(Rank).indexOf(card.rank);
          return currRankIndex === prevRankIndex - 1;
        }) || // Special case for Ace-2-3-4-5
        cards[0].rank === "Two" /* Two */ && cards[1].rank === "Three" /* Three */ && cards[2].rank === "Four" /* Four */ && cards[3].rank === "Five" /* Five */ && cards[4].rank === "Ace" /* Ace */);
        if (isFlush && isStraight && cards[0].rank === "Ace" /* Ace */ && cards[1].rank === "King" /* King */) {
          return "Royal Flush" /* RoyalFlush */;
        }
        if (isFlush && isStraight) {
          return "Straight Flush" /* StraightFlush */;
        }
        const rankCounts = cards.reduce((acc, card) => {
          acc[card.rank] = (acc[card.rank] || 0) + 1;
          return acc;
        }, {});
        const counts = Object.values(rankCounts);
        if (counts.includes(4)) {
          return "Poker" /* Poker */;
        }
        if (counts.includes(3) && counts.includes(2)) {
          return "Full House" /* FullHouse */;
        }
        if (isFlush) {
          return "Flush" /* Flush */;
        }
        if (isStraight) {
          return "Straight" /* Straight */;
        }
        if (counts.includes(3)) {
          return "Three of a Kind" /* ThreeOfAKind */;
        }
        if (counts.filter((count) => count === 2).length === 2) {
          return "Two Pair" /* TwoPair */;
        }
        if (counts.includes(2)) {
          return "One Pair" /* OnePair */;
        }
        return "High Card" /* HighCard */;
      }
      static calculatePoints(cards) {
        const rank = Game.getHandRank(cards);
        const rankPoints = Game.handRankPoints[rank];
        const contributingCards = Game.getContributingCards(cards, rank);
        const cardPoints = contributingCards.reduce((acc, card) => acc + card.points, 0);
        return cardPoints + rankPoints;
      }
      static getContributingCards(cards, rank) {
        switch (rank) {
          case "High Card" /* HighCard */:
            return [cards[0]];
          // Only the highest card contributes to high card
          case "One Pair" /* OnePair */:
            return Game.getCardsWithSameRank(cards, 2);
          case "Two Pair" /* TwoPair */:
            return Game.getCardsWithSameRank(cards, 2, 2);
          case "Three of a Kind" /* ThreeOfAKind */:
            return Game.getCardsWithSameRank(cards, 3);
          case "Straight" /* Straight */:
          case "Straight Flush" /* StraightFlush */:
            return cards;
          // All cards contribute to a straight or straight flush
          case "Flush" /* Flush */:
            return cards;
          // All cards contribute to a flush
          case "Full House" /* FullHouse */:
            return Game.getCardsWithSameRank(cards, 3).concat(Game.getCardsWithSameRank(cards, 2));
          case "Poker" /* Poker */:
            return Game.getCardsWithSameRank(cards, 4);
          case "Royal Flush" /* RoyalFlush */:
            return cards;
          // All cards contribute to a royal flush
          default:
            return cards;
        }
      }
      static getCardsWithSameRank(cards, ...counts) {
        const rankCounts = cards.reduce((acc, card) => {
          acc[card.rank] = (acc[card.rank] || 0) + 1;
          return acc;
        }, {});
        const contributingCards = [];
        counts.forEach((count) => {
          const rank = Object.keys(rankCounts).find((rank2) => rankCounts[rank2] === count);
          if (rank) {
            contributingCards.push(...cards.filter((card) => card.rank === rank));
            delete rankCounts[rank];
          }
        });
        return contributingCards;
      }
      static checkGameOver() {
        if (Game.handsRemaining === 0) {
          return true;
        }
        return false;
      }
      static checkLevelFinished() {
        if (Game.pointsNeeded <= 0) {
          return true;
        }
        return false;
      }
      static greaterThanByValue(a, b) {
        const rank1 = Object.values(Rank).indexOf(a.rank);
        const rank2 = Object.values(Rank).indexOf(b.rank);
        if (rank1 !== rank2) {
          return rank2 - rank1;
        }
        const suit1 = Object.values(Suit).indexOf(a.suit);
        const suit2 = Object.values(Suit).indexOf(b.suit);
        return suit2 - suit1;
      }
      static greaterThanBySuit(a, b) {
        const suit1 = Object.values(Suit).indexOf(a.suit);
        const suit2 = Object.values(Suit).indexOf(b.suit);
        if (suit1 !== suit2) {
          return suit2 - suit1;
        }
        const rank1 = Object.values(Rank).indexOf(a.rank);
        const rank2 = Object.values(Rank).indexOf(b.rank);
        return rank2 - rank1;
      }
      static sortCards() {
        if (Game.lastSortedBy) {
          Game.dealtCards.sort((a, b) => Game.greaterThanByValue(a, b));
        } else {
          Game.dealtCards.sort((a, b) => Game.greaterThanBySuit(a, b));
        }
        Game.display();
      }
      static sortCardsByValue() {
        Game.lastSortedBy = true;
        Game.sortCards();
        Game.display();
      }
      static sortCardsBySuit() {
        Game.lastSortedBy = false;
        Game.sortCards();
        Game.display();
      }
      static display() {
        const playerHand = document.getElementById("playerHand");
        if (playerHand) {
          playerHand.innerHTML = "";
          Game.dealtCards.forEach((card) => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            if (card.selected) {
              cardElement.classList.add("selected");
            }
            cardElement.innerHTML = `${card.rank} of ${card.suit}`;
            cardElement.addEventListener("click", Game.toogleCardSelection.bind(null, card));
            playerHand.appendChild(cardElement);
          });
        }
        const playedCards = document.getElementById("playedCards");
        if (playedCards) {
          playedCards.innerHTML = "";
          Game.playedCards.forEach((card) => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            cardElement.innerHTML = `${card.rank} of ${card.suit}`;
            playedCards.appendChild(cardElement);
          });
        }
        const jokers = document.getElementById("jokers");
        if (jokers) {
          jokers.innerHTML = "";
          Game.jokers.forEach((joker) => {
            const jokerElement = document.createElement("div");
            jokerElement.classList.add("card");
            jokerElement.innerHTML = `${joker.description}`;
            jokers.appendChild(jokerElement);
          });
        }
        const pointsNeeded = document.getElementById("pointsNeeded");
        if (pointsNeeded) {
          pointsNeeded.innerHTML = `${Game.pointsNeeded}`;
        }
        const handsRemaining = document.getElementById("handsRemaining");
        if (handsRemaining) {
          handsRemaining.innerHTML = `${Game.handsRemaining}`;
        }
        const redrawsRemaining = document.getElementById("redrawsRemaining");
        if (redrawsRemaining) {
          redrawsRemaining.innerHTML = `${Game.redrawsRemaining}`;
        }
        const level = document.getElementById("level");
        if (level) {
          level.innerHTML = `Level: ${Game.level}`;
        }
        const selectedHandRank = document.getElementById("selectedHandRank");
        if (selectedHandRank) {
          selectedHandRank.innerHTML = `${Game.getHandRank(Game.dealtCards.filter((card) => card.selected))}`;
        }
        const selectedHandPoints = document.getElementById("selectedHandPoints");
        if (selectedHandPoints) {
          selectedHandPoints.innerHTML = `${Game.calculatePoints(Game.dealtCards.filter((card) => card.selected))}`;
        }
      }
    }
    GameNameSpace2.Game = Game;
  })(GameNameSpace || (GameNameSpace = {}));
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is ready");
    GameNameSpace.Game.start();
  });
  window.redrawCards = GameNameSpace.Game.redrawSelectedCards;
  window.sortCardsByValue = GameNameSpace.Game.sortCardsByValue;
  window.sortCardsBySuit = GameNameSpace.Game.sortCardsBySuit;
  window.playCards = GameNameSpace.Game.playSelectedCards;
  window.reset = GameNameSpace.Game.start;
})();
