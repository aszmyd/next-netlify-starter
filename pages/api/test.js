export default function handler(req, res) {
    res.status(200).json({ message: 'Hello from Next.js! ' + process.env.OPENAI_API_KEY })
  }