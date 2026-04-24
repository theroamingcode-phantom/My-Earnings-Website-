const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ Generate route
app.get("/generate", async (req, res) => {
  try {
    console.log("HF KEY:", process.env.HF_API_KEY); // 🔥 DEBUG

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Write a short blog post about earning money online.",
        }),
      }
    );

    const data = await response.json();

    console.log("HF RESPONSE:", data); // 🔥 DEBUG

    let content = "No content generated";

    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    }

    res.json({
      title: "AI Generated Blog",
      content: content,
    });

  } catch (error) {
    console.error("ERROR:", error);

    res.json({
      title: "Error",
      content: "AI generation failed",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});