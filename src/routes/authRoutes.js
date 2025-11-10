const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/signup
// @desc    Inscrire un nouvel utilisateur (médecin ou donneur)
// @access  Public
router.post('/signup', authController.signup);

// @route   POST /api/auth/login
// @desc    Connecter un utilisateur (médecin ou donneur)
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/me
// @desc    Récupérer le profil de l'utilisateur connecté
// @access  Private
router.get('/me', protect, authController.getMe);

module.exports = router;
