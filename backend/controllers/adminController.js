const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Building = require('../models/Building');
const Request = require('../models/Request');

exports.createUser = async (req, res, next) => {
  try {
    const { surname, name, patronymic, phone, password, roleId, vkId, buildingId } = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) return res.status(400).json({ message: 'Роль не найдена' });
    if (role.name === 'employee' && !buildingId) {
      return res.status(400).json({ message: 'Для сотрудника необходимо указать корпус' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      surname, name, patronymic, phone, password: hashedPassword,
      roleId, vkId: vkId || null,
      buildingId: role.name === 'employee' ? buildingId : null
    });
    const fullUser = await User.findByPk(user.id, {
      include: [
        { model: Role, as: 'role', attributes: ['name'] },
        { model: Building, as: 'building', attributes: ['id', 'name'] }
      ]
    });
    res.status(201).json({ message: 'Пользователь создан', user: fullUser });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role' },
        { model: Building, as: 'building', attributes: ['id', 'name'] }
      ]
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = bcrypt.hashSync(updates.password, 10);
    if (updates.roleId) {
      const role = await Role.findByPk(updates.roleId);
      if (role.name === 'employee' && !updates.buildingId) {
        return res.status(400).json({ message: 'Для сотрудника необходим корпус' });
      }
      if (role.name !== 'employee') updates.buildingId = null;
    }
    await User.update(updates, { where: { id: req.params.id } });
    const updated = await User.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'role' },
        { model: Building, as: 'building' }
      ]
    });
    res.json({ message: 'Обновлено', user: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

   
    const requestsAsCreator = await Request.count({ where: { creatorId: userId } });
  
    const requestsAsResponsible = await Request.count({ where: { responsibleId: userId } });

 
    if (requestsAsCreator > 0) {
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        return res.status(500).json({ message: 'Роль администратора не найдена' });
      }
      const admin = await User.findOne({ where: { roleId: adminRole.id } });
      if (!admin) {
        return res.status(500).json({ message: 'Не найден администратор для переназначения заявок' });
      }
      await Request.update(
        { creatorId: admin.id, creatorFio: `${admin.surname} ${admin.name}` },
        { where: { creatorId: userId } }
      );
    }

    if (requestsAsResponsible > 0) {
      await Request.update(
        { responsibleId: null },
        { where: { responsibleId: userId } }
      );
    }

    await User.destroy({ where: { id: userId } });

    res.json({
      message: 'Пользователь удалён. Заявки, где он был создателем, переназначены на администратора. Заявки, где он был ответственным, теперь без ответственного (уведомления будут уходить всем сотрудникам).'
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const employeeRole = await Role.findOne({ where: { name: 'employee' } });
    if (!employeeRole) return res.status(404).json({ message: 'Роль не найдена' });
    const employees = await User.findAll({
      where: { roleId: employeeRole.id },
      attributes: ['id', 'surname', 'name', 'patronymic', 'vkId', 'buildingId'],
      include: [{ model: Building, as: 'building', attributes: ['name'] }]
    });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({ attributes: ['id', 'name'] });
    res.json(roles);
  } catch (error) {
    next(error);
  }
};