const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../src/routes/notificationRoutes');
const { Notification, Donneur, Demande, Medecin } = require('../src/models');

// Mock the middleware
jest.mock('../src/middlewares/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Inject mock user based on a header for test flexibility
    if (req.headers.mock_user_id) {
      req.user = { id: parseInt(req.headers.mock_user_id, 10), role: req.headers.mock_user_role || 'donneur' };
    }
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/notifications', notificationRoutes);

// Mock the models
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
  Medecin: {},
}));

describe('Notification API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notifications/me', () => {
    it('should return notifications for the logged-in donor', async () => {
      const userId = 1;
      const userNotifications = [{ id: 1, id_donneur: userId, message: 'Test' }];
      Notification.findAll.mockResolvedValue(userNotifications);

      const res = await request(app)
        .get('/notifications/me')
        .set('mock_user_id', userId)
        .set('mock_user_role', 'donneur');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(userNotifications);
      expect(Notification.findAll).toHaveBeenCalledWith({
        where: { id_donneur: userId },
        include: [{ model: Demande, include: [{ model: Medecin, attributes: ['nom', 'email'] }] }],
        order: [['id', 'DESC']]
      });
    });

    it('should return 403 if user is not a donor', async () => {
        const res = await request(app)
          .get('/notifications/me')
          .set('mock_user_id', 2)
          .set('mock_user_role', 'medecin');
  
        expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /notifications/:id', () => {
    it('should update a notification if user is owner', async () => {
      const userId = 1;
      const notificationId = 10;
      const ownedNotification = { id: notificationId, id_donneur: userId, statut: 'non lu' };
      const updatedData = { statut: 'lu' };

      Notification.findByPk.mockResolvedValue(ownedNotification);
      Notification.update.mockResolvedValue([1]); // Mock successful update

      // Re-mock findByPk to return the updated object after the update
      Notification.findByPk.mockResolvedValueOnce(ownedNotification)
                           .mockResolvedValueOnce({ ...ownedNotification, ...updatedData });

      const res = await request(app)
        .put(`/notifications/${notificationId}`)
        .set('mock_user_id', userId)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.statut).toEqual('lu');
    });

    it('should return 403 if user is not owner', async () => {
        const userId = 1;
        const otherUserId = 2;
        const notificationId = 11;
        const notOwnedNotification = { id: notificationId, id_donneur: otherUserId, statut: 'non lu' };
  
        Notification.findByPk.mockResolvedValue(notOwnedNotification);
  
        const res = await request(app)
          .put(`/notifications/${notificationId}`)
          .set('mock_user_id', userId)
          .send({ statut: 'lu' });
  
        expect(res.statusCode).toEqual(403);
      });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a notification if user is owner', async () => {
        const userId = 1;
        const notificationId = 12;
        const ownedNotification = { id: notificationId, id_donneur: userId };

        Notification.findByPk.mockResolvedValue(ownedNotification);
        Notification.destroy.mockResolvedValue(1);

        const res = await request(app)
            .delete(`/notifications/${notificationId}`)
            .set('mock_user_id', userId);

        expect(res.statusCode).toEqual(204);
    });

    it('should return 403 if user is not owner', async () => {
        const userId = 1;
        const otherUserId = 2;
        const notificationId = 13;
        const notOwnedNotification = { id: notificationId, id_donneur: otherUserId };

        Notification.findByPk.mockResolvedValue(notOwnedNotification);

        const res = await request(app)
            .delete(`/notifications/${notificationId}`)
            .set('mock_user_id', userId);

        expect(res.statusCode).toEqual(403);
    });
  });

  // Keep old tests for basic functionality where auth is not required
  describe('POST /notifications', () => {
    it('should create a new notification', async () => {
      const nouvelleNotification = { id_donneur: 1, id_demande: 1, statut: 'Envoyée' };
      Notification.create.mockResolvedValue({ id: 1, ...nouvelleNotification });

      const res = await request(app)
        .post('/notifications')
        .send(nouvelleNotification);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 1, ...nouvelleNotification });
    });
  });

  describe('GET /notifications', () => {
    it('should return all notifications', async () => {
      const notifications = [{ id: 1, statut: 'Envoyée' }];
      Notification.findAll.mockResolvedValue(notifications);
      const res = await request(app).get('/notifications');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(notifications);
    });
  });
});