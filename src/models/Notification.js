const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_donneur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Donneur',
        key: 'id',
      },
    },
    id_demande: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Demande',
        key: 'id',
      },
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
  });

  return Notification;
};