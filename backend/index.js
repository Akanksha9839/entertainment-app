// === DNS FIX (Google DNS force) ===
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '8.8.4.4']);
// ===================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

console.log('DNS servers forced to Google');
console.log('Trying to connect to MongoDB...');

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('MongoDB Connection Failed');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  bookmarks: [{
    mediaId: Number,
    mediaType: String,
    title: String,
    poster: String,
    addedAt: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmarks Routes
app.get('/api/bookmarks', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/bookmarks', authMiddleware, async (req, res) => {
  const { mediaId, mediaType, title, poster } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const exists = user.bookmarks.some(b => b.mediaId === mediaId);
    if (!exists) {
      user.bookmarks.push({ mediaId, mediaType, title, poster });
      await user.save();
    }
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/bookmarks/:mediaId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bookmarks = user.bookmarks.filter(b => b.mediaId !== Number(req.params.mediaId));
    await user.save();
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
