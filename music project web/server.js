const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const rootDir = __dirname;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

let dbConnected = false;
let User = require('../models/User');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/musicProject';
mongoose.connect(mongoUri)
  .then(() => {
    dbConnected = true;
    console.log('✅ Database Connected');
  })
  .catch(err => {
    dbConnected = false;
    console.error('DB connection error:', err);
    console.log('Falling back to CSV storage at runtime.');
  });

// CSV fallback when DB is not available
const csvPath = path.join(rootDir, 'users.csv');
const header = 'name,email,password,createdAt\n';

function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function readUsersFromCsv() {
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, header, 'utf8');
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf8').trim();
  if (!content) {
    fs.writeFileSync(csvPath, header, 'utf8');
    return [];
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const users = [];
  lines.slice(1).forEach((line) => {
    const columns = line.match(/("[^"]*(?:""[^"]*)*"|[^,]+)/g) || [];
    const values = columns.map((value) => value.replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (values.length >= 4) {
      users.push({
        username: values[0],
        email: values[1],
        password: values[2],
        createdAt: values[3],
      });
    }
  });

  return users;
}

function writeUsersToCsv(users) {
  const rows = [
    ['name', 'email', 'password', 'createdAt'],
    ...users.map((user) => [user.username || user.name, user.email, user.password || '', user.createdAt || new Date().toISOString()]),
  ];

  const csvContent = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n') + '\n';

  fs.writeFileSync(csvPath, csvContent, 'utf8');
}

// `User` will be set only when DB connection is established.

// Return all users (without passwords)
app.get('/api/users', async (req, res) => {
  try {
    if (dbConnected) {
      const users = await User.find().select('-password').lean();
      return res.json(users);
    }

    const users = readUsersFromCsv().map((u) => ({
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
    }));
    return res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    if (dbConnected) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already in use' });

      const user = new User({ username, email, password });
      await user.save();
      const userSafe = user.toObject();
      delete userSafe.password;
      return res.status(201).json({ message: 'User saved', user: userSafe });
    }

    // CSV fallback
    const users = readUsersFromCsv();
    const exists = users.find(u => u.email === email);
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashed, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeUsersToCsv(users);
    const userSafe = { username: newUser.username, email: newUser.email, createdAt: newUser.createdAt };
    res.status(201).json({ message: 'User saved (CSV fallback)', user: userSafe });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});