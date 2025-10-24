const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockSang = sequelize.define('StockSang', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_banque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banques_de_sang',
        key: 'id',
      },
    },
    groupe_sanguin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'stock_sang',
    timestamps: false,
  });

  StockSang.associate = (models) => {
    StockSang.belongsTo(models.BanqueDeSang, { foreignKey: 'id_banque' });
  };

  return StockSang;
};