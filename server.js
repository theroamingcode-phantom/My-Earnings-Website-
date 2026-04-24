const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

app.get("/generate", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Write a short blog about making money online:",
        }),
      }
    );

    const text = await response.text(); // 🔥 important

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.log("❌ Not JSON, raw response:", text);
      return res.json({
        title: "Error",
        content: "Invalid response from AI (check token/model)",
      });
    }

    if (data.error) {
      return res.json({
        title: "Error",
        content: data.error,
      });
    }

    const output = data[0]?.generated_text || "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: output,
    });

  } catch (error) {
    console.log("🔥 Server Error:", error);
    res.json({
      title: "Error",
      content: "AI generation failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});