require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// STATIC FILE SERVE (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "public")));

// TEST ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// AI GENERATE ROUTE
app.get("/generate", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: "Write a professional blog about earning money online",
        })
      }
    );

    const text = await response.text();

    // 🔴 ERROR FIX (HTML response check)
    if (text.startsWith("<")) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI ❌ (Token / Model issue)"
      });
    }

    const data = JSON.parse(text);

    res.json({
      title: "AI Generated Blog",
      content: data[0]?.generated_text || "No content"
    });

  } catch (err) {
    console.log(err);
    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// PORT FIX (Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});