const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.create);
router.get('/', notificationController.getAll);
router.get('/:id', notificationController.getById);
router.put('/:id', notificationController.update);
router.delete('/:id', notificationController.delete);

module.exports = router;
