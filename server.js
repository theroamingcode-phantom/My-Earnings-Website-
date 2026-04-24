const express = require("express");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ AI Generate Route (REAL AI)
app.get("/api/generate", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Write a professional blog post about earning money online",
        },
      ],
    });

    const text = response.choices[0].message.content;

    res.json({
      title: text.split("\n")[0] || "AI Blog",
      content: text,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// बाकी routes same रहने दो (posts, stats etc.)

app.listen(3000, () => console.log("Server running on port 3000"));