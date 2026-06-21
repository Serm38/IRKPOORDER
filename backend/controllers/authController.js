const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({
      where: { phone },
      include: [{ model: Role, as: 'role' }],
    });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Неверные данные' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role.name, fio: `${user.surname} ${user.name}` },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, role: user.role.name, fio: `${user.surname} ${user.name}` } });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};