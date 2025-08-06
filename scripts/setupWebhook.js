require('dotenv').config();
const axios = require('axios');

async function setupWebhook() {
  try {
    // Получаем токен из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
      console.log('💡 Добавьте TELEGRAM_BOT_TOKEN в Railway Variables');
      return;
    }
    
    if (!webhookUrl) {
      console.error('❌ WEBHOOK_URL не найден в переменных окружения');
      console.log('💡 Добавьте WEBHOOK_URL в Railway Variables');
      return;
    }

    console.log('🤖 Настройка webhook для Telegram бота...');
    console.log(`📡 Webhook URL: https://${webhookUrl}/webhook/telegram`);
    
    const apiUrl = `https://api.telegram.org/bot${botToken}`;
    
    // Сначала получаем информацию о боте
    console.log('\n📋 Информация о боте:');
    const botInfo = await axios.get(`${apiUrl}/getMe`);
    
    if (botInfo.data.ok) {
      const bot = botInfo.data.result;
      console.log(`✅ Бот найден:`);
      console.log(`   👤 Имя: ${bot.first_name}`);
      console.log(`   📝 Username: @${bot.username}`);
      console.log(`   🆔 ID: ${bot.id}`);
    } else {
      console.error('❌ Ошибка при получении информации о боте:', botInfo.data);
      return;
    }
    
    // Устанавливаем webhook
    console.log('\n🔗 Установка webhook...');
    const webhookResponse = await axios.post(`${apiUrl}/setWebhook`, {
      url: `https://${webhookUrl}/webhook/telegram`,
      allowed_updates: ['message', 'callback_query', 'edited_message'],
      drop_pending_updates: true
    });

    if (webhookResponse.data.ok) {
      console.log('✅ Webhook успешно установлен!');
      console.log(`📊 Статус: ${webhookResponse.data.result ? 'активен' : 'неактивен'}`);
      console.log(`🔗 URL: ${webhookResponse.data.result?.url || 'не указан'}`);
    } else {
      console.error('❌ Ошибка при установке webhook:', webhookResponse.data);
      return;
    }

    // Получаем информацию о webhook
    console.log('\n📋 Информация о webhook:');
    const webhookInfo = await axios.get(`${apiUrl}/getWebhookInfo`);
    
    if (webhookInfo.data.ok) {
      const info = webhookInfo.data.result;
      console.log(`🔗 URL: ${info.url || 'не установлен'}`);
      console.log(`📊 Ожидающих обновлений: ${info.pending_update_count || 0}`);
      console.log(`📅 Последняя ошибка: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'нет'}`);
      console.log(`❌ Последнее сообщение об ошибке: ${info.last_error_message || 'нет'}`);
    }

    console.log('\n🎉 Настройка завершена!');
    console.log('💡 Теперь можете протестировать бота, отправив ему сообщение в Telegram');

  } catch (error) {
    console.error('❌ Ошибка при настройке webhook:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Возможные причины ошибки 401:');
      console.log('   • Неправильный TELEGRAM_BOT_TOKEN');
      console.log('   • Токен недействителен');
      console.log('   • Бот был удален или заблокирован');
    }
  }
}

async function deleteWebhook() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден');
      return;
    }

    console.log('🗑️ Удаление webhook...');
    
    const apiUrl = `https://api.telegram.org/bot${botToken}`;
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
  }
}

async function getWebhookInfo() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN не найден');
      return;
    }

    console.log('📋 Информация о webhook:');
    
    const apiUrl = `https://api.telegram.org/bot${botToken}`;
    const response = await axios.get(`${apiUrl}/getWebhookInfo`);
    
    if (response.data.ok) {
      const info = response.data.result;
      console.log(`🔗 URL: ${info.url || 'не установлен'}`);
      console.log(`📊 Ожидающих обновлений: ${info.pending_update_count || 0}`);
      console.log(`📅 Последняя ошибка: ${info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'нет'}`);
      console.log(`❌ Последнее сообщение об ошибке: ${info.last_error_message || 'нет'}`);
    } else {
      console.error('❌ Ошибка при получении информации о webhook:', response.data);
    }

  } catch (error) {
    console.error('❌ Ошибка при получении информации о webhook:', error.response?.data || error.message);
  }
}

// Обработка аргументов командной строки
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupWebhook();
    break;
  case 'delete':
    deleteWebhook();
    break;
  case 'info':
    getWebhookInfo();
    break;
  default:
    console.log('📚 Использование:');
    console.log('  node scripts/setupWebhook.js setup  - настроить webhook');
    console.log('  node scripts/setupWebhook.js delete - удалить webhook');
    console.log('  node scripts/setupWebhook.js info   - информация о webhook');
    console.log('\n💡 Пример:');
    console.log('  node scripts/setupWebhook.js setup');
    break;
} 