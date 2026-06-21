const Room = require('../models/Room');
const Building = require('../models/Building');

exports.getAll = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({ include: [{ model: Building, as: 'building', attributes: ['name'] }] });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

exports.getByBuilding = async (req, res, next) => {
  try {
    const { buildingId } = req.params;
    const rooms = await Room.findAll({
      where: { buildingId },
      include: [{ model: Building, as: 'building', attributes: ['name'] }]
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { number, hasProjector, buildingId } = req.body;
    if (!number || !number.trim()) return res.status(400).json({ message: 'Номер обязателен' });
    if (!buildingId) return res.status(400).json({ message: 'Выберите корпус' });
    const existing = await Room.findOne({ where: { number: number.trim() } });
    if (existing) return res.status(400).json({ message: 'Аудитория уже существует' });
    const room = await Room.create({ number: number.trim(), hasProjector: hasProjector === true || hasProjector === 'true', buildingId });
    const fullRoom = await Room.findByPk(room.id, { include: [{ model: Building, as: 'building' }] });
    res.status(201).json({ message: 'Создано', room: fullRoom });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Не найдено' });
    const { number, hasProjector, buildingId } = req.body;
    if (number !== undefined && number.trim() !== room.number) {
      const duplicate = await Room.findOne({ where: { number: number.trim() } });
      if (duplicate) return res.status(400).json({ message: 'Номер занят' });
      room.number = number.trim();
    }
    if (hasProjector !== undefined) room.hasProjector = hasProjector === true || hasProjector === 'true';
    if (buildingId !== undefined) room.buildingId = buildingId;
    await room.save();
    const updatedRoom = await Room.findByPk(room.id, { include: [{ model: Building, as: 'building' }] });
    res.json({ message: 'Обновлено', room: updatedRoom });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Не найдено' });
    await room.destroy();
    res.json({ message: 'Удалено' });
  } catch (error) {
    next(error);
  }
};