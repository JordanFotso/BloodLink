const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Seul un médecin peut créer, mettre à jour ou supprimer une demande.
router.post('/', protect, authorize('medecin'), demandeController.create);
router.put('/:id', protect, authorize('medecin'), demandeController.update);
router.delete('/:id', protect, authorize('medecin'), demandeController.delete);

// Get demands for the logged-in doctor
router.get('/me', protect, authorize('medecin'), demandeController.getMyDemandes);

// Tout utilisateur connecté (médecin ou donneur) peut voir les demandes.
router.get('/', protect, demandeController.getAll);
router.get('/:id', protect, demandeController.getById);

module.exports = router;
