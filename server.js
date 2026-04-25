require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;
const SECRET = "mysecretkey";

// ===== TEMP DATABASE (in-memory users) =====
let users = [];
let blogs = [];

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token ❌" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token ❌" });
  }
}

// ===== HOME =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    email,
    password: hashed,
    credits: 3
  };

  users.push(user);

  res.json({ message: "User created ✅" });
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) return res.json({ message: "User not found ❌" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.json({ message: "Wrong password ❌" });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ token });
});

// ===== AI GENERATE (PER USER CREDITS) =====
app.get("/generate", auth, async (req, res) => {
  const user = users.find(u => u.id === req.userId);

  if (user.credits <= 0) {
    return res.json({
      title: "Limit Reached ❌",
      content: "Upgrade to continue 🚀"
    });
  }

  user.credits--;

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
          { role: "user", content: "Write a professional blog about earning money online" }
        ]
      })
    });

    const data = await response.json();

    res.json({
      content: data.choices?.[0]?.message?.content || "No content",
      creditsLeft: user.credits
    });

  } catch {
    res.json({ content: "AI failed ❌" });
  }
});

// ===== UPGRADE =====
app.post("/upgrade", auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  user.credits = 999;

  res.json({ message: "Upgraded 🚀" });
});

// ===== SAVE BLOG =====
app.post("/save", auth, (req, res) => {
  const { title, content } = req.body;

  const blog = {
    id: Date.now(),
    userId: req.userId,
    title,
    content,
    views: 0
  };

  blogs.push(blog);

  res.json({ message: "Saved ✅" });
});

// ===== GET USER BLOGS =====
app.get("/blogs", auth, (req, res) => {
  const userBlogs = blogs.filter(b => b.userId === req.userId);
  res.json(userBlogs);
});

// ===== VIEW BLOG =====
app.get("/view/:id", (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);

  if (!blog) return res.json({ message: "Not found ❌" });

  blog.views++;
  res.json(blog);
});

// ===== START =====
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});