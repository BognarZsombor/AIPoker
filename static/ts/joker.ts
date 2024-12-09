import { PlayingCard } from './cards';

export class Joker {
    name: string;
    description: string;
    scoreFunction: (cards: PlayingCard[]) => number;

    constructor(name: string, description: string, scoreFunction: (cards: PlayingCard[]) => number) {
        this.name = name;
        this.description = description;
        this.scoreFunction = scoreFunction;
    }

    static async generateJoker(prompt: string) : Promise<Joker> {
        const url = `/api`
        const inputData = {
            desc: prompt,
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        })
        .then(response => response.json())
        .catch(error => console.error('Error:', error));

        const res_json = JSON.parse(res);
        return new Joker(res_json.name, res_json.description, new Function(res_json.function)());
    }

    getScore(cards: PlayingCard[]): number {
        return this.scoreFunction(cards);
    }
}