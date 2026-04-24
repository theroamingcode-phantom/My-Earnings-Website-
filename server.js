const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// ===== IMPORTANT: ROUTES FIRST =====

// Root check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// AI Generate Route
app.get("/generate", async (req, res) => {
  try {
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.json({
        title: "Error",
        content: "HF_TOKEN missing ❌"
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: "Write a short professional blog about earning money online"
        })
      }
    );

    const raw = await response.text();
    console.log("RAW RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI (HTML आया) ❌"
      });
    }

    if (data.error) {
      return res.json({
        title: "Error",
        content: data.error
      });
    }

    const content =
      data[0]?.generated_text ||
      data[0]?.summary_text ||
      "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: content
    });

  } catch (error) {
    console.log("SERVER ERROR:", error);

    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// ===== STATIC AFTER ROUTES =====
app.use(express.static(path.join(__dirname, "public")));

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});