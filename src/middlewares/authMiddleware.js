const jwt = require('jsonwebtoken');
const { Medecin, Donneur } = require('../models');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est dans l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, config.jwt_secret);

      // Attacher l'utilisateur et le rôle à la requête
      req.role = decoded.role;
      const User = decoded.role === 'medecin' ? Medecin : Donneur;
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['mot_de_passe'] } });

      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token.' });
  }
};

// Middleware pour vérifier les rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json( {
        message: `Accès refusé. Le rôle "${req.role}" n'est pas autorisé pour cette ressource.` 
      });
    }
    next();
  };
};

