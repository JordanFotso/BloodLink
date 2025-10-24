
const request = require('supertest');
const express = require('express');
const demandeRoutes = require('../src/routes/demandeRoutes');
const { Demande } = require('../src/models');

const app = express();
app.use(express.json());
app.use('/demandes', demandeRoutes);

jest.mock('../src/models', () => ({
  Demande: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Demande API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /demandes', () => {
    it('should create a new demande', async () => {
      const nouvelleDemande = { id_medecin: 1, groupe_sanguin: 'A+', quantite: 2, urgence: 'Haute', statut: 'En attente' };
      Demande.create.mockResolvedValue({ id: 1, ...nouvelleDemande });

      const res = await request(app)
        .post('/demandes')
        .send(nouvelleDemande);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouvelleDemande });
      expect(Demande.create).toHaveBeenCalledWith(nouvelleDemande);
    });

    it('should return 400 if creation fails', async () => {
      const nouvelleDemande = { id_medecin: 1 };
      Demande.create.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/demandes')
        .send(nouvelleDemande);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /demandes', () => {
    it('should return all demandes', async () => {
      const demandes = [{ id: 1, groupe_sanguin: 'A+' }, { id: 2, groupe_sanguin: 'B-' }];
      Demande.findAll.mockResolvedValue(demandes);

      const res = await request(app).get('/demandes');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(demandes);
      expect(Demande.findAll).toHaveBeenCalled();
    });

    it('should return 500 if fetching all fails', async () => {
      Demande.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/demandes');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /demandes/:id', () => {
    it('should return a demande by ID', async () => {
      const demande = { id: 1, groupe_sanguin: 'A+' };
      Demande.findByPk.mockResolvedValue(demande);

      const res = await request(app).get('/demandes/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(demande);
      expect(Demande.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 404 if demande not found', async () => {
      Demande.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/demandes/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Demande not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      Demande.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/demandes/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /demandes/:id', () => {
    it('should update a demande by ID', async () => {
      const updatedData = { statut: 'Approuvée' };
      const updatedDemande = { id: 1, statut: 'Approuvée' };
      Demande.update.mockResolvedValue([1]);
      Demande.findByPk.mockResolvedValue(updatedDemande);

      const res = await request(app)
        .put('/demandes/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedDemande);
      expect(Demande.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
    });

    it('should return 404 if demande to update not found', async () => {
      Demande.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/demandes/99')
        .send({ statut: 'Approuvée' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Demande not found' });
    });

    it('should return 400 if update fails', async () => {
      Demande.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/demandes/1')
        .send({ statut: 'Approuvée' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /demandes/:id', () => {
    it('should delete a demande by ID', async () => {
      Demande.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/demandes/1');

      expect(res.statusCode).toEqual(204);
      expect(Demande.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if demande to delete not found', async () => {
      Demande.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/demandes/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Demande not found' });
    });

    it('should return 500 if deletion fails', async () => {
      Demande.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/demandes/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
