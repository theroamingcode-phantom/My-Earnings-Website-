import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const Blog = mongoose.model("Blog", {
  title: String,
  content: String,
  views: { type: Number, default: 0 }
});

app.use(express.json());
app.use(express.static("public"));

// AI Generate
app.get("/generate", async (req, res) => {
  try {
    const topic = req.query.topic || "earn money online";

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Write a detailed blog on ${topic}`
        })
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({ title: "Error", content: "AI failed ❌" });
    }

    res.json({
      title: topic,
      content: data[0].generated_text
    });

  } catch {
    res.json({ title: "Error", content: "Server error ❌" });
  }
});

// Save blog
app.post("/save", async (req, res) => {
  const blog = new Blog(req.body);
  await blog.save();
  res.json({ message: "Saved ✅" });
});

// Get all blogs
app.get("/blogs", async (req, res) => {
  const blogs = await Blog.find().sort({ _id: -1 });
  res.json(blogs);
});

// View blog
app.get("/view/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog.views++;
  await blog.save();
  res.json(blog);
});

app.listen(PORT, () => console.log("Server running 🚀"));