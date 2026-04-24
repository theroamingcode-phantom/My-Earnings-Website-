const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ OpenAI setup
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================== API ROUTES ==================

// 👉 AI Generate Post
app.get("/api/generate", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Write a professional blog post with a title and content about making money online.",
        },
      ],
    });

    const text = completion.choices[0].message.content;

    // Simple split (title + content)
    const lines = text.split("\n");
    const title = lines[0].replace(/#/g, "").trim();
    const content = lines.slice(1).join("\n");

    res.json({ title, content });
  } catch (err) {
    console.error(err);
    res.json({
      title: "Error generating",
      content: "Check API key or server logs",
    });
  }
});

// 👉 Get Posts
app.get("/api/posts", (req, res) => {
  const data = fs.readFileSync("posts.json");
  res.json(JSON.parse(data));
});

// 👉 Add Post
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;

  const posts = JSON.parse(fs.readFileSync("posts.json"));
  posts.push({ title, content });

  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));

  res.json({ success: true });
});

// 👉 Analytics
app.get("/api/stats", (req, res) => {
  const stats = JSON.parse(fs.readFileSync("analytics.json"));
  res.json(stats);
});

app.get("/api/track/view", (req, res) => {
  const stats = JSON.parse(fs.readFileSync("analytics.json"));
  stats.views++;
  fs.writeFileSync("analytics.json", JSON.stringify(stats, null, 2));
  res.json({ success: true });
});

app.get("/api/track/click", (req, res) => {
  const stats = JSON.parse(fs.readFileSync("analytics.json"));
  stats.clicks++;
  fs.writeFileSync("analytics.json", JSON.stringify(stats, null, 2));
  res.json({ success: true });
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});