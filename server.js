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
                        { type: "text", text: `
                            Look at this image carefully. What is the PRIMARY object in this image? 
                            Ignore any hands, people, or background holding or surrounding the object.
                            Focus only on the object itself.
                            Reply with ONE word only -- the specific object name.
                            No punctuation, no explanation.
                            If unsure, give your best guess.
                            Examples: headphones, keyboard, bottle, laptop, book
                        `}
                    ]
                }]
            })
        })
        const data = await response.json()
        if (data.error) {
            res.status(400).json({ error: data.error.message })
            return
        }
        // convert the formatting
        if (data.content && data.content[0]) {
            data.content[0].text = data.content[0].text
                .split("\n")
                .filter(line => line.trim().length > 0)
                .map(line => "• " + line.replace(/^[•\-\*]\s*/, "").trim())
                .join("\n")
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