import 'dotenv/config';
import OpenAI from 'openai';
import { checkSiteEnabled } from './_api_guard';
const openai = new OpenAI();
const { getJson } = require("serpapi");


// curl -X POST http://localhost:3000/api/google    -H "Content-Type: application/json"   -d '{"question":"Kto jest obecnym marszałkiem sejmu RP?"}'
// curl -X POST https://glowing-begonia-c1f670.netlify.app/api/google    -H "Content-Type: application/json"   -d '{"question":"Kto jest obecnym marszałkiem sejmu RP?"}'`

const askChat = async (question, additionalContext = '') => {
    return  (
        await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `Answer users question only based on your knowledge. 
                    If don't know the answer, respond 'DONT_KNOW' and nothing more.
                    Always respond in the language of the question.
                    Be precise and concise.
                    Today is: ${new Date().toISOString()}
                    ${additionalContext && additionalContext.length > 0 ? `Additional context: ###${additionalContext}###` : ''}
                    `,
                },
                {
                    role: 'user',
                    content: question,
                },
            ],
        })
    ).choices[0].message.content ?? ''
}
export default async function handler(req, res) {

    try {
        checkSiteEnabled();
        console.log('running...', req.body);
        if(typeof req.body === 'object') {
            const question = req.body.question;
            if(typeof question === 'string') {

                console.log(`asking GPT: ${question}`);
                const answer =  await askChat(question);
                console.log(`GPT answer: ${answer}`);

                if(answer === 'DONT_KNOW') {
                    console.log(`GPT doesn't know the answer, trying to search on google`);
                    const serpResult = await getJson({
                        engine: "google",
                        q: question,
                        api_key: process.env.SERP_API_KEY
                    });

                    if(serpResult.organic_results.length > 0) {
                        const organicResultsSnippets = serpResult.organic_results.slice(0,5).map(result => result.snippet);
                        const context = organicResultsSnippets.join('\n');
                        console.log(`Context from google:\n---------------------\n${context}\n---------------------`);
                        const answerWithContext = await askChat(question, context);
                        console.log(`GPT answer with context: ${answerWithContext}`);
                        res.status(200).json({ reply: answerWithContext })
                    } else {
                        res.status(500).json({ reply: 'Cannot answer. Google didnt return any valid results' })
                    }
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