const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Medecin, Donneur } = require('../models');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

// Fonction pour générer un token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwt_secret, {
    expiresIn: '1d', // Le token expirera dans 1 jour
  });
};

// Contrôleur de connexion
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  // 1. Validation simple des entrées
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, mot de passe et rôle sont requis.' });
  }

  if (role !== 'medecin' && role !== 'donneur') {
    return res.status(400).json({ message: 'Le rôle doit être "medecin" ou "donneur".' });
  }

  try {
    // 2. Sélectionner le modèle en fonction du rôle
    const User = role === 'medecin' ? Medecin : Donneur;

    // 3. Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 4. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.mot_de_passe);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 5. Générer le token et l'envoyer
    const token = generateToken(user.id, role);

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};
