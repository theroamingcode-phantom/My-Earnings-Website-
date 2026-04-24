// ===== IMPORTS =====
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// ===== PORT =====
const PORT = process.env.PORT || 10000;

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static("public"));

// ===== HOME ROUTE =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== AI GENERATE ROUTE =====
app.get("/generate", async (req, res) => {
  try {
    const HF_TOKEN = process.env.HF_TOKEN;

    // ⚠️ अगर token missing hai
    if (!HF_TOKEN) {
      return res.json({
        title: "Error",
        content: "HF_TOKEN missing hai ❌"
      });
    }

    // Hugging Face API call
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: "Write a short blog post about earning money online:"
        })
      }
    );

    const data = await response.json();

    console.log("HF RAW:", data);

    // 🧠 SAFE RESPONSE HANDLE
    let content = "No content generated";

    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
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

// ===== SERVER START =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});