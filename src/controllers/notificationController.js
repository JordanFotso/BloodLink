const { Notification, Donneur, Demande } = require('../models');

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
      const [updated] = await Notification.update(req.body, {
        where: { id: parseInt(req.params.id, 10) },
      });
      if (updated) {
        const updatedNotification = await Notification.findByPk(parseInt(req.params.id, 10));
        return res.status(200).json(updatedNotification);
      } else {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a Notification by ID
  async delete(req, res) {
    try {
      const deleted = await Notification.destroy({
        where: { id: parseInt(req.params.id, 10) },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
