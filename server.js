require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;

// ===== TEMP DATABASE (memory) =====
let blogs = [];

// ===== HOME =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== AI GENERATE =====
app.get("/generate", async (req, res) => {
  try {
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
            content: "Write a professional blog about earning money online"
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      title: "AI Generated Blog",
      content: data.choices?.[0]?.message?.content || "No content"
    });

  } catch (err) {
    console.error(err);
    res.json({
      title: "Error",
      content: "AI generation failed ❌"
    });
  }
});

// ===== SAVE BLOG (PUBLISH BUTTON) =====
app.post("/save", (req, res) => {
  const { title, content } = req.body;

  if (!content) {
    return res.json({ message: "No content ❌" });
  }

  const newBlog = {
    id: Date.now(),
    title: title || "Untitled",
    content,
    views: 0
  };

  blogs.push(newBlog);

  res.json({ message: "Blog published ✅" });
});

// ===== GET ALL BLOGS =====
app.get("/blogs", (req, res) => {
  res.json(blogs);
});

// ===== VIEW BLOG + INCREASE VIEWS =====
app.get("/view/:id", (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);

  if (!blog) {
    return res.status(404).json({ message: "Not found ❌" });
  }

  blog.views += 1;

  res.json(blog);
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});