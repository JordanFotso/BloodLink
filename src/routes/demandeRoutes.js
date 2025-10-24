const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');

router.post('/', demandeController.create);
router.get('/', demandeController.getAll);
router.get('/:id', demandeController.getById);
router.put('/:id', demandeController.update);
router.delete('/:id', demandeController.delete);

module.exports = router;
