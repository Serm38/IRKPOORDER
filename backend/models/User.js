const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');
const Building = require('./Building');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  surname: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  patronymic: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Role, key: 'id' } },
  vkId: { type: DataTypes.INTEGER, allowNull: true },
  buildingId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Building, key: 'id' } }
});

User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
User.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });

module.exports = User;