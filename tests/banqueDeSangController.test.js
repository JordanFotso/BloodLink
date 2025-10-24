
const banqueDeSangController = require('../src/controllers/banqueDeSangController');
const { BanqueDeSang } = require('../src/models');

jest.mock('../src/models', () => ({
  BanqueDeSang: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('BanqueDeSangController', () => {
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
    it('should create a new banque de sang and return 201', async () => {
      const nouvelleBanque = { id: 1, nom: 'Hopital Central', localisation: 'Yaounde', contact: '123456789' };
      req.body = nouvelleBanque;
      BanqueDeSang.create.mockResolvedValue(nouvelleBanque);

      await banqueDeSangController.create(req, res);

      expect(BanqueDeSang.create).toHaveBeenCalledWith(nouvelleBanque);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nouvelleBanque);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { nom: 'Hopital Central' };
      BanqueDeSang.create.mockRejectedValue(new Error(errorMessage));

      await banqueDeSangController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all banques de sang and status 200', async () => {
      const banques = [{ id: 1, nom: 'Hopital Central' }, { id: 2, nom: 'Hopital General' }];
      BanqueDeSang.findAll.mockResolvedValue(banques);

      await banqueDeSangController.getAll(req, res);

      expect(BanqueDeSang.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(banques);
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        BanqueDeSang.findAll.mockRejectedValue(new Error(errorMessage));

        await banqueDeSangController.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a banque de sang and status 200 if found', async () => {
        const banque = { id: 1, nom: 'Hopital Central' };
        req.params.id = 1;
        BanqueDeSang.findByPk.mockResolvedValue(banque);

        await banqueDeSangController.getById(req, res);

        expect(BanqueDeSang.findByPk).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(banque);
    });

    it('should return 404 if banque de sang not found', async () => {
        req.params.id = 99;
        BanqueDeSang.findByPk.mockResolvedValue(null);

        await banqueDeSangController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'BanqueDeSang not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        req.params.id = 1;
        BanqueDeSang.findByPk.mockRejectedValue(new Error(errorMessage));

        await banqueDeSangController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a banque de sang and return 200', async () => {
        const updatedData = { nom: 'Nouveau Nom' };
        const updatedBanque = { id: 1, nom: 'Nouveau Nom' };
        req.params.id = 1;
        req.body = updatedData;
        BanqueDeSang.update.mockResolvedValue([1]);
        BanqueDeSang.findByPk.mockResolvedValue(updatedBanque);

        await banqueDeSangController.update(req, res);

        expect(BanqueDeSang.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedBanque);
    });

    it('should return 404 if banque de sang to update is not found', async () => {
        req.params.id = 99;
        req.body = { nom: 'Nouveau Nom' };
        BanqueDeSang.update.mockResolvedValue([0]);

        await banqueDeSangController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'BanqueDeSang not found' });
    });

    it('should return 400 on error', async () => {
        const errorMessage = 'Erreur de mise à jour';
        req.params.id = 1;
        req.body = { nom: 'Nouveau Nom' };
        BanqueDeSang.update.mockRejectedValue(new Error(errorMessage));

        await banqueDeSangController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a banque de sang and return 204', async () => {
        req.params.id = 1;
        BanqueDeSang.destroy.mockResolvedValue(1);

        await banqueDeSangController.delete(req, res);

        expect(BanqueDeSang.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if banque de sang to delete is not found', async () => {
        req.params.id = 99;
        BanqueDeSang.destroy.mockResolvedValue(0);

        await banqueDeSangController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'BanqueDeSang not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur de suppression';
        req.params.id = 1;
        BanqueDeSang.destroy.mockRejectedValue(new Error(errorMessage));

        await banqueDeSangController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
