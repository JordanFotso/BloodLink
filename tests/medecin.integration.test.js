const request = require('supertest');
const express = require('express');
const medecinRoutes = require('../src/routes/medecinRoutes');
const { Medecin } = require('../src/models');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use('/medecins', medecinRoutes);

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

describe('Medecin API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /medecins', () => {
    it('should create a new medecin', async () => {
      const newMedecinData = { nom: 'Dr. Smith', email: 'smith@example.com', mot_de_passe: 'password123' };
      const hashedPassword = 'hashedPassword123';
      const createdMedecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com', mot_de_passe: hashedPassword };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      Medecin.create.mockResolvedValue(createdMedecin);

      const res = await request(app)
        .post('/medecins')
        .send(newMedecinData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdMedecin);
      expect(bcrypt.hash).toHaveBeenCalledWith(newMedecinData.mot_de_passe, 10);
      expect(Medecin.create).toHaveBeenCalledWith({ ...newMedecinData, mot_de_passe: hashedPassword });
    });

    it('should return 400 if creation fails', async () => {
      const newMedecinData = { nom: 'Dr. Smith' };
      bcrypt.hash.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/medecins')
        .send(newMedecinData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /medecins', () => {
    it('should return all medecins', async () => {
      const medecins = [{ id: 1, nom: 'Dr. Smith' }, { id: 2, nom: 'Dr. Jane Doe' }];
      Medecin.findAll.mockResolvedValue(medecins);

      const res = await request(app).get('/medecins');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(medecins);
      expect(Medecin.findAll).toHaveBeenCalledWith({ attributes: { exclude: ['mot_de_passe'] } });
    });

    it('should return 500 if fetching all fails', async () => {
      Medecin.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/medecins');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /medecins/:id', () => {
    it('should return a medecin by ID', async () => {
      const medecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com' };
      Medecin.findByPk.mockResolvedValue(medecin);

      const res = await request(app).get('/medecins/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(medecin);
      expect(Medecin.findByPk).toHaveBeenCalledWith(1, { attributes: { exclude: ['mot_de_passe'] } });
    });

    it('should return 404 if medecin not found', async () => {
      Medecin.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/medecins/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Medecin not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      Medecin.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/medecins/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /medecins/:id', () => {
    it('should update a medecin by ID', async () => {
      const updatedData = { nom: 'Dr. John Doe' };
      const updatedMedecin = { id: 1, nom: 'Dr. John Doe', email: 'smith@example.com' };
      Medecin.update.mockResolvedValue([1]);
      Medecin.findByPk.mockResolvedValue(updatedMedecin);

      const res = await request(app)
        .put('/medecins/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedMedecin);
      expect(Medecin.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 }, individualHooks: true });
    });

    it('should update medecin password and return 200', async () => {
      const updatedData = { mot_de_passe: 'newPassword' };
      const hashedPassword = 'newHashedPassword';
      const updatedMedecin = { id: 1, nom: 'Dr. Smith', email: 'smith@example.com' };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      Medecin.update.mockResolvedValue([1]);
      Medecin.findByPk.mockResolvedValue(updatedMedecin);

      const res = await request(app)
        .put('/medecins/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedMedecin);
      expect(bcrypt.hash).toHaveBeenCalledWith(updatedData.mot_de_passe, 10);
      expect(Medecin.update).toHaveBeenCalledWith({ mot_de_passe: hashedPassword }, { where: { id: 1 }, individualHooks: true });
    });

    it('should return 404 if medecin to update not found', async () => {
      Medecin.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/medecins/99')
        .send({ nom: 'Dr. John Doe' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Medecin not found' });
    });

    it('should return 400 if update fails', async () => {
      Medecin.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/medecins/1')
        .send({ nom: 'Dr. John Doe' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /medecins/:id', () => {
    it('should delete a medecin by ID', async () => {
      Medecin.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/medecins/1');

      expect(res.statusCode).toEqual(204);
      expect(Medecin.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if medecin to delete not found', async () => {
      Medecin.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/medecins/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Medecin not found' });
    });

    it('should return 500 if deletion fails', async () => {
      Medecin.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/medecins/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
