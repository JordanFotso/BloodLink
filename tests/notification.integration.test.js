
const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../src/routes/notificationRoutes');
const { Notification, Donneur, Demande } = require('../src/models');

const app = express();
app.use(express.json());
app.use('/notifications', notificationRoutes);

jest.mock('../src/models', () => ({
  Notification: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Donneur: {},
  Demande: {},
}));

describe('Notification API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /notifications', () => {
    it('should create a new notification', async () => {
      const nouvelleNotification = { id_donneur: 1, id_demande: 1, statut: 'Envoyée' };
      Notification.create.mockResolvedValue({ id: 1, ...nouvelleNotification });

      const res = await request(app)
        .post('/notifications')
        .send(nouvelleNotification);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouvelleNotification });
      expect(Notification.create).toHaveBeenCalledWith(nouvelleNotification);
    });

    it('should return 400 if creation fails', async () => {
      const nouvelleNotification = { id_donneur: 1 };
      Notification.create.mockRejectedValue(new Error('Erreur de création'));

      const res = await request(app)
        .post('/notifications')
        .send(nouvelleNotification);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de création' });
    });
  });

  describe('GET /notifications', () => {
    it('should return all notifications', async () => {
      const notifications = [{ id: 1, statut: 'Envoyée' }, { id: 2, statut: 'Lue' }];
      Notification.findAll.mockResolvedValue(notifications);

      const res = await request(app).get('/notifications');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(notifications);
      expect(Notification.findAll).toHaveBeenCalledWith({ include: [{ model: Donneur }, { model: Demande }] });
    });

    it('should return 500 if fetching all fails', async () => {
      Notification.findAll.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/notifications');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('GET /notifications/:id', () => {
    it('should return a notification by ID', async () => {
      const notification = { id: 1, statut: 'Envoyée' };
      Notification.findByPk.mockResolvedValue(notification);

      const res = await request(app).get('/notifications/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(notification);
      expect(Notification.findByPk).toHaveBeenCalledWith(1, { include: [{ model: Donneur }, { model: Demande }] });
    });

    it('should return 404 if notification not found', async () => {
      Notification.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/notifications/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Notification not found' });
    });

    it('should return 500 if fetching by ID fails', async () => {
      Notification.findByPk.mockRejectedValue(new Error('Erreur serveur'));

      const res = await request(app).get('/notifications/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('PUT /notifications/:id', () => {
    it('should update a notification by ID', async () => {
      const updatedData = { statut: 'Lue' };
      const updatedNotification = { id: 1, statut: 'Lue' };
      Notification.update.mockResolvedValue([1]);
      Notification.findByPk.mockResolvedValue(updatedNotification);

      const res = await request(app)
        .put('/notifications/1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedNotification);
      expect(Notification.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
    });

    it('should return 404 if notification to update not found', async () => {
      Notification.update.mockResolvedValue([0]);

      const res = await request(app)
        .put('/notifications/99')
        .send({ statut: 'Lue' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Notification not found' });
    });

    it('should return 400 if update fails', async () => {
      Notification.update.mockRejectedValue(new Error('Erreur de mise à jour'));

      const res = await request(app)
        .put('/notifications/1')
        .send({ statut: 'Lue' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Erreur de mise à jour' });
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a notification by ID', async () => {
      Notification.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/notifications/1');

      expect(res.statusCode).toEqual(204);
      expect(Notification.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if notification to delete not found', async () => {
      Notification.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/notifications/99');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Notification not found' });
    });

    it('should return 500 if deletion fails', async () => {
      Notification.destroy.mockRejectedValue(new Error('Erreur de suppression'));

      const res = await request(app).delete('/notifications/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Erreur de suppression' });
    });
  });
});
