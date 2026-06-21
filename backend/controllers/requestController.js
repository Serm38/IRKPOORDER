const Request = require('../models/Request');
const User = require('../models/User');
const Status = require('../models/Status');
const Building = require('../models/Building');
const { notifyNewRequest } = require('../utils/vkNotifier');

exports.create = async (req, res, next) => {
  try {
    const { type, details, responsibleId, buildingId } = req.body;
    if ((type === 'event' || type === 'repair') && !buildingId) {
      return res.status(400).json({ message: 'Укажите корпус' });
    }
    if (type === 'video') {
      if (!details.date) return res.status(400).json({ message: 'Укажите дату съёмки' });
      if (!details.location) return res.status(400).json({ message: 'Укажите место съёмки' });
      if (!details.startTime) return res.status(400).json({ message: 'Укажите время начала' });
      if (!details.endTime) return res.status(400).json({ message: 'Укажите время окончания' });
      if (details.startTime >= details.endTime) {
        return res.status(400).json({ message: 'Время окончания должно быть позже начала' });
      }
      const inputDate = new Date(details.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        return res.status(400).json({ message: 'Дата не может быть в прошлом' });
      }
    }
    const pendingStatus = await Status.findOne({ where: { name: 'pending' } });
    if (!pendingStatus) return res.status(500).json({ message: 'Статус не найден' });

    const request = await Request.create({
      type, creatorFio: req.user.fio, creatorId: req.user.id,
      responsibleId: responsibleId || null, details, statusId: pendingStatus.id,
      createdAt: new Date(),
      buildingId: buildingId || null
    });

    let responsibleVkId = null;
    if (responsibleId) {
      const responsibleUser = await User.findByPk(responsibleId);
      responsibleVkId = responsibleUser?.vkId;
    }
    await notifyNewRequest(request, responsibleVkId, buildingId);

    const fullRequest = await Request.findByPk(request.id, {
      include: [
        { model: Status, as: 'status' },
        { model: Building, as: 'building' }
      ]
    });
    res.status(201).json(fullRequest);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const include = [
      { model: Status, as: 'status', attributes: ['name'] },
      { model: Building, as: 'building', attributes: ['id', 'name'] }
    ];
    const where = req.user.role === 'user' ? { creatorId: req.user.id } : {};
    const requests = await Request.findAll({ where, include, order: [['createdAt', 'DESC']] });
    res.json(requests.map(r => ({ ...r.toJSON(), status: r.status?.name, buildingName: r.building?.name })));
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    if (!['employee', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }
    const { status } = req.body;
    const statusObj = await Status.findOne({ where: { name: status } });
    if (!statusObj) return res.status(400).json({ message: 'Неверный статус' });

    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Заявка не найдена' });

    request.statusId = statusObj.id;
    request.statusChangedAt = new Date();
    await request.save();
    res.json({ ...request.toJSON(), status });
  } catch (error) {
    next(error);
  }
};

exports.getByVk = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { vkId: req.params.vkId } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    const requests = await Request.findAll({
      where: { responsibleId: user.id },
      include: [
        { model: Status, as: 'status', attributes: ['name'] },
        { model: Building, as: 'building', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests.map(r => ({
      id: r.id, type: r.type, status: r.status?.name, creatorFio: r.creatorFio,
      details: r.details, buildingName: r.building?.name
    })));
  } catch (error) {
    next(error);
  }
};