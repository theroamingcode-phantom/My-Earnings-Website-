import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

let blogs = []; // in-memory storage

// AI Generate Route
app.get("/generate", async (req, res) => {
  try {
    const topic = req.query.topic || "earn money online";

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Write a professional blog about ${topic}`,
        }),
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({
        title: "Error",
        content: "Invalid AI response ❌",
      });
    }

    const text = data[0]?.generated_text || "No content";

    res.json({
      title: `Blog on ${topic}`,
      content: text,
    });

  } catch (err) {
    res.json({
      title: "Error",
      content: "AI generation failed ❌",
    });
  }
});

// Save Blog
app.post("/save", (req, res) => {
  const { title, content } = req.body;

  blogs.push({
    id: Date.now(),
    title,
    content,
    views: 0,
  });

  res.json({ message: "Saved ✅" });
});

// Get Blogs
app.get("/blogs", (req, res) => {
  res.json(blogs);
});

// View Blog
app.get("/view/:id", (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);
  if (blog) {
    blog.views++;
    res.json(blog);
  } else {
    res.status(404).send("Not found");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});