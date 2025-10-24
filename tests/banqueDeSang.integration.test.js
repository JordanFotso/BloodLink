
const request = require('supertest');
const express = require('express');
const banqueDeSangRoutes = require('../src/routes/banqueDeSangRoutes');
const { BanqueDeSang } = require('../src/models');

const app = express();
app.use(express.json());
app.use('/banques-de-sang', banqueDeSangRoutes);

jest.mock('../src/models', () => ({
  BanqueDeSang: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('BanqueDeSang API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /banques-de-sang', () => {
    it('should create a new banque de sang', async () => {
      const nouvelleBanque = { nom: 'Hopital Central', localisation: 'Yaounde', contact: '123456789' };
      BanqueDeSang.create.mockResolvedValue({ id: 1, ...nouvelleBanque });

      const res = await request(app)
        .post('/banques-de-sang')
        .send(nouvelleBanque);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouvelleBanque });
      expect(BanqueDeSang.create).toHaveBeenCalledWith(nouvelleBanque);
    });

    it('should return 400 if creation fails', async () => {
      const nouvelleBanque = { nom: 'Hopital Central' };
      BanqueDeSang.create.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/banques-de-sang')
        .send(nouvelleBanque);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /banques-de-sang', () => {
    it('should return all banques de sang', async () => {
      const banques = [{ id: 1, nom: 'Hopital Central' }, { id: 2, nom: 'Hopital General' }];
      BanqueDeSang.findAll.mockResolvedValue(banques);

      const res = await request(app).get('/banques-de-sang');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(banques);
      expect(BanqueDeSang.findAll).toHaveBeenCalled();
    });

    it('should return 500 if fetching all fails', async () => {
      BanqueDeSang.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/banques-de-sang');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /banques-de-sang/:id', () => {
    it('should return a banque de sang by ID', async () => {
      const banque = { id: 1, nom: 'Hopital Central' };
      BanqueDeSang.findByPk.mockResolvedValue(banque);

      const res = await request(app).get('/banques-de-sang/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(banque);
      expect(BanqueDeSang.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 404 if banque de sang not found', async () => {
      BanqueDeSang.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/banques-de-sang/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'BanqueDeSang not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      BanqueDeSang.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/banques-de-sang/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /banques-de-sang/:id', () => {
    it('should update a banque de sang by ID', async () => {
      const updatedData = { nom: 'Nouveau Nom' };
      const updatedBanque = { id: 1, nom: 'Nouveau Nom' };
      BanqueDeSang.update.mockResolvedValue([1]);
      BanqueDeSang.findByPk.mockResolvedValue(updatedBanque);

      const res = await request(app)
        .put('/banques-de-sang/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedBanque);
      expect(BanqueDeSang.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
    });

    it('should return 404 if banque de sang to update not found', async () => {
      BanqueDeSang.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/banques-de-sang/99')
        .send({ nom: 'Nouveau Nom' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'BanqueDeSang not found' });
    });

    it('should return 400 if update fails', async () => {
      BanqueDeSang.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/banques-de-sang/1')
        .send({ nom: 'Nouveau Nom' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /banques-de-sang/:id', () => {
    it('should delete a banque de sang by ID', async () => {
      BanqueDeSang.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/banques-de-sang/1');

      expect(res.statusCode).toEqual(204);
      expect(BanqueDeSang.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if banque de sang to delete not found', async () => {
      BanqueDeSang.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/banques-de-sang/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'BanqueDeSang not found' });
    });

    it('should return 500 if deletion fails', async () => {
      BanqueDeSang.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/banques-de-sang/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
