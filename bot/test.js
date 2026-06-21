require('dotenv').config({ path: './.env' }); // или укажите путь к вашему .env
const axios = require('axios');

const token = process.env.VK_TOKEN;
console.log('Токен:', token ? token.substring(0,10)+'...' : 'не найден');

axios.post('https://api.vk.com/method/messages.send', {
    user_id: 737288672,   // ваш ID
    message: 'Тест',
    random_id: 0,
    access_token: token,
    v: '5.199'
}).then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err));