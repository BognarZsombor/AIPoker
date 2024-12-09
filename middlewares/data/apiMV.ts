/**
 * Get api response from openai
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from "openai/helpers/zod";
const requireOption = require('../requireOption');

const Joker = z.object({
    name: z.string(),
    description: z.string(),
    function: z.string()
});

function mv(objectrepository: any) {
    return async function(req: any, res: any, next: any) {
        try {
            const openai = new OpenAI ({
                apiKey: process.env.OPENAI_API_KEY
            });

            const aiprompt = req.body.desc;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini-2024-07-18",
                messages: [
                    { role: "system", content: "You create bonus functions that are used in the game." },
                    {
                        role: "user",
                        content: aiprompt,
                    },
                ],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "card_schema",
                        schema: {
                            type: "object",
                            properties: {
                                name: {
                                    description: "The name of the created card. It should be short and descriptive.",
                                    type: "string"
                                },
                                description: {
                                    description: "The description of the created card. It should be around 10 words long. It should tell the player how the card works.",
                                    type: "string"
                                },
                                function: {
                                    description: "The function of the created card. It should be a function that takes in the played cards and returns the number of points the player gets.",
                                    type: "string"
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            });

            res.status(200).json(completion.choices[0].message.content);
        } catch (error) {
            return next(error);
        }
    };
};

module.exports = mv;