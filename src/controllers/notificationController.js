const { Notification, Donneur, Demande, Medecin } = require('../models');

const notificationController = {
  // Create a new Notification
  async create(req, res) {
    try {
      const notification = await Notification.create(req.body);
      return res.status(201).json(notification);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get notifications for the logged-in user
  async getMyNotifications(req, res) {
    if (req.user.role !== 'donneur') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les donneurs peuvent voir leurs notifications.' });
    }
    try {
      const notifications = await Notification.findAll({
        where: { id_donneur: req.user.id },
        include: [{
          model: Demande,
          include: [{ model: Medecin, attributes: ['nom', 'email'] }]
        }],
        order: [['id', 'DESC']]
      });
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get all Notifications, optionally with associated Donneur and Demande
  async getAll(req, res) {
    try {
      const notifications = await Notification.findAll({
        include: [{ model: Donneur }, { model: Demande }],
      });
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single Notification by ID, optionally with associated Donneur and Demande
  async getById(req, res) {
    try {
      const notification = await Notification.findByPk(parseInt(req.params.id, 10), {
        include: [{ model: Donneur }, { model: Demande }],
      });
      if (notification) {
        return res.status(200).json(notification);
      } else {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a Notification by ID
  async update(req, res) {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Ownership check
      if (notification.id_donneur !== req.user.id) {
        return res.status(403).json({ error: 'User not authorized to update this notification' });
      }

      const [updated] = await Notification.update(req.body, {
        where: { id: notificationId },
      });

      if (updated) {
        const updatedNotification = await Notification.findByPk(notificationId);
        return res.status(200).json(updatedNotification);
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a Notification by ID
  async delete(req, res) {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      // Ownership check
      if (notification.id_donneur !== req.user.id) {
        return res.status(403).json({ error: 'User not authorized to delete this notification' });
      }

      const deleted = await Notification.destroy({
        where: { id: notificationId },
      });

      if (deleted) {
        return res.status(204).send();
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
