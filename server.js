require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs"); // FIXED
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;
const SECRET = process.env.JWT_SECRET || "secret";

// ===== MONGODB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ===== MODELS =====
const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  credits: { type: Number, default: 3 },
  isPro: { type: Boolean, default: false }
}));

const Blog = mongoose.model("Blog", new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  views: { type: Number, default: 0 }
}));

// ===== AUTH =====
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.json({ message: "No token ❌" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.json({ message: "Invalid token ❌" });
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

  try {
    await User.create({ email, password: hashed });
    res.json({ message: "User created ✅" });
  } catch {
    res.json({ message: "User exists ❌" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found ❌" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Wrong password ❌" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

// ===== AI GENERATE =====
app.get("/generate", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user.isPro && user.credits <= 0) {
    return res.json({
      title: "Limit Reached ❌",
      content: "Upgrade to continue 🚀"
    });
  }

  if (!user.isPro) {
    user.credits--;
    await user.save();
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Write a blog about earning money online" }
        ]
      })
    });

    const data = await r.json();

    res.json({
      content: data.choices?.[0]?.message?.content || "No content",
      creditsLeft: user.isPro ? "Unlimited" : user.credits
    });

  } catch {
    res.json({ content: "AI failed ❌" });
  }
});

// ===== SAVE BLOG =====
app.post("/save", auth, async (req, res) => {
  const { title, content } = req.body;

  await Blog.create({
    userId: req.userId,
    title,
    content
  });

  res.json({ message: "Saved ✅" });
});

// ===== GET BLOGS =====
app.get("/blogs", auth, async (req, res) => {
  const blogs = await Blog.find({ userId: req.userId });
  res.json(blogs);
});

// ===== VIEW BLOG =====
app.get("/blog/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) return res.send("Not found");

  blog.views++;
  await blog.save();

  res.send(`
    <h1>${blog.title}</h1>
    <p>${blog.content}</p>
    <p>Views: ${blog.views}</p>
  `);
});

// ===== UPGRADE =====
app.post("/upgrade", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, {
    isPro: true,
    credits: 999
  });

  res.json({ message: "Upgraded 🚀" });
});

// ===== START =====
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});