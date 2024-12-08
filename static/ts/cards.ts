// cards.ts

export enum Suit {
    Diamonds = 'Diamonds',
    Hearts = 'Hearts',
    Clubs = 'Clubs',
    Spades = 'Spades'
}

export enum Rank {
    Two = 'Two',
    Three = 'Three',
    Four = 'Four',
    Five = 'Five',
    Six = 'Six',
    Seven = 'Seven',
    Eight = 'Eight',
    Nine = 'Nine',
    Ten = 'Ten',
    Jack = 'Jack',
    Queen = 'Queen',
    King = 'King',
    Ace = 'Ace'
}

export enum HandRank {
    Nothing = 'Nothing',
    HighCard = 'High Card',
    OnePair = 'One Pair',
    TwoPair = 'Two Pair',
    ThreeOfAKind = 'Three of a Kind',
    Straight = 'Straight',
    Flush = 'Flush',
    FullHouse = 'Full House',
    Poker = 'Poker',
    StraightFlush = 'Straight Flush',
    RoyalFlush = 'Royal Flush'
}

export class PlayingCard {
    suit: Suit;
    rank: Rank;
    selected: boolean;
    points: number;

    static cardRankPoints: Record<Rank, number> = {
        [Rank.Two]: 2,
        [Rank.Three]: 3,
        [Rank.Four]: 4,
        [Rank.Five]: 5,
        [Rank.Six]: 6,
        [Rank.Seven]: 7,
        [Rank.Eight]: 8,
        [Rank.Nine]: 9,
        [Rank.Ten]: 10,
        [Rank.Jack]: 10,
        [Rank.Queen]: 10,
        [Rank.King]: 10,
        [Rank.Ace]: 11
    };

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
        this.selected = false;
        this.points = PlayingCard.cardRankPoints[rank];
    }
}

export class Deck {
    cards: PlayingCard[];
    dealtCards: PlayingCard[];

    constructor() {
        this.cards = [];
        for (let suit in Suit) {
            for (let rank in Rank) {
                this.cards.push(new PlayingCard(suit as Suit, rank as Rank));
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

    deal(numberOfCards: number = 1): PlayingCard[] {
        const dealtCards = this.cards.splice(0, numberOfCards);
        this.dealtCards = this.dealtCards.concat(dealtCards);
        return dealtCards;
    }

    reset() {
        this.cards = this.cards.concat(this.dealtCards);
        this.dealtCards = [];
    }
}