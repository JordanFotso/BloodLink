const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Medecin = sequelize.define('Medecin', {
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
  }, {
    tableName: 'medecins',
    timestamps: false,
  });

  Medecin.associate = (models) => {
    Medecin.hasMany(models.Demande, { foreignKey: 'id_medecin' });
  };

  return Medecin;
};