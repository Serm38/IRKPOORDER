const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Building = require('./Building');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  hasProjector: { type: DataTypes.BOOLEAN, defaultValue: false },
  buildingId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Building, key: 'id' } }
});

Room.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });

module.exports = Room;