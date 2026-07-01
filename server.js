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
                            In only 1 word, what is the oject on this image? 
                            Focus only on the main object, not anything in the background.
                            Do not use context to describe what is happening on the screen, only what is being seen in the exact image provides.
                            Never break the 1 word rule unless the object is spelt in 2 words
                            Do not add any formatting to the word, just output a word of what you see in the image.
                            If you are unsure, respond with unknown.
                            if there are multiple objects in the image, respond with the most prominent object.`}
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