enum Suit {
    Hearts = 'Hearts',
    Diamonds = 'Diamonds',
    Clubs = 'Clubs',
    Spades = 'Spades'
}

enum Rank {
    Ace = 'Ace',
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
    Six = '6',
    Seven = '7',
    Eight = '8',
    Nine = '9',
    Ten = '10',
    Jack = 'Jack',
    Queen = 'Queen',
    King = 'King'
}

class PlayingCard {
    suit: Suit;
    rank: Rank;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
    }
}

class Deck {
    cards: PlayingCard[];

    constructor() {
        this.cards = [];
        for (let suit in Suit) {
            for (let rank in Rank) {
                this.cards.push(new PlayingCard(suit as Suit, rank as Rank));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(numberOfCards: number = 1): PlayingCard[] {
        return this.cards.splice(0, numberOfCards);
    }
}

abstract class Game {
    static deck: Deck;
    static level: number;
    static highestScore: number;
    static handsRemaining: number;
    static redrawsRemaining: number;
    static pointsNeeded: number;
    static dealtCards: PlayingCard[];
    static selectedCards: PlayingCard[];

    static {
        Game.init();
    }

    static init() {
        Game.deck = new Deck();
        Game.deck.shuffle();
        Game.level = 1;
        Game.highestScore = 0;
        Game.handsRemaining = 5;
        Game.redrawsRemaining = 3;
        Game.pointsNeeded = 1000;
        Game.dealtCards = [];
        Game.selectedCards = [];
    }

    static start() {
        Game.dealtCards = Game.deck.deal(5);
    }

    static selectCard(card: PlayingCard) {
        Game.selectedCards.push(card);
    }

    static deselectCard(card: PlayingCard) {
        Game.selectedCards = Game.selectedCards.filter(c => c !== card);
    }

    static redrawSelectedCards() {
        if (Game.redrawsRemaining === 0) {
            return;
        }
        Game.dealtCards = Game.dealtCards.map(card => {
            if (Game.selectedCards.includes(card)) {
                return Game.deck.deal()[0];
            }
            return card;
        });
        Game.selectedCards = [];
        Game.redrawsRemaining--;
    }

    static playSelectedCards() {
        if (Game.handsRemaining === 0) {
            return;
        }
        const selectedCards = Game.selectedCards;
        Game.dealtCards = Game.dealtCards.filter(card => !selectedCards.includes(card));
        Game.selectedCards = [];
        Game.handsRemaining--;

        const points = Game.calculatePoints();
        Game.pointsNeeded -= points;
        Game.highestScore = Math.max(Game.highestScore, points);
        
        if (Game.checkLevelFinished()) {
            Game.level++;
            Game.handsRemaining = 5;
            Game.redrawsRemaining = 3;
            Game.pointsNeeded = 1000;
        }
    }

    static redrawAllCards() {
        Game.dealtCards = Game.deck.deal(5);
        Game.selectedCards = [];
    }

    static calculatePoints() {
        const points = Game.selectedCards.reduce((acc, card) => {
            if (card.rank === Rank.Ace) {
                return acc + 11;
            }
            if (card.rank === Rank.Jack || card.rank === Rank.Queen || card.rank === Rank.King) {
                return acc + 10;
            }
            return acc + parseInt(card.rank);
        }, 0);
        return points;
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
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready');
    const playBtn = document.getElementById('playButton');
    if (playBtn) {
        playBtn.innerHTML = "Player's Hand";
    }
});