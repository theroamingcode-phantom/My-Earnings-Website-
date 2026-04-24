const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// static folder (frontend)
app.use(express.static("public"));

// test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// AI generate route
app.get("/generate", async (req, res) => {
  try {
    const MODEL = "google/flan-t5-base";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Write a short blog about earning money online",
        }),
      }
    );

    // 🔥 important: text first
    const raw = await response.text();
    console.log("RAW RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI (HTML मिला)",
      });
    }

    // ❌ error from HF
    if (data.error) {
      return res.json({
        title: "Error",
        content: data.error,
      });
    }

    // ✅ success
    const output =
      data[0]?.generated_text ||
      data[0]?.summary_text ||
      "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: output,
    });
  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.json({
      title: "Error",
      content: "AI generation failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});