const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;

// HOME PAGE FIX (IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
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
          parameters: {
            max_length: 300
          }
        })
      }
    );

    const text = await response.text();

    // ERROR FIX: HTML aata hai kabhi kabhi
    if (text.startsWith("<")) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI ❌ (Token ya model issue)"
      });
    }

    const data = JSON.parse(text);

    res.json({
      title: "AI Generated Blog",
      content: data[0]?.generated_text || "No content generated"
    });

  } catch (err) {
    console.log(err);
    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});