const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');
const validator = require('validator');

// MIDDLEWARE DE VALIDATION
function validateRegistration(req, res, next) {
  const { username, email, password } = req.body;
  
  const errors = [];
  
  if (!username || username.length < 3 || username.length > 50) {
    errors.push('Username must be 3-50 characters');
  }
  
  if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    errors.push('Password must contain uppercase, lowercase and number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    
    console.log('📝 Tentative d\'inscription:', { username, email });
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const newUser = await User.create({
      username,
      email,
      passwordHash
    });
    
    console.log('✅ Utilisateur créé:', newUser.id);
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );
    
    // Renvoyer le token et les infos utilisateur
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );

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
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { 
  validateRegistration,
  register,
  login 
};