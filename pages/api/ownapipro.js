import 'dotenv/config';
import OpenAI from 'openai';
import { checkSiteEnabled } from '../_api_guard';
const openai = new OpenAI();

// curl -X POST http://localhost:3000/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"What is your name?"}'
// curl -X POST http://localhost:3000/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"I like bananas and apples"}'
// curl -X POST http://localhost:3000/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"What fruit do I like that are yellow?"}'

// curl -X POST https://glowing-begonia-c1f670.netlify.app/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"What is your name?"}'`
// curl -X POST https://glowing-begonia-c1f670.netlify.app/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"I like bananas and apples"}'
// curl -X POST https://glowing-begonia-c1f670.netlify.app/api/ownapipro    -H "Content-Type: application/json"   -d '{"question":"What fruit do I like that are yellow?"}'

const ownKnowledge = []
export default async function handler(req, res) {

    try {
        checkSiteEnabled();
        console.log('running...', req.body);
        if(typeof req.body === 'object') {
            const question = req.body.question;
            if(typeof question === 'string') {

                console.log('asking GPT', question);
                
                const answer =  (
                    await openai.chat.completions.create({
                        model: process.env.GPT_MODEL ?? 'gpt-4',
                        messages: [ {
                                role: 'system',
                                content: `Your job is to either answer the question user asks or, if the user prompt is not a question, return 'KNOWLEDGE'
                                    Additional context###\n${ownKnowledge.join('\n')}###
                                    If you don't know the answer, simply say "Don't.
                                `,
                            },
                            
                            {
                                role: 'user',
                                content: question,
                            },
                        ],
                    })
                ).choices[0].message.content ?? ''

                console.log('gpt answer', answer);

                if(answer === 'KNOWLEDGE') {
                    // Knowledge to remember
                    ownKnowledge.push(question);
                    res.status(200).json({ reply: 'OK' })
                } else {
                    res.status(200).json({ reply: answer })
                }
            } else {

            res.status(200).json({ message: "Nothing to do" })
            }
        } else {

            res.status(200).json({ message: "Nothing to do" })
        }
    
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: e.message })
    }

  }