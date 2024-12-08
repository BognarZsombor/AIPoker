import { Suit, Rank, HandRank, PlayingCard, Deck } from './cards';
import { Joker } from './joker';

namespace GameNameSpace {
export abstract class Game {
    static playerName: string;
    static deck: Deck;
    static level: number;
    static highestScore: number;
    static startingHandSize: number;
    static handsRemaining: number;
    static startingRedraws: number;
    static redrawsRemaining: number;
    static startingPoints: number;
    static pointsNeeded: number;
    static handSize: number;
    static lastSortedBy: boolean;
    static dealtCards: PlayingCard[];
    static playedCards: PlayingCard[];
    static jokers: Joker[];
    static handRankPoints: Record<HandRank, number> = {
        [HandRank.Nothing]: 0,
        [HandRank.HighCard]: 10,
        [HandRank.OnePair]: 20,
        [HandRank.TwoPair]: 50,
        [HandRank.ThreeOfAKind]: 100,
        [HandRank.Straight]: 200,
        [HandRank.Flush]: 300,
        [HandRank.FullHouse]: 400,
        [HandRank.Poker]: 500,
        [HandRank.StraightFlush]: 750,
        [HandRank.RoyalFlush]: 1000
    };

    static init() {
        Game.playerName = (window as any).username;
        Game.deck = new Deck();
        Game.deck.shuffle();
        Game.level = 1;
        Game.highestScore = 0;
        Game.startingHandSize = 5;
        Game.handsRemaining = Game.startingHandSize;
        Game.startingRedraws = 3;
        Game.redrawsRemaining = Game.startingRedraws;
        Game.startingPoints = 1000;
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

    static toogleCardSelection(card: PlayingCard) {
        if (Game.dealtCards.filter(c => c.selected).length === 5 && !card.selected) {
            return;
        }
        card.selected = !card.selected;
        Game.display();
    }

    static redrawSelectedCards() {
        if (Game.redrawsRemaining === 0) {
            return;
        }
        Game.dealtCards.forEach(card => {
            if (card.selected) {
                Game.dealtCards = Game.dealtCards.filter(c => c !== card);
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
        Game.playedCards = Game.dealtCards.filter(card => card.selected);
        Game.redrawSelectedCards();
        Game.playedCards.forEach(card => card.selected = false);
        Game.handsRemaining--;

        const points = Game.calculatePoints(Game.playedCards);
        Game.pointsNeeded -= points;
        Game.highestScore = Math.max(Game.highestScore, points);
        
        if (Game.checkLevelFinished()) {
            Game.level++;
            Game.initLevel();
        } else if (Game.checkGameOver()) {
            Game.sendGameOver();
        }
        Game.display();
    }

    static sendGameOver() {
        const data = {
            name: Game.playerName,
            score: Game.highestScore,
            level: Game.level
        };

        // Create a form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/gameover';

        // Add hidden input fields to the form
        (Object.keys(data) as (keyof typeof data)[]).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key].toString();
            form.appendChild(input);
        });

        // Append the form to the body and submit it
        document.body.appendChild(form);
        form.submit();
    }

    static getHandRank(cards: PlayingCard[]): HandRank {
        if (cards.length === 0) {
            return HandRank.Nothing;
        }

        // Sort cards by rank
        cards.sort((a, b) => Game.greaterThanByValue(a, b));

        const isFlush = cards.length === 5 && cards.every(card => card.suit === cards[0].suit);
        const isStraight = cards.length === 5 && (
            cards.every((card, index) => {
                if (index === 0) return true;
                const prevRankIndex = Object.values(Rank).indexOf(cards[index - 1].rank);
                const currRankIndex = Object.values(Rank).indexOf(card.rank);
                return currRankIndex === prevRankIndex - 1;
            }) || (
                // Special case for Ace-2-3-4-5
                cards[0].rank === Rank.Two &&
                cards[1].rank === Rank.Three &&
                cards[2].rank === Rank.Four &&
                cards[3].rank === Rank.Five &&
                cards[4].rank === Rank.Ace
            )
        );

        if (isFlush && isStraight && cards[0].rank === Rank.Ace && cards[1].rank === Rank.King) {
            return HandRank.RoyalFlush;
        }
        if (isFlush && isStraight) {
            return HandRank.StraightFlush;
        }

        const rankCounts = cards.reduce((acc, card) => {
            acc[card.rank] = (acc[card.rank] || 0) + 1;
            return acc;
        }, {} as Record<Rank, number>);

        const counts = Object.values(rankCounts);
        if (counts.includes(4)) {
            return HandRank.Poker;
        }
        if (counts.includes(3) && counts.includes(2)) {
            return HandRank.FullHouse;
        }
        if (isFlush) {
            return HandRank.Flush;
        }
        if (isStraight) {
            return HandRank.Straight;
        }
        if (counts.includes(3)) {
            return HandRank.ThreeOfAKind;
        }
        if (counts.filter(count => count === 2).length === 2) {
            return HandRank.TwoPair;
        }
        if (counts.includes(2)) {
            return HandRank.OnePair;
        }

        return HandRank.HighCard;
    }

    static calculatePoints(cards: PlayingCard[]): number {
        const rank = Game.getHandRank(cards);
        const rankPoints = Game.handRankPoints[rank];

        // Identify the cards that contribute to the hand rank
        const contributingCards = Game.getContributingCards(cards, rank);

        // Only add the points if the card is part of the rank
        const cardPoints = contributingCards.reduce((acc, card) => acc + card.points, 0);
        return cardPoints + rankPoints;
    }

    static getContributingCards(cards: PlayingCard[], rank: HandRank): PlayingCard[] {
        // Logic to identify the contributing cards based on the hand rank
        // This is a simplified example and may need to be adjusted based on the actual game rules
        switch (rank) {
            case HandRank.HighCard:
                return [cards[0]]; // Only the highest card contributes to high card
            case HandRank.OnePair:
                return Game.getCardsWithSameRank(cards, 2);
            case HandRank.TwoPair:
                return Game.getCardsWithSameRank(cards, 2, 2);
            case HandRank.ThreeOfAKind:
                return Game.getCardsWithSameRank(cards, 3);
            case HandRank.Straight:
            case HandRank.StraightFlush:
                return cards; // All cards contribute to a straight or straight flush
            case HandRank.Flush:
                return cards; // All cards contribute to a flush
            case HandRank.FullHouse:
                return Game.getCardsWithSameRank(cards, 3).concat(Game.getCardsWithSameRank(cards, 2));
            case HandRank.Poker:
                return Game.getCardsWithSameRank(cards, 4);
            case HandRank.RoyalFlush:
                return cards; // All cards contribute to a royal flush
            default:
                return cards; // For High Card and Nothing, all cards are considered
        }
    }

    static getCardsWithSameRank(cards: PlayingCard[], ...counts: number[]): PlayingCard[] {
        const rankCounts = cards.reduce((acc, card) => {
            acc[card.rank] = (acc[card.rank] || 0) + 1;
            return acc;
        }, {} as Record<Rank, number>);

        const contributingCards: PlayingCard[] = [];
        counts.forEach(count => {
            const rank = Object.keys(rankCounts).find(rank => rankCounts[rank as Rank] === count);
            if (rank) {
                contributingCards.push(...cards.filter(card => card.rank === rank));
                delete rankCounts[rank as Rank];
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
    
    static greaterThanByValue(a: PlayingCard, b: PlayingCard): number {
        const rank1 = Object.values(Rank).indexOf(a.rank);
        const rank2 = Object.values(Rank).indexOf(b.rank);
        if (rank1 !== rank2) {
            return rank2 - rank1;
        }

        const suit1 = Object.values(Suit).indexOf(a.suit);
        const suit2 = Object.values(Suit).indexOf(b.suit);
        return suit2 - suit1;
    }

    static greaterThanBySuit(a: PlayingCard, b: PlayingCard): number {
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
        const playerHand = document.getElementById('playerHand');
        if (playerHand) {
            playerHand.innerHTML = '';
            Game.dealtCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                if (card.selected) {
                    cardElement.classList.add('selected');
                }
                cardElement.innerHTML = `${card.rank} of ${card.suit}`;
                cardElement.addEventListener('click', Game.toogleCardSelection.bind(null, card));
                playerHand.appendChild(cardElement);
            });
        }

        const playedCards = document.getElementById('playedCards');
        if (playedCards) {
            playedCards.innerHTML = '';
            Game.playedCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.innerHTML = `${card.rank} of ${card.suit}`;
                playedCards.appendChild(cardElement);
            });
        }

        const pointsNeeded = document.getElementById('pointsNeeded');
        if (pointsNeeded) {
            pointsNeeded.innerHTML = `${Game.pointsNeeded}`;
        }

        const handsRemaining = document.getElementById('handsRemaining');
        if (handsRemaining) {
            handsRemaining.innerHTML = `${Game.handsRemaining}`;
        }

        const redrawsRemaining = document.getElementById('redrawsRemaining');
        if (redrawsRemaining) {
            redrawsRemaining.innerHTML = `${Game.redrawsRemaining}`;
        }

        const level = document.getElementById('level');
        if (level) {
            level.innerHTML = `Level: ${Game.level}`;
        }

        const selectedHandRank = document.getElementById('selectedHandRank');
        if (selectedHandRank) {
            selectedHandRank.innerHTML = `${Game.getHandRank(Game.dealtCards.filter(card => card.selected))}`;
        }

        const selectedHandPoints = document.getElementById('selectedHandPoints');
        if (selectedHandPoints) {
            selectedHandPoints.innerHTML = `${Game.calculatePoints(Game.dealtCards.filter(card => card.selected))}`;
        }
    }
}
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready');
    GameNameSpace.Game.start();
});

(window as any).redrawCards = GameNameSpace.Game.redrawSelectedCards;
(window as any).sortCardsByValue = GameNameSpace.Game.sortCardsByValue;
(window as any).sortCardsBySuit = GameNameSpace.Game.sortCardsBySuit;
(window as any).playCards = GameNameSpace.Game.playSelectedCards;
(window as any).reset = GameNameSpace.Game.start;