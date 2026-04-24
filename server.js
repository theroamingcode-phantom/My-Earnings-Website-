const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// ===== ROUTES =====

// Root
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ AI Generate (OpenRouter)
app.get("/generate", async (req, res) => {
  try {
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.json({
        title: "Error",
        content: "OPENROUTER_API_KEY missing ❌"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Write a professional blog post about earning money online"
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("AI RESPONSE:", data);

    const content =
      data.choices?.[0]?.message?.content ||
      "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: content
    });

  } catch (error) {
    console.error("ERROR:", error);

    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, "public")));

// ===== START =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});