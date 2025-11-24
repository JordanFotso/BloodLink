const { Demande, Medecin, Donneur, Notification } = require('../models');

const demandeController = {
  // Create a new Demande and notify donors
  async create(req, res) {
    try {
      // Assign doctor ID and set default status/urgency
      const demandeData = { 
        ...req.body, 
        id_medecin: req.user.id,
        statut: 'active', // Set default status
        urgence: req.body.urgence || 'moyenne' // Set default urgency
      };

      // 1. Create the Demande
      const demande = await Demande.create(demandeData);

      // 2. Find matching donors
      const matchingDonors = await Donneur.findAll({
        where: { groupe_sanguin: demande.groupe_sanguin }
      });

      if (matchingDonors.length > 0) {
        // 3. Prepare notifications
        const notifications = matchingDonors.map(donneur => ({
          id_donneur: donneur.id,
          id_demande: demande.id,
          message: `Nouvelle demande de sang pour le groupe ${demande.groupe_sanguin} par ${req.user.nom}.`,
          statut: 'non lu'
        }));

        // 4. Bulk create notifications
        await Notification.bulkCreate(notifications);
      }

      return res.status(201).json(demande);
    } catch (error) {
      console.error("Error creating Demande:", error);
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all Demandes for the logged-in doctor
  async getMyDemandes(req, res) {
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les médecins peuvent voir leurs propres demandes.' });
    }
    try {
      const demandes = await Demande.findAll({
        where: { id_medecin: req.user.id },
        include: [{ model: Medecin }],
        order: [['id', 'DESC']]
      });
      return res.status(200).json(demandes);
    } catch (error) {
      console.error("Error fetching doctor's Demandes:", error);
      return res.status(500).json({ error: error.message });
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
      const demande = await Demande.findByPk(parseInt(req.params.id, 10), {
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
        where: { id: parseInt(req.params.id, 10) },
      });
      if (updated) {
        const updatedDemande = await Demande.findByPk(parseInt(req.params.id, 10));
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
        where: { id: parseInt(req.params.id, 10) },
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
