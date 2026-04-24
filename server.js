import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
            content: "Write a high quality blog post about earning money online with tips and examples."
          }
        ]
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: text
    });

  } catch (error) {
    console.log(error);
    res.json({
      title: "Error",
      content: "AI generation failed. Check API key or logs."
    });
  }
});

app.listen(10000, () => {
  console.log("Server running on port 10000");
});