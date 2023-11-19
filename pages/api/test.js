export default function handler(req, res) {
    res.status(200).json({ message: 'Hello from Next.js! ' + process.env.AI_DEVS_API_KEY })
  }