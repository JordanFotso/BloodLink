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

// Contrôleur d'inscription
exports.signup = async (req, res) => {
  const { name, email, password, role, ...otherFields } = req.body;

  // 1. Validation simple
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nom, email, mot de passe et rôle sont requis.' });
  }
  if (role !== 'medecin' && role !== 'donneur' && role !== 'banque') {
    return res.status(400).json({ message: 'Le rôle doit être "medecin", "donneur" ou "banque".' });
  }

  try {
    // 2. Vérifier si l'utilisateur existe déjà
    const medecinExists = await Medecin.findOne({ where: { email } });
    const donneurExists = await Donneur.findOne({ where: { email } });
    if (medecinExists || donneurExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // 3. Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe = await bcrypt.hash(password, salt);

    let newUser;
    const userData = { nom: name, email, mot_de_passe, ...otherFields };

    // 4. Créer le nouvel utilisateur en fonction du rôle
    if (role === 'medecin') {
      newUser = await Medecin.create(userData);
    } else { // Pour 'donneur' ou 'banque', les champs additionnels sont optionnels pour l'instant
      newUser = await Donneur.create(userData);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Veuillez vous connecter.',
      user: {
        id: newUser.id,
        nom: newUser.nom,
        email: newUser.email,
        role: role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Contrôleur de connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation simple des entrées
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
  }

  try {
    let user;
    let role;

    // 2. Chercher l'utilisateur dans les deux tables
    user = await Medecin.findOne({ where: { email } });
    if (user) {
      role = 'medecin';
    } else {
      user = await Donneur.findOne({ where: { email } });
      if (user) {
        // Ici, on pourrait avoir une colonne 'role' dans la table Donneur
        // pour différencier 'donneur' de 'banque'. Pour l'instant, on assume 'donneur'.
        role = user.role || 'donneur'; 
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 3. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.mot_de_passe);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 4. Générer le token et l'envoyer
    const token = generateToken(user.id, role);
    
    // Exclure le mot de passe de la réponse
    const userResponse = user.toJSON();
    delete userResponse.mot_de_passe;


    res.status(200).json({
      success: true,
      token: token,
      user: { ...userResponse, role: role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Contrôleur pour récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
  // req.user et req.role sont attachés par le middleware 'protect'
  if (!req.user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }
  
  res.status(200).json({
    success: true,
    user: { ...req.user.toJSON(), role: req.role }
  });
};
