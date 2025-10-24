
const donneurController = require('../src/controllers/donneurController');
const { Donneur } = require('../src/models');

jest.mock('../src/models', () => ({
  Donneur: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('DonneurController', () => {
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
    it('should create a new donneur and return 201', async () => {
      const nouveauDonneur = { id: 1, nom: 'Jean Dupont', groupe_sanguin: 'O+', localisation: 'Douala' };
      req.body = nouveauDonneur;
      Donneur.create.mockResolvedValue(nouveauDonneur);

      await donneurController.create(req, res);

      expect(Donneur.create).toHaveBeenCalledWith(nouveauDonneur);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nouveauDonneur);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { nom: 'Jean Dupont' };
      Donneur.create.mockRejectedValue(new Error(errorMessage));

      await donneurController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all donneurs and status 200', async () => {
      const donneurs = [{ id: 1, nom: 'Jean Dupont' }, { id: 2, nom: 'Marie Curie' }];
      Donneur.findAll.mockResolvedValue(donneurs);

      await donneurController.getAll(req, res);

      expect(Donneur.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(donneurs);
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        Donneur.findAll.mockRejectedValue(new Error(errorMessage));

        await donneurController.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a donneur and status 200 if found', async () => {
        const donneur = { id: 1, nom: 'Jean Dupont' };
        req.params.id = 1;
        Donneur.findByPk.mockResolvedValue(donneur);

        await donneurController.getById(req, res);

        expect(Donneur.findByPk).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(donneur);
    });

    it('should return 404 if donneur not found', async () => {
        req.params.id = 99;
        Donneur.findByPk.mockResolvedValue(null);

        await donneurController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Donneur not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        req.params.id = 1;
        Donneur.findByPk.mockRejectedValue(new Error(errorMessage));

        await donneurController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a donneur and return 200', async () => {
        const updatedData = { nom: 'Nouveau Nom' };
        const updatedDonneur = { id: 1, nom: 'Nouveau Nom' };
        req.params.id = 1;
        req.body = updatedData;
        Donneur.update.mockResolvedValue([1]);
        Donneur.findByPk.mockResolvedValue(updatedDonneur);

        await donneurController.update(req, res);

        expect(Donneur.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedDonneur);
    });

    it('should return 404 if donneur to update is not found', async () => {
        req.params.id = 99;
        req.body = { nom: 'Nouveau Nom' };
        Donneur.update.mockResolvedValue([0]);

        await donneurController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Donneur not found' });
    });

    it('should return 400 on error', async () => {
        const errorMessage = 'Erreur de mise à jour';
        req.params.id = 1;
        req.body = { nom: 'Nouveau Nom' };
        Donneur.update.mockRejectedValue(new Error(errorMessage));

        await donneurController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a donneur and return 204', async () => {
        req.params.id = 1;
        Donneur.destroy.mockResolvedValue(1);

        await donneurController.delete(req, res);

        expect(Donneur.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if donneur to delete is not found', async () => {
        req.params.id = 99;
        Donneur.destroy.mockResolvedValue(0);

        await donneurController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Donneur not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur de suppression';
        req.params.id = 1;
        Donneur.destroy.mockRejectedValue(new Error(errorMessage));

        await donneurController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
