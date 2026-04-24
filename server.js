const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// OpenAI setup
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================= AI GENERATE =================
app.get("/api/generate", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Write a professional blog post about earning money online. Give output in this format:\nTitle: ...\nContent: ..."
        }
      ],
    });

    const text = response.choices[0].message.content;

    // Extract title + content safely
    const titleMatch = text.match(/Title:\s*(.*)/i);
    const contentMatch = text.match(/Content:\s*([\s\S]*)/i);

    const title = titleMatch ? titleMatch[1].trim() : "AI Generated Blog";
    const content = contentMatch ? contentMatch[1].trim() : text;

    res.json({ title, content });

  } catch (error) {
    console.error("AI ERROR:", error.message);

    res.status(500).json({
      title: "Error",
      content: "AI generation failed. Check API key or logs."
    });
  }
});

// ================= POSTS =================
app.get("/api/posts", (req, res) => {
  try {
    const data = fs.readFileSync("posts.json");
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;

  let posts = [];
  try {
    posts = JSON.parse(fs.readFileSync("posts.json"));
  } catch {}

  posts.push({ title, content });

  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));

  res.json({ success: true });
});

// ================= ANALYTICS =================
app.get("/api/stats", (req, res) => {
  try {
    const stats = JSON.parse(fs.readFileSync("analytics.json"));
    res.json(stats);
  } catch {
    res.json({ views: 0, clicks: 0 });
  }
});

app.get("/api/track/view", (req, res) => {
  let stats = { views: 0, clicks: 0 };

  try {
    stats = JSON.parse(fs.readFileSync("analytics.json"));
  } catch {}

  stats.views++;
  fs.writeFileSync("analytics.json", JSON.stringify(stats, null, 2));

  res.json({ success: true });
});

app.get("/api/track/click", (req, res) => {
  let stats = { views: 0, clicks: 0 };

  try {
    stats = JSON.parse(fs.readFileSync("analytics.json"));
  } catch {}

  stats.clicks++;
  fs.writeFileSync("analytics.json", JSON.stringify(stats, null, 2));

  res.json({ success: true });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});