const { BanqueDeSang } = require('../models');

const banqueDeSangController = {
  // Create a new BanqueDeSang
  async create(req, res) {
    try {
      const banqueDeSang = await BanqueDeSang.create(req.body);
      return res.status(201).json(banqueDeSang);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all BanquesDeSang
  async getAll(req, res) {
    try {
      const banquesDeSang = await BanqueDeSang.findAll();
      return res.status(200).json(banquesDeSang);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single BanqueDeSang by ID
  async getById(req, res) {
    try {
      const banqueDeSang = await BanqueDeSang.findByPk(req.params.id);
      if (banqueDeSang) {
        return res.status(200).json(banqueDeSang);
      } else {
        return res.status(404).json({ error: 'BanqueDeSang not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a BanqueDeSang by ID
  async update(req, res) {
    try {
      const [updated] = await BanqueDeSang.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedBanqueDeSang = await BanqueDeSang.findByPk(req.params.id);
        return res.status(200).json(updatedBanqueDeSang);
      } else {
        return res.status(404).json({ error: 'BanqueDeSang not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a BanqueDeSang by ID
  async delete(req, res) {
    try {
      const deleted = await BanqueDeSang.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'BanqueDeSang not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = banqueDeSangController;
