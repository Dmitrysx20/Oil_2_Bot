#!/usr/bin/env node

const AdminService = require('../src/services/AdminService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testComprehensiveAdminFunctions() {
  console.log('🔍 Комплексное тестирование админских функций...\n');

  const adminService = new AdminService();
  const adminChatId = 802895688;
  const regularChatId = 123456789;

  // Тест 1: Проверка системы прав доступа
  console.log('📋 Тест 1: Система прав доступа');
  console.log('─'.repeat(50));
  
  const adminAccess = await adminService.checkAdminAccess(adminChatId);
  const userAccess = await adminService.checkAdminAccess(regularChatId);
  
  console.log(`✅ Админ (${adminChatId}):`, {
    isAdmin: adminAccess.isAdmin,
    hasPermission: adminAccess.hasPermission,
    permissions: adminAccess.permissions
  });
  
  console.log(`❌ Пользователь (${regularChatId}):`, {
    isAdmin: userAccess.isAdmin,
    hasPermission: userAccess.hasPermission,
    reason: userAccess.reason
  });

  // Тест 2: Текстовые команды
  console.log('\n📋 Тест 2: Текстовые команды');
  console.log('─'.repeat(50));
  
  const textCommands = [
    { command: '/admin', description: 'Админская панель' },
    { command: '/stats', description: 'Статистика' },
    { command: '/users', description: 'Управление пользователями' },
    { command: '/broadcast', description: 'Рассылки' }
  ];

  for (const { command, description } of textCommands) {
    console.log(`\n🔧 Тестируем: ${description} (${command})`);
    
    const result = await adminService.handleCommand({
      chatId: adminChatId,
      command: command
    });
    
    console.log(`   ✅ Действие: ${result.action}`);
    console.log(`   📝 Сообщение: ${result.message.substring(0, 80)}...`);
    
    if (result.keyboard) {
      console.log(`   ⌨️  Клавиатура: ${result.keyboard.length} рядов`);
    }
  }

  // Тест 3: Callback действия
  console.log('\n📋 Тест 3: Callback действия');
  console.log('─'.repeat(50));
  
  const callbackActions = [
    { action: 'admin_stats', description: 'Детальная статистика' },
    { action: 'admin_users', description: 'Управление пользователями' },
    { action: 'admin_broadcast', description: 'Создание рассылки' },
    { action: 'admin_music', description: 'Статистика музыки' },
    { action: 'admin_export', description: 'Экспорт данных' },
    { action: 'admin_notifications', description: 'Уведомления' },
    { action: 'admin_recommendations', description: 'Рекомендации' },
    { action: 'admin_settings', description: 'Настройки бота' }
  ];

  for (const { action, description } of callbackActions) {
    console.log(`\n🔧 Тестируем: ${description} (${action})`);
    
    const result = await adminService.handleCommand({
      chatId: adminChatId,
      adminAction: action
    });
    
    console.log(`   ✅ Действие: ${result.action}`);
    console.log(`   📝 Сообщение: ${result.message.substring(0, 80)}...`);
    
    if (result.keyboard) {
      console.log(`   ⌨️  Клавиатура: ${result.keyboard.length} рядов`);
    }
  }

  // Тест 4: Проверка безопасности
  console.log('\n📋 Тест 4: Проверка безопасности');
  console.log('─'.repeat(50));
  
  // Попытка доступа обычного пользователя к админским функциям
  console.log('\n🔒 Тест доступа обычного пользователя к админским командам:');
  
  for (const { command, description } of textCommands) {
    const result = await adminService.handleCommand({
      chatId: regularChatId,
      command: command
    });
    
    console.log(`   ${result.action === 'access_denied' ? '✅' : '❌'} ${description}: ${result.action}`);
  }

  // Тест 5: Проверка обработки ошибок
  console.log('\n📋 Тест 5: Обработка ошибок');
  console.log('─'.repeat(50));
  
  // Неизвестная команда
  console.log('\n🔧 Тест неизвестной команды:');
  const unknownResult = await adminService.handleCommand({
    chatId: adminChatId,
    command: '/unknown_command'
  });
  console.log(`   ✅ Результат: ${unknownResult.action}`);
  
  // Неизвестное callback действие
  console.log('\n🔧 Тест неизвестного callback действия:');
  const unknownCallbackResult = await adminService.handleCommand({
    chatId: adminChatId,
    adminAction: 'unknown_action'
  });
  console.log(`   ✅ Результат: ${unknownCallbackResult.action}`);

  // Тест 6: Проверка конфигурации
  console.log('\n📋 Тест 6: Конфигурация');
  console.log('─'.repeat(50));
  
  console.log('🔧 Настройки админов:');
  console.log(`   📋 Админы из конфига: ${config.admin.chatIds.join(', ')}`);
  console.log(`   🔑 Переменная ADMIN_CHAT_IDS: ${process.env.ADMIN_CHAT_IDS || 'не установлена'}`);
  console.log(`   🎯 Текущий админ для тестов: ${adminChatId}`);
  
  // Проверка наличия админа в конфиге
  const isAdminInConfig = config.admin.chatIds.includes(adminChatId);
  console.log(`   ${isAdminInConfig ? '✅' : '❌'} Админ найден в конфигурации: ${isAdminInConfig}`);

  // Тест 7: Проверка структуры ответов
  console.log('\n📋 Тест 7: Структура ответов');
  console.log('─'.repeat(50));
  
  const testResult = await adminService.handleCommand({
    chatId: adminChatId,
    command: '/admin'
  });
  
  console.log('🔍 Структура ответа админской панели:');
  console.log(`   📝 action: ${testResult.action}`);
  console.log(`   💬 message: ${typeof testResult.message} (${testResult.message.length} символов)`);
  console.log(`   ⌨️  keyboard: ${testResult.keyboard ? 'present' : 'absent'}`);
  
  if (testResult.keyboard) {
    console.log(`   📊 keyboard rows: ${testResult.keyboard.length}`);
    testResult.keyboard.forEach((row, index) => {
      console.log(`      Row ${index + 1}: ${row.length} buttons`);
    });
  }

  console.log('\n✅ Комплексное тестирование админских функций завершено!');
  console.log('\n📊 Итоговая статистика:');
  console.log(`   🔧 Протестировано команд: ${textCommands.length}`);
  console.log(`   🔧 Протестировано callback действий: ${callbackActions.length}`);
  console.log(`   🔒 Проверки безопасности: ${textCommands.length}`);
  console.log(`   ⚠️  Тесты обработки ошибок: 2`);
  console.log(`   ⚙️  Проверки конфигурации: 1`);
  console.log(`   🔍 Анализ структуры: 1`);
}

// Запуск теста
testComprehensiveAdminFunctions().catch(error => {
  console.error('❌ Ошибка тестирования:', error);
  process.exit(1);
}); 