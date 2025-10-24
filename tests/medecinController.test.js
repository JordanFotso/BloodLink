
const medecinController = require('../src/controllers/medecinController');
const { Medecin } = require('../src/models');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');
jest.mock('../src/models', () => ({
  Medecin: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('MedecinController', () => {
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
    it('should create a new medecin and return 201', async () => {
      const newMedecinData = { nom: 'Dr. Smith', email: 'smith@example.com', mot_de_passe: 'password123' };
      const hashedPassword = 'hashedPassword123';
      const createdMedecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com', mot_de_passe: hashedPassword };

      req.body = newMedecinData;
      bcrypt.hash.mockResolvedValue(hashedPassword);
      Medecin.create.mockResolvedValue(createdMedecin);

      await medecinController.create(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith(newMedecinData.mot_de_passe, 10);
      expect(Medecin.create).toHaveBeenCalledWith({ ...newMedecinData, mot_de_passe: hashedPassword });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMedecin);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { nom: 'Dr. Smith' };
      bcrypt.hash.mockRejectedValue(new Error(errorMessage));

      await medecinController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a medecin and return 200', async () => {
      const updatedData = { nom: 'Dr. John Doe' };
      const updatedMedecin = { id: 1, nom: 'Dr. John Doe', email: 'smith@example.com' };
      req.params.id = 1;
      req.body = updatedData;

      Medecin.update.mockResolvedValue([1]);
      Medecin.findByPk.mockResolvedValue(updatedMedecin);

      await medecinController.update(req, res);

      expect(Medecin.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 }, individualHooks: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedMedecin);
    });

    it('should update medecin password and return 200', async () => {
      const updatedData = { mot_de_passe: 'newPassword' };
      const hashedPassword = 'newHashedPassword';
      const updatedMedecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com' };
      req.params.id = 1;
      req.body = updatedData;

      bcrypt.hash.mockResolvedValue(hashedPassword);
      Medecin.update.mockResolvedValue([1]);
      Medecin.findByPk.mockResolvedValue(updatedMedecin);

      await medecinController.update(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith(updatedData.mot_de_passe, 10);
      expect(Medecin.update).toHaveBeenCalledWith({ mot_de_passe: hashedPassword }, { where: { id: 1 }, individualHooks: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedMedecin);
    });

    it('should return 404 if medecin to update is not found', async () => {
      req.params.id = 99;
      req.body = { nom: 'Dr. John Doe' };
      Medecin.update.mockResolvedValue([0]);

      await medecinController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medecin not found' });
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de mise à jour';
      req.params.id = 1;
      req.body = { nom: 'Dr. John Doe' };
      Medecin.update.mockRejectedValue(new Error(errorMessage));

      await medecinController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a medecin and status 200 if found', async () => {
      const medecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com' };
      req.params.id = 1;
      Medecin.findByPk.mockResolvedValue(medecin);

      await medecinController.getById(req, res);

      expect(Medecin.findByPk).toHaveBeenCalledWith(1, { attributes: { exclude: ['mot_de_passe'] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(medecin);
    });

    it('should return 404 if medecin not found', async () => {
      req.params.id = 99;
      Medecin.findByPk.mockResolvedValue(null);

      await medecinController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medecin not found' });
    });

    it('should return 500 on error', async () => {
      const errorMessage = 'Erreur serveur';
      req.params.id = 1;
      Medecin.findByPk.mockRejectedValue(new Error(errorMessage));

      await medecinController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all medecins and status 200', async () => {
      const medecins = [{ id: 1, nom: 'Dr. Smith' }, { id: 2, nom: 'Dr. Jane Doe' }];
      Medecin.findAll.mockResolvedValue(medecins);

      await medecinController.getAll(req, res);

      expect(Medecin.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['mot_de_passe'] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(medecins);
    });

    it('should return 500 on error', async () => {
      const errorMessage = 'Erreur serveur';
      Medecin.findAll.mockRejectedValue(new Error(errorMessage));

      await medecinController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a medecin and return 204', async () => {
      req.params.id = 1;
      Medecin.destroy.mockResolvedValue(1);

      await medecinController.delete(req, res);

      expect(Medecin.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if medecin to delete is not found', async () => {
      req.params.id = 99;
      Medecin.destroy.mockResolvedValue(0);

      await medecinController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Medecin not found' });
    });

    it('should return 500 on error', async () => {
      const errorMessage = 'Erreur de suppression';
      req.params.id = 1;
      Medecin.destroy.mockRejectedValue(new Error(errorMessage));

      await medecinController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
