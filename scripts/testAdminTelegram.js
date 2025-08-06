#!/usr/bin/env node

const TelegramService = require('../src/services/TelegramService');
const AdminService = require('../src/services/AdminService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testAdminTelegramIntegration() {
  console.log('🤖 Тестирование интеграции админских функций с Telegram...\n');

  // Проверяем наличие токена
  if (!config.telegram.botToken || config.telegram.botToken === 'your_telegram_bot_token_here') {
    console.log('❌ TELEGRAM_BOT_TOKEN не настроен. Пропускаем тест отправки сообщений.');
    console.log('💡 Для полного тестирования установите TELEGRAM_BOT_TOKEN в переменных окружения.');
    return;
  }

  const telegramService = new TelegramService();
  const adminService = new AdminService();
  const adminChatId = 802895688;

  try {
    // Тест 1: Проверка подключения к Telegram API
    console.log('📋 Тест 1: Проверка подключения к Telegram API');
    
    const botInfo = await telegramService.getBotInfo();
    console.log('✅ Подключение к Telegram API успешно');
    console.log('🤖 Информация о боте:', {
      id: botInfo.id,
      name: botInfo.first_name,
      username: botInfo.username
    });

    console.log('\n' + '─'.repeat(50));

    // Тест 2: Отправка админской панели
    console.log('\n📋 Тест 2: Отправка админской панели');
    
    const adminPanel = await adminService.handleCommand({
      chatId: adminChatId,
      command: '/admin'
    });

    if (adminPanel.action === 'admin_panel') {
      const result = await telegramService.sendMessage({
        chatId: adminChatId,
        message: adminPanel.message,
        keyboard: adminPanel.keyboard
      });

      if (result.ok) {
        console.log('✅ Админская панель отправлена успешно');
        console.log('📱 Message ID:', result.result.message_id);
      } else {
        console.log('❌ Ошибка отправки админской панели:', result.description);
      }
    }

    console.log('\n' + '─'.repeat(50));

    // Тест 3: Отправка статистики
    console.log('\n📋 Тест 3: Отправка статистики');
    
    const stats = await adminService.handleCommand({
      chatId: adminChatId,
      command: '/stats'
    });

    if (stats.action === 'admin_detailed_stats') {
      const result = await telegramService.sendMessage({
        chatId: adminChatId,
        message: stats.message,
        keyboard: stats.keyboard
      });

      if (result.ok) {
        console.log('✅ Статистика отправлена успешно');
        console.log('📱 Message ID:', result.result.message_id);
      } else {
        console.log('❌ Ошибка отправки статистики:', result.description);
      }
    }

    console.log('\n' + '─'.repeat(50));

    // Тест 4: Отправка меню управления пользователями
    console.log('\n📋 Тест 4: Отправка меню управления пользователями');
    
    const users = await adminService.handleCommand({
      chatId: adminChatId,
      adminAction: 'admin_users'
    });

    if (users.action === 'users_management') {
      const result = await telegramService.sendMessage({
        chatId: adminChatId,
        message: users.message,
        keyboard: users.keyboard
      });

      if (result.ok) {
        console.log('✅ Меню управления пользователями отправлено успешно');
        console.log('📱 Message ID:', result.result.message_id);
      } else {
        console.log('❌ Ошибка отправки меню пользователей:', result.description);
      }
    }

    console.log('\n' + '─'.repeat(50));

    // Тест 5: Отправка меню рассылок
    console.log('\n📋 Тест 5: Отправка меню рассылок');
    
    const broadcast = await adminService.handleCommand({
      chatId: adminChatId,
      adminAction: 'admin_broadcast'
    });

    if (broadcast.action === 'broadcast_creator') {
      const result = await telegramService.sendMessage({
        chatId: adminChatId,
        message: broadcast.message,
        keyboard: broadcast.keyboard
      });

      if (result.ok) {
        console.log('✅ Меню рассылок отправлено успешно');
        console.log('📱 Message ID:', result.result.message_id);
      } else {
        console.log('❌ Ошибка отправки меню рассылок:', result.description);
      }
    }

    console.log('\n✅ Тестирование интеграции с Telegram завершено успешно!');
    console.log('💡 Проверьте ваш Telegram для получения админских сообщений.');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Проверьте подключение к интернету');
    } else if (error.code === 'UNAUTHORIZED') {
      console.log('💡 Проверьте правильность TELEGRAM_BOT_TOKEN');
    }
  }
}

// Запуск теста
testAdminTelegramIntegration().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 