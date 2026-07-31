const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const rootDir = __dirname;
const csvPath = path.join(rootDir, 'users.csv');
const header = 'name,email,password,createdAt\n';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

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
      users.push({ username: values[0], email: values[1], password: values[2], createdAt: values[3] });
    }
  });
  return users;
}

function writeUsersToCsv(users) {
  const rows = [
    ['name', 'email', 'password', 'createdAt'],
    ...users.map((user) => [user.username || user.name, user.email, user.password || '', user.createdAt || new Date().toISOString()]),
  ];
  const csvContent = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n') + '\n';
  fs.writeFileSync(csvPath, csvContent, 'utf8');
}

app.get('/api/users', (req, res) => {
  try {
    const users = readUsersFromCsv().map(u => ({ username: u.username, email: u.email, createdAt: u.createdAt }));
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error', err);
    try { fs.appendFileSync(path.join(rootDir, 'debug.log'), `GET error:\n${err.stack || err}\n\n`); } catch (e) { /* ignore */ }
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const users = readUsersFromCsv();
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashed, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeUsersToCsv(users);
    res.status(201).json({ message: 'User saved (CSV)', user: { username: newUser.username, email: newUser.email, createdAt: newUser.createdAt } });
  } catch (err) {
    console.error('POST /register error', err);
    try { fs.appendFileSync(path.join(rootDir, 'debug.log'), `POST error:\n${err.stack || err}\n\n`); } catch (e) { /* ignore */ }
    res.status(500).json({ error: 'Failed to save user' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(rootDir, 'index.html')));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Fixed CSV server running at http://localhost:' + port));
