const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Load data
let posts = fs.existsSync('posts.json')
  ? JSON.parse(fs.readFileSync('posts.json'))
  : [];

let analytics = fs.existsSync('analytics.json')
  ? JSON.parse(fs.readFileSync('analytics.json'))
  : { views: 0, clicks: 0 };

// Routes
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  posts.push(req.body);
  fs.writeFileSync('posts.json', JSON.stringify(posts));
  res.json({ success: true });
});

// Tracking
app.get('/api/track/view', (req, res) => {
  analytics.views++;
  fs.writeFileSync('analytics.json', JSON.stringify(analytics));
  res.json({ success: true });
});

app.get('/api/track/click', (req, res) => {
  analytics.clicks++;
  fs.writeFileSync('analytics.json', JSON.stringify(analytics));
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  res.json(analytics);
});

app.listen(3000, () => console.log("Server running"));