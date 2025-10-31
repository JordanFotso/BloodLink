const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donneur = sequelize.define('Donneur', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupe_sanguin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localisation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'donneurs',
    timestamps: false,
  });

  Donneur.associate = (models) => {
    Donneur.hasMany(models.Notification, { foreignKey: 'id_donneur' });
  };

  return Donneur;
};