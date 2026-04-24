import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================= AI GENERATE =================
app.get("/api/generate", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content:
              "Write a professional blog post about earning money online with a title and detailed content."
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 DEBUG (logs me dikhega)
    console.log("OpenAI Response:", JSON.stringify(data, null, 2));

    let text = "";

    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        text = data.choices[0].message.content;
      } else if (data.choices[0].text) {
        text = data.choices[0].text;
      }
    }

    if (!text) {
      return res.json({
        title: "Error",
        content: "No content generated. Check logs."
      });
    }

    res.json({
      title: "AI Generated Blog",
      content: text
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    res.json({
      title: "Error",
      content: "AI generation failed. Check API key or logs."
    });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});