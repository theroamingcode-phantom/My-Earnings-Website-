const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Node 18+ me fetch built-in hota hai (Render pe hota hai)
// agar error aaye to npm install node-fetch kar lena

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ✅ AI Generate Route
app.get("/generate", async (req, res) => {
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
          inputs: "Write a short blog post about earning money online in simple words.",
        }),
      }
    );

    const data = await response.json();

    console.log("HF Response:", data);

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

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});