/**
 * Get api response from openai
 */

import OpenAI from 'openai';
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any) {
    return async function(req: any, res: any, next: any) {
        try {
            const openai = new OpenAI ({
                apiKey: process.env.OPENAI_API_KEY
            });
            
            const aiprompt: string = `write me a json object, which looks like this {\"name\": \"\", \"desc\": \"\", \"scoreFunction\": \"(cards: PlayingCard[]) => number)\"}. the name is the cards name, the desc is the cards description and the func is the function which the card executes. Wrap every parameter in \" and \\n instead of line breaks and \t instead of tabs so it can be converted to a json object. I give you a description of the function the card should do and you have to come up with a name, a description under 10 words and a function which does what I write. You have 3 paramters if needed. One is the playedCards which has the played cards [{suit: \'♦\', value: \'2\'}, {suit: \'♥\', value: \'5\'}] in this format. The second is cardCounts which has the count of each type of card in it {7: 1, 9: 1, Q: 1} in this format. The third is suits which has the suit's icon if it was in the played hand. It is a set so it has a size parameter. The fourth is a function called checkForStraight which checks if there is a straight in the played cards, it needs the playedCards as a parameter and returns true or false. Only use it if the description ask that the played cards needs to be a straight. Don\'t let the player choose how many points he gets. Return the given points. Description: ${req.body.desc}`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: [
                    { role: "system", content: "You extract email addresses into JSON data." },
                    {
                        role: "user",
                        content: "Feeling stuck? Send a message to help@mycompany.com.",
                    },
                ],
                response_format: {
                    // See /docs/guides/structured-outputs
                    type: "json_schema",
                    json_schema: {
                        name: "email_schema",
                        schema: {
                            type: "object",
                            properties: {
                                email: {
                                    description: "The email address that appears in the input",
                                    type: "string"
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            });

            console.log(completion.choices[0].message.content);
            res.status(200).json(completion.choices[0].message.content);
        } catch (error) {
            return next(error);
        }
    };
};

module.exports = mv;