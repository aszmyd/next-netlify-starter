import 'dotenv/config';
import OpenAI from 'openai';
const openai = new OpenAI();

// curl -X POST http://localhost:3000/api/test    -H "Content-Type: application/json"   -d '{"question":"What is your name?"}'

export default async function handler(req, res) {

    console.log('running...', req.body);
    if(typeof req.body === 'object') {
        const question = req.body.question;
        if(typeof question === 'string') {

            console.log('asking GPT', question);
            
            const answer =  (
                await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'user',
                            content: question,
                        },
                    ],
                })
            ).choices[0].message.content ?? ''

            console.log('returning answer', answer);

            res.status(200).json({ answer: answer })

            
        } else {

         res.status(200).json({ message: "Nothing to do" })
        }
    } else {

        res.status(200).json({ message: "Nothing to do" })
    }
    

  }