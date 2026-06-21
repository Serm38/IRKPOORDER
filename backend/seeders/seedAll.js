require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const Role = require('./models/Role');
const Status = require('./models/Status');
const Building = require('./models/Building');
const User = require('./models/User');

(async () => {
  try {
    await sequelize.sync({ force: true });
    await Role.bulkCreate([
      { id: 1, name: 'admin' },
      { id: 2, name: 'employee' },
      { id: 3, name: 'user' }
    ]);
    await Status.bulkCreate([
      { id: 1, name: 'pending' },
      { id: 2, name: 'in_progress' },
      { id: 3, name: 'completed' },
      { id: 4, name: 'rejected' }
    ]);
    await Building.bulkCreate([
      { name: '5-я железнодорожная' },
      { name: 'Булавина' },
      { name: 'Гоголя' }
    ]);
    await User.create({
      surname: 'Somov', name: 'Sergey', patronymic: 'Vadimovich',
      phone: '+79500634477', password: bcrypt.hashSync('root', 10), roleId: 1
    });
    console.log('✅ База данных инициализирована');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  }
})();