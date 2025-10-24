const bcrypt = require('bcryptjs');
const { Medecin } = require('../models');

const medecinController = {
  // Create a new Medecin
  async create(req, res) {
    try {
      const { nom, email, mot_de_passe } = req.body;
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      const medecin = await Medecin.create({ nom, email, mot_de_passe: hashedPassword });
      return res.status(201).json(medecin);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Update a Medecin by ID
  async update(req, res) {
    try {
      const { mot_de_passe, ...otherUpdates } = req.body;
      let updateData = { ...otherUpdates };

      if (mot_de_passe) {
        updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
      }

      const [updated] = await Medecin.update(updateData, {
        where: { id: parseInt(req.params.id, 10) },
        individualHooks: true, // If you have beforeUpdate hooks in model
      });
      if (updated) {
        const updatedMedecin = await Medecin.findByPk(parseInt(req.params.id, 10), {
          attributes: { exclude: ['mot_de_passe'] },
        });
        return res.status(200).json(updatedMedecin);
      } else {
        return res.status(404).json({ error: 'Medecin not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get a single Medecin by ID
  async getById(req, res) {
    try {
      const medecin = await Medecin.findByPk(parseInt(req.params.id, 10), {
        attributes: { exclude: ['mot_de_passe'] },
      });
      if (medecin) {
        return res.status(200).json(medecin);
      } else {
        return res.status(404).json({ error: 'Medecin not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get all Medecins
  async getAll(req, res) {
    try {
      const medecins = await Medecin.findAll({
        attributes: { exclude: ['mot_de_passe'] },
      });
      return res.status(200).json(medecins);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete a Medecin by ID
  async delete(req, res) {
    try {
      const deleted = await Medecin.destroy({
        where: { id: parseInt(req.params.id, 10) },
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
