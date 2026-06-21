const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Status = require('./Status');
const Building = require('./Building');

const Request = sequelize.define('Request', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.ENUM('event', 'repair', 'video'), allowNull: false },
  statusId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Status, key: 'id' }, defaultValue: 1 },
  creatorFio: { type: DataTypes.STRING, allowNull: false },
  creatorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  responsibleId: { type: DataTypes.INTEGER, allowNull: true, references: { model: User, key: 'id' } },
  details: { type: DataTypes.JSONB, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  statusChangedAt: { type: DataTypes.DATE },
  buildingId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Building, key: 'id' } }
});

Request.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Request.belongsTo(User, { foreignKey: 'responsibleId', as: 'responsible' });
Request.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });
Request.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });

module.exports = Request;