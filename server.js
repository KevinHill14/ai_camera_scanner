require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")

app.use(express.json({ limit: "10mb" }))
app.use(cors())

app.post("/scan", async (req, res) => {
    try {
        const { base64 } = req.body
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.CLAUDE_API_KEY,
                "content-type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: [
                        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 }},
                        { type: "text", text: "What objects are in this image? Do not describe the room, just what you see in the image. Use simple wording, ideally one word so it is easy to understand. So for example, if an apple is in frame, all you say is apple. Please only include the main things in the camera, so a random light switch wont be included, but a person in the background would be, or a apple right in front of the camera. Please also respond in bullet points" }
                    ]
                }]
            })
        })
        const data = await response.json()
        if (data.error) {
            res.status(400).json({ error: data.error.message })
            return
        }
        res.json(data)
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})