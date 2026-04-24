const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Home route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// ✅ AI Generate Route
app.get("/api/generate", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs:
            "Write a professional and detailed blog post about earning money online in 2025:",
        }),
      }
    );

    const data = await response.json();

    console.log("HF Response:", data);

    const content =
      data && data[0] && data[0].generated_text
        ? data[0].generated_text
        : "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: content,
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      title: "Error",
      content: "AI generation failed. Check API key or logs.",
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});