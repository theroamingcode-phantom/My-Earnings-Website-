const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("Mongo Error ❌", err));

// Simple Schema (Blog)
const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", BlogSchema);

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running ✅");
});

// AI Generate Route (Working Demo)
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = {
      title: "AI Generated Blog",
      content: `This is AI generated content for: ${prompt} 🚀`
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "AI Error ❌" });
  }
});

// Save Blog
app.post("/save", async (req, res) => {
  try {
    const { title, content } = req.body;

    const blog = new Blog({ title, content });
    await blog.save();

    res.json({ message: "Saved ✅" });
  } catch (err) {
    res.status(500).json({ error: "Save Error ❌" });
  }
});

// Get All Blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Fetch Error ❌" });
  }
});

// Start Server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});