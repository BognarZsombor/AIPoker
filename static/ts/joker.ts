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
        if (prompt === null) {
            prompt = "Choose a bonus card that you think is the best.";
        }

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

        return new Joker(res.choices[0].text, res.choices[1].text, eval(res.choices[2].text.trim()));
    }

    getScore(cards: PlayingCard[]): number {
        return this.scoreFunction(cards);
    }
}