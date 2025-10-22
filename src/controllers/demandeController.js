const { Demande, Medecin } = require('../models');

const demandeController = {
  // Create a new Demande
  async create(req, res) {
    try {
      const demande = await Demande.create(req.body);
      return res.status(201).json(demande);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all Demandes, optionally with associated Medecin
  async getAll(req, res) {
    try {
      const demandes = await Demande.findAll({
        include: [{ model: Medecin }],
      });
      return res.status(200).json(demandes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single Demande by ID, optionally with associated Medecin
  async getById(req, res) {
    try {
      const demande = await Demande.findByPk(req.params.id, {
        include: [{ model: Medecin }],
      });
      if (demande) {
        return res.status(200).json(demande);
      } else {
        return res.status(404).json({ error: 'Demande not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a Demande by ID
  async update(req, res) {
    try {
      const [updated] = await Demande.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedDemande = await Demande.findByPk(req.params.id);
        return res.status(200).json(updatedDemande);
      } else {
        return res.status(404).json({ error: 'Demande not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a Demande by ID
  async delete(req, res) {
    try {
      const deleted = await Demande.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'Demande not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = demandeController;
