const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());

// =========================
// ✅ API ROUTES (PEHLE)
// =========================

// 🔹 Generate AI Post
app.get("/api/generate", (req, res) => {
  res.json({
    title: "🔥 AI Generated Title",
    content: "Yeh AI generated demo content hai. Ab tumhara button perfectly kaam karega 🚀"
  });
});

// 🔹 Get posts
let posts = [];
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// 🔹 Add post
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title & Content required" });
  }

  const newPost = {
    id: Date.now(),
    title,
    content
  };

  posts.push(newPost);
  res.json(newPost);
});

// 🔹 Stats
let stats = { views: 0, clicks: 0 };

app.get("/api/stats", (req, res) => {
  stats.views++;
  res.json(stats);
});

app.get("/api/track/click", (req, res) => {
  stats.clicks++;
  res.json({ success: true });
});

// =========================
// ⚠️ STATIC (BAAD ME)
// =========================
app.use(express.static(path.join(__dirname, "public")));

// =========================
// ❌ 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found ❌" });
});

// =========================
// 🚀 START SERVER
// =========================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});