const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found');
  process.exit(1);
}
dotenv.config({ path: envPath });

const VK_TOKEN = process.env.VK_TOKEN;
if (!VK_TOKEN) {
  console.error('VK_TOKEN missing');
  process.exit(1);
}
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const sendVkMessage = async (userId, text) => {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      message: text,
      random_id: Math.floor(Math.random() * 1e9),
      access_token: VK_TOKEN,
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

const getRequestsByVk = async (vkId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/requests/by-vk/${vkId}`);
    return data;
  } catch (err) {
    console.error('[BOT]', err.response?.data?.message || err.message);
    return null;
  }
};

const formatRequests = (requests) => {
  if (!requests || requests.length === 0) return '📭 У вас нет активных заявок.';
  let msg = '📋 Ваши заявки:\n\n';
  const typeMap = { event: 'Мероприятие', repair: 'Ремонт', video: 'Видеосъёмка' };
  requests.forEach((req, i) => {
    msg += `${i+1}. Заявка #${req.id} (${typeMap[req.type] || req.type})\n`;
    msg += `   Статус: ${req.status}\n`;
    msg += `   Создатель: ${req.creatorFio}\n`;
    if (req.buildingName) msg += `   Корпус: ${req.buildingName}\n`;
    const d = req.details;
    if (d) {
      if (req.type === 'event')
        msg += `   📅 ${d.date} ${d.startTime}-${d.endTime}, ауд. ${d.room}\n`;
      else if (req.type === 'repair')
        msg += `   🔧 Ауд. ${d.room}: ${(d.description || '').substring(0,100)}\n`;
      else if (req.type === 'video')
        msg += `   🎥 ${d.date} ${d.startTime}-${d.endTime}, ${d.location}\n`;
    }
    msg += '\n';
  });
  return msg;
};

const startLongPoll = async () => {
  try {
    const { data: serverData } = await axios.get('https://api.vk.com/method/messages.getLongPollServer', {
      params: { access_token: VK_TOKEN, v: '5.199' }
    });
    if (serverData.error) {
      console.error('[BOT]', serverData.error.error_msg);
      setTimeout(startLongPoll, 5000);
      return;
    }
    const { server, key, ts } = serverData.response;
    let currentTs = ts;
    console.log('✅ Long Poll started');

    while (true) {
      try {
        const { data: pollData } = await axios.get(`https://${server}`, {
          params: { act: 'a_check', key, ts: currentTs, wait: 25, mode: 2, version: 3 },
          timeout: 30000
        });
        if (pollData.failed) {
          if (pollData.failed === 1) currentTs = pollData.ts;
          else throw new Error(`Long Poll failed: ${pollData.failed}`);
          continue;
        }
        currentTs = pollData.ts;
        const updates = pollData.updates || [];
        for (const upd of updates) {
          if (upd[0] === 4) {
            const userId = upd[3];
            const text = (upd[5] || '').toLowerCase().trim();
            if (text === 'заявки' || text === 'мои заявки') {
              const requests = await getRequestsByVk(userId);
              const reply = formatRequests(requests);
              await sendVkMessage(userId, reply);
            }
          }
        }
      } catch (err) {
        console.error('[BOT]', err.message);
        await new Promise(r => setTimeout(r, 3000));
        break;
      }
    }
  } catch (err) {
    console.error('[BOT]', err.message);
  }
  setTimeout(startLongPoll, 5000);
};

console.log('✅ Bot started');
startLongPoll();