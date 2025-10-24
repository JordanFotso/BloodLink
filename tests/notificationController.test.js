
const notificationController = require('../src/controllers/notificationController');
const { Notification, Donneur, Demande } = require('../src/models');

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

describe('NotificationController', () => {
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
    it('should create a new notification and return 201', async () => {
      const nouvelleNotification = { id: 1, id_donneur: 1, id_demande: 1, statut: 'Envoyée' };
      req.body = nouvelleNotification;
      Notification.create.mockResolvedValue(nouvelleNotification);

      await notificationController.create(req, res);

      expect(Notification.create).toHaveBeenCalledWith(nouvelleNotification);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nouvelleNotification);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { id_donneur: 1 };
      Notification.create.mockRejectedValue(new Error(errorMessage));

      await notificationController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all notifications and status 200', async () => {
      const notifications = [{ id: 1, statut: 'Envoyée' }, { id: 2, statut: 'Lue' }];
      Notification.findAll.mockResolvedValue(notifications);

      await notificationController.getAll(req, res);

      expect(Notification.findAll).toHaveBeenCalledWith({ include: [{ model: Donneur }, { model: Demande }] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(notifications);
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        Notification.findAll.mockRejectedValue(new Error(errorMessage));

        await notificationController.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a notification and status 200 if found', async () => {
        const notification = { id: 1, statut: 'Envoyée' };
        req.params.id = 1;
        Notification.findByPk.mockResolvedValue(notification);

        await notificationController.getById(req, res);

        expect(Notification.findByPk).toHaveBeenCalledWith(1, { include: [{ model: Donneur }, { model: Demande }] });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(notification);
    });

    it('should return 404 if notification not found', async () => {
        req.params.id = 99;
        Notification.findByPk.mockResolvedValue(null);

        await notificationController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Notification not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        req.params.id = 1;
        Notification.findByPk.mockRejectedValue(new Error(errorMessage));

        await notificationController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a notification and return 200', async () => {
        const updatedData = { statut: 'Lue' };
        const updatedNotification = { id: 1, statut: 'Lue' };
        req.params.id = 1;
        req.body = updatedData;
        Notification.update.mockResolvedValue([1]);
        Notification.findByPk.mockResolvedValue(updatedNotification);

        await notificationController.update(req, res);

        expect(Notification.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedNotification);
    });

    it('should return 404 if notification to update is not found', async () => {
        req.params.id = 99;
        req.body = { statut: 'Lue' };
        Notification.update.mockResolvedValue([0]);

        await notificationController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Notification not found' });
    });

    it('should return 400 on error', async () => {
        const errorMessage = 'Erreur de mise à jour';
        req.params.id = 1;
        req.body = { statut: 'Lue' };
        Notification.update.mockRejectedValue(new Error(errorMessage));

        await notificationController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a notification and return 204', async () => {
        req.params.id = 1;
        Notification.destroy.mockResolvedValue(1);

        await notificationController.delete(req, res);

        expect(Notification.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if notification to delete is not found', async () => {
        req.params.id = 99;
        Notification.destroy.mockResolvedValue(0);

        await notificationController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Notification not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur de suppression';
        req.params.id = 1;
        Notification.destroy.mockRejectedValue(new Error(errorMessage));

        await notificationController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
