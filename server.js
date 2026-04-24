require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;

// ✅ Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ AI GENERATE (OPENROUTER — STABLE)
app.get("/generate", async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        title: "Error",
        content: "API key missing ❌"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Write a high-quality blog about earning money online"
          }
        ]
      })
    });

    const data = await response.json();

    if (!data || !data.choices) {
      return res.json({
        title: "Error",
        content: "Invalid AI response ❌"
      });
    }

    res.json({
      title: "AI Generated Blog",
      content: data.choices[0].message.content
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});