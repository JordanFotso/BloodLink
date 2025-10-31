const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Inscrire un nouvel utilisateur (médecin ou donneur)
// @access  Public
router.post('/signup', authController.signup);

// @route   POST /api/auth/login
// @desc    Connecter un utilisateur (médecin ou donneur)
// @access  Public
router.post('/login', authController.login);

module.exports = router;
