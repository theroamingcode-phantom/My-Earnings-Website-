const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Dummy database (in-memory)
let posts = [];
let stats = {
  views: 0,
  clicks: 0
};

// =========================
// ✅ ROUTES
// =========================

// 🔹 Get all posts
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// 🔹 Add post
app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title & content required" });
  }

  const newPost = {
    id: Date.now(),
    title,
    content
  };

  posts.push(newPost);
  res.json({ message: "Post added", post: newPost });
});

// 🔹 Stats
app.get("/api/stats", (req, res) => {
  stats.views++;
  res.json(stats);
});

// 🔹 Track click
app.get("/api/track/click", (req, res) => {
  stats.clicks++;
  res.json({ success: true });
});

// 🔹 AI Generate (FIXED 🚀)
app.get("/api/generate", (req, res) => {
  res.json({
    title: "🔥 AI Generated Blog Title",
    content:
      "Yeh ek demo AI generated content hai. Ab tumhara button perfectly kaam karega 🚀"
  });
});

// =========================
// ✅ ERROR HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found ❌" });
});

// =========================
// ✅ START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});