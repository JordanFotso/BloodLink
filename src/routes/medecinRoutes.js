const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');

router.post('/', medecinController.create);
router.get('/', medecinController.getAll);
router.get('/:id', medecinController.getById);
router.put('/:id', medecinController.update);
router.delete('/:id', medecinController.delete);

module.exports = router;
