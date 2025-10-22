const { Medecin } = require('../models');

const medecinController = {
  // Create a new Medecin
  async create(req, res) {
    try {
      const medecin = await Medecin.create(req.body);
      return res.status(201).json(medecin);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all Medecins
  async getAll(req, res) {
    try {
      const medecins = await Medecin.findAll();
      return res.status(200).json(medecins);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single Medecin by ID
  async getById(req, res) {
    try {
      const medecin = await Medecin.findByPk(req.params.id);
      if (medecin) {
        return res.status(200).json(medecin);
      } else {
        return res.status(404).json({ error: 'Medecin not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a Medecin by ID
  async update(req, res) {
    try {
      const [updated] = await Medecin.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedMedecin = await Medecin.findByPk(req.params.id);
        return res.status(200).json(updatedMedecin);
      } else {
        return res.status(404).json({ error: 'Medecin not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a Medecin by ID
  async delete(req, res) {
    try {
      const deleted = await Medecin.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'Medecin not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = medecinController;
