const express = require('express');
const router = express.Router();
const donneurController = require('../controllers/donneurController');

router.post('/', donneurController.create);
router.get('/', donneurController.getAll);
router.get('/:id', donneurController.getById);
router.put('/:id', donneurController.update);
router.delete('/:id', donneurController.delete);

module.exports = router;
