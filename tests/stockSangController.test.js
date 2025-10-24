
const stockSangController = require('../src/controllers/stockSangController');
const { StockSang, BanqueDeSang } = require('../src/models');

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

describe('StockSangController', () => {
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
    it('should create a new stock de sang and return 201', async () => {
      const nouveauStock = { id: 1, id_banque: 1, groupe_sanguin: 'A+', quantite: 10 };
      req.body = nouveauStock;
      StockSang.create.mockResolvedValue(nouveauStock);

      await stockSangController.create(req, res);

      expect(StockSang.create).toHaveBeenCalledWith(nouveauStock);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nouveauStock);
    });

    it('should return 400 on error', async () => {
      const errorMessage = 'Erreur de création';
      req.body = { id_banque: 1 };
      StockSang.create.mockRejectedValue(new Error(errorMessage));

      await stockSangController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all stocks de sang and status 200', async () => {
      const stocks = [{ id: 1, groupe_sanguin: 'A+' }, { id: 2, groupe_sanguin: 'B-' }];
      StockSang.findAll.mockResolvedValue(stocks);

      await stockSangController.getAll(req, res);

      expect(StockSang.findAll).toHaveBeenCalledWith({ include: [{ model: BanqueDeSang }] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stocks);
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        StockSang.findAll.mockRejectedValue(new Error(errorMessage));

        await stockSangController.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getById', () => {
    it('should return a stock de sang and status 200 if found', async () => {
        const stock = { id: 1, groupe_sanguin: 'A+' };
        req.params.id = 1;
        StockSang.findByPk.mockResolvedValue(stock);

        await stockSangController.getById(req, res);

        expect(StockSang.findByPk).toHaveBeenCalledWith(1, { include: [{ model: BanqueDeSang }] });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(stock);
    });

    it('should return 404 if stock de sang not found', async () => {
        req.params.id = 99;
        StockSang.findByPk.mockResolvedValue(null);

        await stockSangController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'StockSang not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur serveur';
        req.params.id = 1;
        StockSang.findByPk.mockRejectedValue(new Error(errorMessage));

        await stockSangController.getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('update', () => {
    it('should update a stock de sang and return 200', async () => {
        const updatedData = { quantite: 15 };
        const updatedStock = { id: 1, quantite: 15 };
        req.params.id = 1;
        req.body = updatedData;
        StockSang.update.mockResolvedValue([1]);
        StockSang.findByPk.mockResolvedValue(updatedStock);

        await stockSangController.update(req, res);

        expect(StockSang.update).toHaveBeenCalledWith(updatedData, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedStock);
    });

    it('should return 404 if stock de sang to update is not found', async () => {
        req.params.id = 99;
        req.body = { quantite: 15 };
        StockSang.update.mockResolvedValue([0]);

        await stockSangController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'StockSang not found' });
    });

    it('should return 400 on error', async () => {
        const errorMessage = 'Erreur de mise à jour';
        req.params.id = 1;
        req.body = { quantite: 15 };
        StockSang.update.mockRejectedValue(new Error(errorMessage));

        await stockSangController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('delete', () => {
    it('should delete a stock de sang and return 204', async () => {
        req.params.id = 1;
        StockSang.destroy.mockResolvedValue(1);

        await stockSangController.delete(req, res);

        expect(StockSang.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should return 404 if stock de sang to delete is not found', async () => {
        req.params.id = 99;
        StockSang.destroy.mockResolvedValue(0);

        await stockSangController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'StockSang not found' });
    });

    it('should return 500 on error', async () => {
        const errorMessage = 'Erreur de suppression';
        req.params.id = 1;
        StockSang.destroy.mockRejectedValue(new Error(errorMessage));

        await stockSangController.delete(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
