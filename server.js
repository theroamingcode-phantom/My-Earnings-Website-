const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err.message));

// ================= SCHEMA =================
const Post = mongoose.model("Post", {
  prompt: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// ================= ROUTES =================

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server Running");
});

// 🔥 GENERATE API
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    // 👉 Temporary AI (stable fallback)
    const content = `🔥 AI Generated Content:\n\n${prompt}\n\nThis is a demo AI response. Upgrade for real AI.`;

    // Save in DB
    const newPost = await Post.create({ prompt, content });

    res.json({
      success: true,
      content: newPost.content
    });

  } catch (err) {
    console.log("❌ Generate Error:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});