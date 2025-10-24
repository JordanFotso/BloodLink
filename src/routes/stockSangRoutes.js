const express = require('express');
const router = express.Router();
const stockSangController = require('../controllers/stockSangController');

router.post('/', stockSangController.create);
router.get('/', stockSangController.getAll);
router.get('/:id', stockSangController.getById);
router.put('/:id', stockSangController.update);
router.delete('/:id', stockSangController.delete);

module.exports = router;
