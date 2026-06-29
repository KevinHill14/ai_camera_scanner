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
                        { type: "text", text: "What object is in this image?" }
                    ]
                }]
            })
        })
        const data = await response.json()
        res.json(data)
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})