const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== DATABASE (temporary memory) =====
let blogs = [];

// ===== HOME =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== AI GENERATE (FIXED) =====
app.get("/generate", async (req, res) => {
  try {
    const topic = req.query.topic || "earn money online";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Write a professional blog about ${topic}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data || !data.choices) {
      return res.json({
        title: "Error",
        content: "Invalid AI response ❌"
      });
    }

    res.json({
      title: `Blog on ${topic}`,
      content: data.choices[0].message.content
    });

  } catch (err) {
    console.error("AI ERROR:", err);

    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// ===== SAVE BLOG =====
app.post("/save", (req, res) => {
  const { title, content } = req.body;

  blogs.push({
    id: Date.now(),
    title,
    content,
    views: 0
  });

  res.json({ message: "Saved ✅" });
});

// ===== GET BLOGS =====
app.get("/blogs", (req, res) => {
  res.json(blogs);
});

// ===== VIEW BLOG =====
app.get("/view/:id", (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);

  if (!blog) {
    return res.status(404).json({ error: "Not found" });
  }

  blog.views++;
  res.json(blog);
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});