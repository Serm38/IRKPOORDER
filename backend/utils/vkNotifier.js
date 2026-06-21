const axios = require('axios');

const sendVkMessage = async (userId, message) => {
  const token = process.env.VK_TOKEN;
  if (!token) return false;
  try {
    const params = new URLSearchParams({
      user_id: userId,
      message,
      random_id: Math.floor(Math.random() * 1e9),
      access_token: token,
      v: '5.199'
    });
    const { data } = await axios.get(`https://api.vk.com/method/messages.send?${params}`);
    if (data.error) {
      console.error('[VK]', data.error.error_msg);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[VK]', err.message);
    return false;
  }
};

const notifyNewRequest = async (request, responsibleVkId, buildingId) => {
  try {
    let buildingName = '';
    if (buildingId) {
      const { Building } = require('../models');
      const building = await Building.findByPk(buildingId);
      if (building) buildingName = building.name;
    }

    const typeMap = { event: 'Мероприятие', repair: 'Ремонт', video: 'Видеосъёмка' };
    let details = '';
    const d = request.details;
    if (request.type === 'event') {
      details = `${d.date} ${d.startTime}-${d.endTime}, ауд. ${d.room}`;
    } else if (request.type === 'repair') {
      details = `ауд. ${d.room}: ${d.description.substring(0, 80)}`;
    } else {
      details = `${d.date} ${d.startTime}-${d.endTime}, ${d.location}`;
    }
    const buildingLine = buildingName ? `\nКорпус: ${buildingName}` : '';
    const message = `🆕 Новая заявка #${request.id}\nТип: ${typeMap[request.type]}\nОт: ${request.creatorFio}\nДетали: ${details}${buildingLine}`;

    if (responsibleVkId) {
      await sendVkMessage(responsibleVkId, message);
    } else {
      const { User } = require('../models');
      const employees = await User.findAll({ where: { roleId: 2 }, attributes: ['vkId'] });
      for (const emp of employees) {
        if (emp.vkId) {
          await sendVkMessage(emp.vkId, message);
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }
  } catch (err) {
    console.error('[VK]', err.message);
  }
};

module.exports = { notifyNewRequest };