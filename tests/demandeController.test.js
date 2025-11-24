const demandeController = require('../src/controllers/demandeController');
const { Demande, Medecin, Donneur, Notification } = require('../src/models');

jest.mock('../src/models', () => ({
  Demande: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Medecin: {},
  Donneur: {
    findAll: jest.fn(),
  },
  Notification: {
    bulkCreate: jest.fn(),
  },
}));

describe('DemandeController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1, nom: 'Test Doctor' } // Simuler l'utilisateur authentifié par défaut
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new demande, notify donors, and return 201', async () => {
      const demandeData = { groupe_sanguin: 'A+', quantite: 2, urgence: 'haute' };
      req.body = demandeData;

      const createdDemande = { id: 1, ...demandeData, id_medecin: req.user.id, statut: 'active' };
      const mockDonors = [{ id: 10 }, { id: 11 }];

      Demande.create.mockResolvedValue(createdDemande);
      Donneur.findAll.mockResolvedValue(mockDonors);
      Notification.bulkCreate.mockResolvedValue({});

      await demandeController.create(req, res);

      // 1. Check Demande creation
      expect(Demande.create).toHaveBeenCalledWith({
        ...demandeData,
        id_medecin: req.user.id,
        statut: 'active',
      });

      // 2. Check that we searched for donors
      expect(Donneur.findAll).toHaveBeenCalledWith({
        where: { groupe_sanguin: demandeData.groupe_sanguin }
      });
      
      // 3. Check that notifications were created
      expect(Notification.bulkCreate).toHaveBeenCalledWith([
        {
          id_donneur: mockDonors[0].id,
          id_demande: createdDemande.id,
          message: `Nouvelle demande de sang pour le groupe ${createdDemande.groupe_sanguin} par ${req.user.nom}.`,
          statut: 'non lu'
        },
        {
          id_donneur: mockDonors[1].id,
          id_demande: createdDemande.id,
          message: `Nouvelle demande de sang pour le groupe ${createdDemande.groupe_sanguin} par ${req.user.nom}.`,
          statut: 'non lu'
        }
      ]);

      // 4. Check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdDemande);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { groupe_sanguin: 'A+' };
      Demande.create.mockRejectedValue(new Error(errorMessage));

      await demandeController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  // ... (le reste des tests reste inchangé) ...
  describe('getAll', () => {
    it('should return all demandes and status 200', async () => {
      const demandes = [{ id: 1, groupe_sanguin: 'A+' }, { id: 2, groupe_sanguin: 'B-' }];
      Demande.findAll.mockResolvedValue(demandes);

      await demandeController.getAll(req, res);

      expect(Demande.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(demandes);
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        Demande.findAll.mockRejectedValue(new Error(errorMessage));

        await demandeController.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a demande and status 200 if found', async () => {
        const demande = { id: 1, groupe_sanguin: 'A+' };
        req.params.id = 1;
        Demande.findByPk.mockResolvedValue(demande);

        await demandeController.getById(req, res);

        expect(Demande.findByPk).toHaveBeenCalledWith(1, { include: [{ model: Medecin }] });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(demande);
    });

    it('should return 404 if demande not found', async () => {
        req.params.id = 99;
        Demande.findByPk.mockResolvedValue(null);

        await demandeController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Demande not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        req.params.id = 1;
        Demande.findByPk.mockRejectedValue(new Error(errorMessage));

        await demandeController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a demande and return 200', async () => {
        const updatedData = { statut: 'Approuvée' };
        const updatedDemande = { id: 1, statut: 'Approuvée' };
        req.params.id = 1;
        req.body = updatedData;
        Demande.update.mockResolvedValue([1]);
        Demande.findByPk.mockResolvedValue(updatedDemande);

        await demandeController.update(req, res);

        expect(Demande.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedDemande);
    });

    it('should return 404 if demande to update is not found', async () => {
        req.params.id = 99;
        req.body = { statut: 'Approuvée' };
        Demande.update.mockResolvedValue([0]);

        await demandeController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Demande not found' });
    });

    it('should return 400 on error', async () => {
        const errorMessage = 'Erreur de mise à jour';
        req.params.id = 1;
        req.body = { statut: 'Approuvée' };
        Demande.update.mockRejectedValue(new Error(errorMessage));

        await demandeController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a demande and return 204', async () => {
        req.params.id = 1;
        Demande.destroy.mockResolvedValue(1);

        await demandeController.delete(req, res);

        expect(Demande.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if demande to delete is not found', async () => {
        req.params.id = 99;
        Demande.destroy.mockResolvedValue(0);

        await demandeController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Demande not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur de suppression';
        req.params.id = 1;
        Demande.destroy.mockRejectedValue(new Error(errorMessage));

        await demandeController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getMyDemandes', () => {
    it('should return all demands for the logged-in doctor', async () => {
      const doctorId = 1;
      const doctorDemands = [{ id: 1, id_medecin: doctorId, groupe_sanguin: 'O+' }];
      req.user = { id: doctorId, role: 'medecin' };
      Demande.findAll.mockResolvedValue(doctorDemands);

      await demandeController.getMyDemandes(req, res);

      expect(Demande.findAll).toHaveBeenCalledWith({
        where: { id_medecin: doctorId },
        include: [{ model: Medecin }],
        order: [['id', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(doctorDemands);
    });

    it('should return 403 if user is not a medecin', async () => {
      req.user = { id: 2, role: 'donneur' };

      await demandeController.getMyDemandes(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Accès refusé. Seuls les médecins peuvent voir leurs propres demandes.' });
    });

    it('should return 500 on error', async () => {
      const errorMessage = 'Erreur serveur';
      req.user = { id: 1, role: 'medecin' };
      Demande.findAll.mockRejectedValue(new Error(errorMessage));

      await demandeController.getMyDemandes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});

