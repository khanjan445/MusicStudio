const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'users.csv');
const header = 'name,email,password,phone,avatar,isProSubscribed,createdAt\n';

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
    if (values.length >= 3) {
      // Handles both legacy 4-column CSVs and new 7-column CSVs seamlessly
      const isNewFormat = values.length >= 7;
      users.push({
        username: values[0],
        email: values[1],
        password: values[2],
        phone: isNewFormat ? (values[3] || '') : '',
        avatar: isNewFormat ? (values[4] || '👤') : '👤',
        isProSubscribed: isNewFormat ? (values[5] === 'true') : false,
        createdAt: isNewFormat ? (values[6] || new Date().toISOString()) : (values[3] || new Date().toISOString())
      });
    }
  });
  return users;
}

function writeUsersToCsv(users) {
  const rows = [
    ['name', 'email', 'password', 'phone', 'avatar', 'isProSubscribed', 'createdAt'],
    ...users.map((user) => [
      user.username || user.name,
      user.email,
      user.password || '',
      user.phone || '',
      user.avatar || '👤',
      user.isProSubscribed ? 'true' : 'false',
      user.createdAt || new Date().toISOString()
    ]),
  ];
  const csvContent = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n') + '\n';
  fs.writeFileSync(csvPath, csvContent, 'utf8');
}

module.exports = {
  csvPath,
  readUsersFromCsv,
  writeUsersToCsv
};
