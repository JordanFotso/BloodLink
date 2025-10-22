const express = require('express');
const router = express.Router();
const banqueDeSangController = require('../controllers/banqueDeSangController');

router.post('/', banqueDeSangController.create);
router.get('/', banqueDeSangController.getAll);
router.get('/:id', banqueDeSangController.getById);
router.put('/:id', banqueDeSangController.update);
router.delete('/:id', banqueDeSangController.delete);

module.exports = router;
