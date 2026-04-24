// ===== IMPORTS =====
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static("public"));

// ===== HOME =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== AI GENERATE =====
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
          inputs: "Write a short blog post about earning money online."
        })
      }
    );

    // 🔥 IMPORTANT: text first (not json)
    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI ❌"
      });
    }

    let content = "No content generated";

    // handle multiple formats
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    } else if (data?.generated_text) {
      content = data.generated_text;
    } else if (data?.summary_text) {
      content = data.summary_text;
    }

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