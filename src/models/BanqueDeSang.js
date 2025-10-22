const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BanqueDeSang = sequelize.define('BanqueDeSang', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localisation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'banques_de_sang',
    timestamps: false,
  });

  return BanqueDeSang;
};