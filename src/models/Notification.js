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
        model: 'donneurs',
        key: 'id',
      },
    },
    id_demande: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'demandes',
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

  Notification.associate = (models) => {
    Notification.belongsTo(models.Donneur, { foreignKey: 'id_donneur' });
    Notification.belongsTo(models.Demande, { foreignKey: 'id_demande' });
  };

  return Notification;
};