
const request = require('supertest');
const express = require('express');
const stockSangRoutes = require('../src/routes/stockSangRoutes');
const { StockSang, BanqueDeSang } = require('../src/models');

const app = express();
app.use(express.json());
app.use('/stock-sang', stockSangRoutes);

jest.mock('../src/models', () => ({
  StockSang: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  BanqueDeSang: {},
}));

describe('StockSang API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /stock-sang', () => {
    it('should create a new stock de sang', async () => {
      const nouveauStock = { id_banque: 1, groupe_sanguin: 'A+', quantite: 10 };
      StockSang.create.mockResolvedValue({ id: 1, ...nouveauStock });

      const res = await request(app)
        .post('/stock-sang')
        .send(nouveauStock);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouveauStock });
      expect(StockSang.create).toHaveBeenCalledWith(nouveauStock);
    });

    it('should return 400 if creation fails', async () => {
      const nouveauStock = { id_banque: 1 };
      StockSang.create.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/stock-sang')
        .send(nouveauStock);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /stock-sang', () => {
    it('should return all stocks de sang', async () => {
      const stocks = [{ id: 1, groupe_sanguin: 'A+' }, { id: 2, groupe_sanguin: 'B-' }];
      StockSang.findAll.mockResolvedValue(stocks);

      const res = await request(app).get('/stock-sang');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(stocks);
      expect(StockSang.findAll).toHaveBeenCalledWith({ include: [{ model: BanqueDeSang }] });
    });

    it('should return 500 if fetching all fails', async () => {
      StockSang.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/stock-sang');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /stock-sang/:id', () => {
    it('should return a stock de sang by ID', async () => {
      const stock = { id: 1, groupe_sanguin: 'A+' };
      StockSang.findByPk.mockResolvedValue(stock);

      const res = await request(app).get('/stock-sang/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(stock);
      expect(StockSang.findByPk).toHaveBeenCalledWith(1, { include: [{ model: BanqueDeSang }] });
    });

    it('should return 404 if stock de sang not found', async () => {
      StockSang.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/stock-sang/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'StockSang not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      StockSang.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/stock-sang/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /stock-sang/:id', () => {
    it('should update a stock de sang by ID', async () => {
      const updatedData = { quantite: 15 };
      const updatedStock = { id: 1, quantite: 15 };
      StockSang.update.mockResolvedValue([1]);
      StockSang.findByPk.mockResolvedValue(updatedStock);

      const res = await request(app)
        .put('/stock-sang/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedStock);
      expect(StockSang.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
    });

    it('should return 404 if stock de sang to update not found', async () => {
      StockSang.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/stock-sang/99')
        .send({ quantite: 15 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'StockSang not found' });
    });

    it('should return 400 if update fails', async () => {
      StockSang.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/stock-sang/1')
        .send({ quantite: 15 });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /stock-sang/:id', () => {
    it('should delete a stock de sang by ID', async () => {
      StockSang.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/stock-sang/1');

      expect(res.statusCode).toEqual(204);
      expect(StockSang.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if stock de sang to delete not found', async () => {
      StockSang.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/stock-sang/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'StockSang not found' });
    });

    it('should return 500 if deletion fails', async () => {
      StockSang.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/stock-sang/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
