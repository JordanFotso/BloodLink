const { StockSang, BanqueDeSang } = require('../models');

const stockSangController = {
  // Create a new StockSang
  async create(req, res) {
    try {
      const stockSang = await StockSang.create(req.body);
      return res.status(201).json(stockSang);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get all StockSang entries, optionally with associated BanqueDeSang
  async getAll(req, res) {
    try {
      const stockSangs = await StockSang.findAll({
        include: [{ model: BanqueDeSang }],
      });
      return res.status(200).json(stockSangs);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get a single StockSang by ID, optionally with associated BanqueDeSang
  async getById(req, res) {
    try {
      const stockSang = await StockSang.findByPk(req.params.id, {
        include: [{ model: BanqueDeSang }],
      });
      if (stockSang) {
        return res.status(200).json(stockSang);
      } else {
        return res.status(404).json({ error: 'StockSang not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update a StockSang by ID
  async update(req, res) {
    try {
      const [updated] = await StockSang.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedStockSang = await StockSang.findByPk(req.params.id);
        return res.status(200).json(updatedStockSang);
      } else {
        return res.status(404).json({ error: 'StockSang not found' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete a StockSang by ID
  async delete(req, res) {
    try {
      const deleted = await StockSang.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: 'StockSang not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = stockSangController;
