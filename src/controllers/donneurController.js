const { Donneur } = require('../models');

const donneurController = {
  // Create a new Donneur
  async create(req, res) {
    try {
      const donneur = await Donneur.create(req.body);
      return res.status(201).json(donneur);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all Donneurs
  async getAll(req, res) {
    try {
      const donneurs = await Donneur.findAll();
      return res.status(200).json(donneurs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single Donneur by ID
  async getById(req, res) {
    try {
      const donneur = await Donneur.findByPk(req.params.id);
      if (donneur) {
        return res.status(200).json(donneur);
      } else {
        return res.status(404).json({ error: 'Donneur not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a Donneur by ID
  async update(req, res) {
    try {
      const [updated] = await Donneur.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedDonneur = await Donneur.findByPk(req.params.id);
        return res.status(200).json(updatedDonneur);
      } else {
        return res.status(404).json({ error: 'Donneur not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a Donneur by ID
  async delete(req, res) {
    try {
      const deleted = await Donneur.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'Donneur not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = donneurController;
