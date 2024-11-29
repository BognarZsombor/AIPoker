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
    static handSize: number;
    static dealtCards: PlayingCard[];
    static selectedCards: PlayingCard[];
    static playedCards: PlayingCard[];

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
        Game.handSize = 5;
        Game.dealtCards = [];
        Game.selectedCards = [];
        Game.playedCards = [];
    }

    static start() {
        Game.dealtCards = Game.deck.deal(Game.handSize);
        Game.display();
    }

    static toogleCardSelection(card: PlayingCard) {
        if (Game.selectedCards.includes(card)) {
            Game.deselectCard(card);
        } else {
            Game.selectCard(card);
        }
        Game.display();
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
        Game.display();
        
        if (Game.checkLevelFinished()) {
            Game.level++;
            Game.handsRemaining = 5;
            Game.redrawsRemaining = 3;
            Game.pointsNeeded = 1000;
        } else if (Game.checkGameOver()) {
            Game.init();
        }
    }

    static redrawAllCards() {
        Game.dealtCards = Game.deck.deal(Game.handSize);
        Game.selectedCards = [];
        Game.display();
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

    static display() {
        const playerHand = document.getElementById('playerHand');
        if (playerHand) {
            playerHand.innerHTML = '';
            Game.dealtCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                if (Game.selectedCards.includes(card)) {
                    cardElement.classList.add('selected');
                }
                cardElement.innerHTML = `${card.rank} of ${card.suit}`;
                cardElement.addEventListener('click', Game.toogleCardSelection.bind(null, card));
                playerHand.appendChild(cardElement);
            });
        }
        // const playedCards = document.getElementById('playedCards');
        // if (playedCards) {
        //     playedCards.innerHTML = Game.playedCards.map(card => {
        //         return `<div class="card">${card.rank} of ${card.suit}</div>`;
        //     }).join('');
        // }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready');
    Game.start();
});