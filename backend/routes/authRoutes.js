const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { readUsersFromCsv, writeUsersToCsv, csvPath } = require('../utils/csvHandler');

const router = express.Router();

// Helper to get User model safely if database is connected
function getUserModel(req) {
  if (mongoose.connection.readyState === 1) {
    return User;
  }
  return req.app.get('isDbConnected') ? req.app.get('UserModel') : null;
}

// In-memory OTP storage for reset password (for dev/demo)
const otpStore = new Map();

// Get list of users (excluding password)
router.get(['/users', '/api/users'], async (req, res) => {
  try {
    const User = getUserModel(req);
    if (User) {
      const users = await User.find().select('-password').lean();
      return res.json(users.map(u => ({ username: u.username, email: u.email, createdAt: u.createdAt })));
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

// Export CSV Endpoint
router.get(['/users/export-csv', '/api/users/export-csv'], (req, res) => {
  try {
    readUsersFromCsv(); // Ensures file exists
    res.download(csvPath, 'users.csv');
  } catch (err) {
    console.error('CSV Export error:', err);
    res.status(500).json({ error: 'Failed to export CSV file' });
  }
});

// Register New User
router.post(['/register', '/api/auth/register'], async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const User = getUserModel(req);

    if (User) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) return res.status(409).json({ error: 'Email already in use' });

      const user = new User({ username: cleanUsername, email: cleanEmail, password, phone: '', avatar: '👤', isProSubscribed: false });
      await user.save();
      return res.status(201).json({
        message: 'User registered successfully',
        user: { username: user.username, email: user.email, phone: user.phone || '', avatar: user.avatar || '👤', isProSubscribed: false, createdAt: user.createdAt }
      });
    }

    // Fallback to CSV
    const users = readUsersFromCsv();
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      username: cleanUsername,
      email: cleanEmail,
      password: hashed,
      phone: '',
      avatar: '👤',
      isProSubscribed: false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeUsersToCsv(users);

    return res.status(201).json({
      message: 'User registered successfully (CSV storage)',
      user: { username: newUser.username, email: newUser.email, phone: newUser.phone, avatar: newUser.avatar, isProSubscribed: false, createdAt: newUser.createdAt }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login User
router.post(['/login', '/api/auth/login'], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const User = getUserModel(req);

    if (User) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const validPassword = await user.comparePassword(password);
      if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

      return res.json({
        message: 'Login successful',
        user: { username: user.username, email: user.email, phone: user.phone || '', avatar: user.avatar || '👤', isProSubscribed: !!user.isProSubscribed, createdAt: user.createdAt }
      });
    }

    // CSV Fallback
    const users = readUsersFromCsv();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    return res.json({
      message: 'Login successful',
      user: { username: user.username, email: user.email, phone: user.phone || '', avatar: user.avatar || '👤', isProSubscribed: !!user.isProSubscribed, createdAt: user.createdAt }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Send OTP for password reset
router.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = email.trim().toLowerCase();
    const users = readUsersFromCsv();
    const userExists = users.some(u => u.email.toLowerCase() === cleanEmail);

    if (!userExists) {
      return res.status(404).json({ error: 'No account found with that email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, otp);

    return res.json({
      message: 'OTP generated successfully',
      otp: otp // Return for front-end demo notification display
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Reset Password with OTP
router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedOtp = otpStore.get(cleanEmail);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Update password in CSV
    const users = readUsersFromCsv();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIndex !== -1) {
      const hashed = await bcrypt.hash(newPassword, 10);
      users[userIndex].password = hashed;
      writeUsersToCsv(users);
    }

    otpStore.delete(cleanEmail);
    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Update Profile Endpoint (Nickname, Email, Phone, Avatar, Subscription)
router.put(['/users/profile', '/api/users/profile'], async (req, res) => {
  try {
    const { oldEmail, username, email, phone, avatar, isProSubscribed } = req.body;
    if (!oldEmail) {
      return res.status(400).json({ error: 'User identifier email is required' });
    }

    const cleanOldEmail = oldEmail.trim().toLowerCase();
    const cleanNewEmail = (email || oldEmail).trim().toLowerCase();
    const cleanUsername = (username || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanAvatar = (avatar || '').trim();

    const User = getUserModel(req);
    if (User) {
      const user = await User.findOne({ email: cleanOldEmail });
      if (user) {
        if (cleanUsername) user.username = cleanUsername;
        user.email = cleanNewEmail;
        user.phone = cleanPhone;
        if (cleanAvatar !== undefined) user.avatar = cleanAvatar;
        if (isProSubscribed !== undefined) user.isProSubscribed = !!isProSubscribed;
        await user.save();
        return res.json({
          message: 'Profile updated successfully',
          user: { username: user.username, email: user.email, phone: user.phone, avatar: user.avatar, isProSubscribed: user.isProSubscribed }
        });
      }
    }

    // CSV Fallback
    const users = readUsersFromCsv();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanOldEmail);
    if (userIndex !== -1) {
      if (cleanUsername) users[userIndex].username = cleanUsername;
      users[userIndex].email = cleanNewEmail;
      users[userIndex].phone = cleanPhone;
      if (cleanAvatar !== undefined) users[userIndex].avatar = cleanAvatar;
      if (isProSubscribed !== undefined) users[userIndex].isProSubscribed = !!isProSubscribed;
      writeUsersToCsv(users);
    }

    return res.json({
      message: 'Profile updated successfully',
      user: { username: cleanUsername, email: cleanNewEmail, phone: cleanPhone, avatar: cleanAvatar, isProSubscribed: !!isProSubscribed }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
