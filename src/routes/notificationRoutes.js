const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Get notifications for the logged-in user
router.get('/me', protect, notificationController.getMyNotifications);

router.post('/', notificationController.create);
router.get('/', notificationController.getAll);
router.get('/:id', notificationController.getById);
router.put('/:id', protect, notificationController.update);
router.delete('/:id', protect, notificationController.delete);

module.exports = router;
