const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');

// --- Controllers ---
async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'User already exists' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

// --- Exports ---
module.exports = { register, login};
