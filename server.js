const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// ===== SERVE STATIC FILES =====
app.use(express.static(path.join(__dirname, "public")));

// ===== HOMEPAGE (IMPORTANT FIX) =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== AI GENERATE ROUTE =====
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
              content: "Write an SEO optimized blog post with headings about earning money online"
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

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});