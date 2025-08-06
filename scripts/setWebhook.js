require('dotenv').config();
const axios = require('axios');
const config = require('../config');

async function setWebhook() {
  try {
    const botToken = config.telegram.botToken;
    const webhookUrl = config.telegram.webhookUrl;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
      process.exit(1);
    }
    
    if (!webhookUrl) {
      console.error('❌ WEBHOOK_URL не найден в переменных окружения');
      process.exit(1);
    }

    console.log('🤖 Настройка webhook для Telegram бота...');
    console.log(`📡 Webhook URL: ${webhookUrl}`);
    
    const apiUrl = `${config.telegram.apiUrl}${botToken}`;
    
    // Устанавливаем webhook
    const response = await axios.post(`${apiUrl}/setWebhook`, {
      url: `${webhookUrl}/webhook/telegram`,
      allowed_updates: ['message', 'callback_query', 'edited_message'],
      drop_pending_updates: true
    });

    if (response.data.ok) {
      console.log('✅ Webhook успешно установлен!');
      console.log(`📊 Статус: ${response.data.result ? 'активен' : 'неактивен'}`);
      console.log(`🔗 URL: ${response.data.result?.url || 'не указан'}`);
      console.log(`📝 Ожидаемые обновления: ${response.data.result?.allowed_updates?.join(', ') || 'все'}`);
    } else {
      console.error('❌ Ошибка при установке webhook:', response.data);
    }

    // Получаем информацию о webhook
    console.log('\n📋 Информация о текущем webhook:');
    const webhookInfo = await axios.get(`${apiUrl}/getWebhookInfo`);
    
    if (webhookInfo.data.ok) {
      const info = webhookInfo.data.result;
      console.log(`🔗 URL: ${info.url || 'не установлен'}`);
      console.log(`📊 Статус: ${info.pending_update_count || 0} ожидающих обновлений`);
      console.log(`📅 Последняя ошибка: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'нет'}`);
      console.log(`❌ Последнее сообщение об ошибке: ${info.last_error_message || 'нет'}`);
    }

  } catch (error) {
    console.error('❌ Ошибка при настройке webhook:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function deleteWebhook() {
  try {
    const botToken = config.telegram.botToken;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
      process.exit(1);
    }

    console.log('🗑️ Удаление webhook...');
    
    const apiUrl = `${config.telegram.apiUrl}${botToken}`;
    const response = await axios.post(`${apiUrl}/deleteWebhook`, {
      drop_pending_updates: true
    });

    if (response.data.ok) {
      console.log('✅ Webhook успешно удален!');
    } else {
      console.error('❌ Ошибка при удалении webhook:', response.data);
    }

  } catch (error) {
    console.error('❌ Ошибка при удалении webhook:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function getWebhookInfo() {
  try {
    const botToken = config.telegram.botToken;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
      process.exit(1);
    }

    console.log('📋 Информация о webhook:');
    
    const apiUrl = `${config.telegram.apiUrl}${botToken}`;
    const response = await axios.get(`${apiUrl}/getWebhookInfo`);
    
    if (response.data.ok) {
      const info = response.data.result;
      console.log(`🔗 URL: ${info.url || 'не установлен'}`);
      console.log(`📊 Ожидающих обновлений: ${info.pending_update_count || 0}`);
      console.log(`📅 Последняя ошибка: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'нет'}`);
      console.log(`❌ Последнее сообщение об ошибке: ${info.last_error_message || 'нет'}`);
      console.log(`📝 Размер секретного токена: ${info.secret_token ? info.secret_token.length : 0} символов`);
    } else {
      console.error('❌ Ошибка при получении информации о webhook:', response.data);
    }

  } catch (error) {
    console.error('❌ Ошибка при получении информации о webhook:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function getBotInfo() {
  try {
    const botToken = config.telegram.botToken;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
      process.exit(1);
    }

    console.log('🤖 Информация о боте:');
    
    const apiUrl = `${config.telegram.apiUrl}${botToken}`;
    const response = await axios.get(`${apiUrl}/getMe`);
    
    if (response.data.ok) {
      const bot = response.data.result;
      console.log(`👤 Имя: ${bot.first_name}`);
      console.log(`📝 Username: @${bot.username}`);
      console.log(`🆔 ID: ${bot.id}`);
      console.log(`🔗 Поддерживает inline режим: ${bot.supports_inline_queries ? 'да' : 'нет'}`);
      console.log(`📱 Поддерживает платежи: ${bot.can_join_groups ? 'да' : 'нет'}`);
    } else {
      console.error('❌ Ошибка при получении информации о боте:', response.data);
    }

  } catch (error) {
    console.error('❌ Ошибка при получении информации о боте:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Обработка аргументов командной строки
const command = process.argv[2];

switch (command) {
  case 'set':
    setWebhook();
    break;
  case 'delete':
    deleteWebhook();
    break;
  case 'info':
    getWebhookInfo();
    break;
  case 'bot':
    getBotInfo();
    break;
  default:
    console.log('📚 Использование:');
    console.log('  node scripts/setWebhook.js set     - установить webhook');
    console.log('  node scripts/setWebhook.js delete  - удалить webhook');
    console.log('  node scripts/setWebhook.js info    - информация о webhook');
    console.log('  node scripts/setWebhook.js bot     - информация о боте');
    console.log('\n💡 Пример:');
    console.log('  node scripts/setWebhook.js set');
    break;
} 