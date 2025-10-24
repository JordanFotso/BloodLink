
const demandeController = require('../src/controllers/demandeController');
const { Demande, Medecin } = require('../src/models');

jest.mock('../src/models', () => ({
  Demande: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Medecin: {},
}));

describe('DemandeController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
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
    it('should create a new demande and return 201', async () => {
      const nouvelleDemande = { id: 1, id_medecin: 1, groupe_sanguin: 'A+', quantite: 2, urgence: 'Haute', statut: 'En attente' };
      req.body = nouvelleDemande;
      Demande.create.mockResolvedValue(nouvelleDemande);

      await demandeController.create(req, res);

      expect(Demande.create).toHaveBeenCalledWith(nouvelleDemande);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nouvelleDemande);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { id_medecin: 1 };
      Demande.create.mockRejectedValue(new Error(errorMessage));

      await demandeController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

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
});
