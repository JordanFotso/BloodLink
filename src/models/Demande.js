const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Demande = sequelize.define('Demande', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_medecin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medecins',
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
    urgence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'demandes',
    timestamps: false,
  });

  Demande.associate = (models) => {
    Demande.belongsTo(models.Medecin, { foreignKey: 'id_medecin' });
    Demande.hasMany(models.Notification, { foreignKey: 'id_demande' });
  };

  return Demande;
};