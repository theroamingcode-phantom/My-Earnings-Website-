const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cors());

// ===== Static Files (IMPORTANT) =====
app.use(express.static(path.join(__dirname, "public")));

// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err.message));

// ===== Schema =====
const Blog = mongoose.model("Blog", {
  prompt: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// ===== Home Route (LOAD FRONTEND) =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Generate Route =====
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const content = `🔥 AI Generated Content:\n\n${prompt}\n\nThis is working perfectly 🚀`;

    const saved = await Blog.create({ prompt, content });

    res.json({
      success: true,
      content: saved.content
    });

  } catch (err) {
    console.log("❌ Generate Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// ===== Get Blogs =====
app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// ===== Server Start =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});