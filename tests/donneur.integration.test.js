
const request = require('supertest');
const express = require('express');
const donneurRoutes = require('../src/routes/donneurRoutes');
const { Donneur } = require('../src/models');

const app = express();
app.use(express.json());
app.use('/donneurs', donneurRoutes);

jest.mock('../src/models', () => ({
  Donneur: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Donneur API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /donneurs', () => {
    it('should create a new donneur', async () => {
      const nouveauDonneur = { nom: 'Jean Dupont', groupe_sanguin: 'O+', localisation: 'Douala' };
      Donneur.create.mockResolvedValue({ id: 1, ...nouveauDonneur });

      const res = await request(app)
        .post('/donneurs')
        .send(nouveauDonneur);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouveauDonneur });
      expect(Donneur.create).toHaveBeenCalledWith(nouveauDonneur);
    });

    it('should return 400 if creation fails', async () => {
      const nouveauDonneur = { nom: 'Jean Dupont' };
      Donneur.create.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/donneurs')
        .send(nouveauDonneur);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /donneurs', () => {
    it('should return all donneurs', async () => {
      const donneurs = [{ id: 1, nom: 'Jean Dupont' }, { id: 2, nom: 'Marie Curie' }];
      Donneur.findAll.mockResolvedValue(donneurs);

      const res = await request(app).get('/donneurs');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(donneurs);
      expect(Donneur.findAll).toHaveBeenCalled();
    });

    it('should return 500 if fetching all fails', async () => {
      Donneur.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/donneurs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /donneurs/:id', () => {
    it('should return a donneur by ID', async () => {
      const donneur = { id: 1, nom: 'Jean Dupont' };
      Donneur.findByPk.mockResolvedValue(donneur);

      const res = await request(app).get('/donneurs/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(donneur);
      expect(Donneur.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 404 if donneur not found', async () => {
      Donneur.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/donneurs/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Donneur not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      Donneur.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/donneurs/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /donneurs/:id', () => {
    it('should update a donneur by ID', async () => {
      const updatedData = { nom: 'Nouveau Nom' };
      const updatedDonneur = { id: 1, nom: 'Nouveau Nom' };
      Donneur.update.mockResolvedValue([1]);
      Donneur.findByPk.mockResolvedValue(updatedDonneur);

      const res = await request(app)
        .put('/donneurs/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedDonneur);
      expect(Donneur.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
    });

    it('should return 404 if donneur to update not found', async () => {
      Donneur.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/donneurs/99')
        .send({ nom: 'Nouveau Nom' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Donneur not found' });
    });

    it('should return 400 if update fails', async () => {
      Donneur.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/donneurs/1')
        .send({ nom: 'Nouveau Nom' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /donneurs/:id', () => {
    it('should delete a donneur by ID', async () => {
      Donneur.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/donneurs/1');

      expect(res.statusCode).toEqual(204);
      expect(Donneur.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if donneur to delete not found', async () => {
      Donneur.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/donneurs/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Donneur not found' });
    });

    it('should return 500 if deletion fails', async () => {
      Donneur.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/donneurs/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
