const Building = require('../models/Building');

exports.getAll = async (req, res, next) => {
  try {
    const buildings = await Building.findAll({ order: [['name', 'ASC']] });
    res.json(buildings);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Название корпуса обязательно' });
    const existing = await Building.findOne({ where: { name: name.trim() } });
    if (existing) return res.status(400).json({ message: 'Такой корпус уже существует' });
    const building = await Building.create({ name: name.trim() });
    res.status(201).json(building);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) return res.status(404).json({ message: 'Корпус не найден' });
    const { name } = req.body;
    if (name && name.trim() !== building.name) {
      const duplicate = await Building.findOne({ where: { name: name.trim() } });
      if (duplicate) return res.status(400).json({ message: 'Название уже занято' });
      building.name = name.trim();
    }
    await building.save();
    res.json(building);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) return res.status(404).json({ message: 'Корпус не найден' });
    const { User, Room, Request } = require('../models');
    const usersCount = await User.count({ where: { buildingId: building.id } });
    const roomsCount = await Room.count({ where: { buildingId: building.id } });
    const requestsCount = await Request.count({ where: { buildingId: building.id } });
    if (usersCount + roomsCount + requestsCount > 0) {
      return res.status(400).json({ message: 'Нельзя удалить корпус, так как он используется' });
    }
    await building.destroy();
    res.json({ message: 'Корпус удалён' });
  } catch (error) {
    next(error);
  }
};