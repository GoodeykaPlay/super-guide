#!/usr/bin/env node
/**
 * Простой бот для отправки уведомлений об обновлениях игры.
 * Использование: node bot_notifier.js "Сообщение об обновлении"
 */

const https = require('https');

// Получи токен от @BotFather
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'твой-токен-бота';

// Список ID чатов/пользователей для уведомлений
// Чтобы узнать свой ID, напиши боту @userinfobot
const CHAT_IDS = [];

function sendUpdate(message, chatIds = CHAT_IDS) {
  if (!chatIds || chatIds.length === 0) {
    console.log('⚠️  Список CHAT_IDS пуст! Добавь ID пользователей/чатов.');
    return;
  }

  const url = `/bot${BOT_TOKEN}/sendMessage`;
  
  chatIds.forEach(chatId => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });
    
    const options = {
      hostname: 'api.telegram.org',
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Сообщение отправлено в чат ${chatId}`);
      } else {
        console.log(`❌ Ошибка отправки в чат ${chatId}: ${res.statusCode}`);
      }
    });
    
    req.on('error', (e) => {
      console.error(`❌ Ошибка: ${e.message}`);
    });
    
    req.write(data);
    req.end();
  });
}

// Запуск
const message = process.argv[2];

if (!message) {
  const exampleMessage = `🎮 <b>Обновление игры Bolt Catcher!</b>

✨ Новые функции:
• Бомбы теперь вращаются и меняют направление
• Увеличен шанс появления бомб
• Улучшен дизайн в стиле 90-х

Играй прямо в Telegram! 🚀`;
  
  console.log('Использование: node bot_notifier.js "Твое сообщение"');
  console.log('\nПример сообщения:');
  console.log(exampleMessage);
  process.exit(1);
}

sendUpdate(message);



