const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;

// ✅ Home route (IMPORTANT - warna 404 aata hai)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ✅ AI Generate Route
app.get("/generate", async (req, res) => {
  try {
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return res.json({
        title: "Error",
        content: "HF Token missing ❌"
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Write a high quality blog about earning money online",
        }),
      }
    );

    const text = await response.text();

    // ❌ HTML error aaya toh handle karo
    if (text.startsWith("<!DOCTYPE")) {
      return res.json({
        title: "Error",
        content: "Invalid response from AI (HTML आया) ❌"
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.json({
        title: "Error",
        content: "JSON parse error ❌"
      });
    }

    const output = data[0]?.generated_text || "No content generated";

    res.json({
      title: "AI Generated Blog",
      content: output
    });

  } catch (err) {
    console.error(err);
    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});