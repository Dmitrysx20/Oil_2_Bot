#!/usr/bin/env node

const AdminService = require('../src/services/AdminService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testAdminFunctions() {
  console.log('👨‍💼 Тестирование админских функций...\n');

  const adminService = new AdminService();

  // Тест 1: Проверка доступа админа
  console.log('📋 Тест 1: Проверка доступа админа');
  
  const adminChatId = 802895688; // Ваш ID
  const regularChatId = 123456789; // Обычный пользователь
  
  console.log(`\nПроверка админа (ID: ${adminChatId}):`);
  const adminAccess = await adminService.checkAdminAccess(adminChatId);
  console.log('Результат:', adminAccess);
  
  console.log(`\nПроверка обычного пользователя (ID: ${regularChatId}):`);
  const userAccess = await adminService.checkAdminAccess(regularChatId);
  console.log('Результат:', userAccess);
  
  console.log('\n' + '─'.repeat(50));

  // Тест 2: Админские команды
  console.log('\n📋 Тест 2: Админские команды');
  
  const adminCommands = [
    '/admin',
    '/stats', 
    '/users',
    '/broadcast'
  ];

  for (const command of adminCommands) {
    console.log(`\nКоманда: ${command}`);
    const result = await adminService.handleCommand({
      chatId: adminChatId,
      command: command
    });
    
    console.log('Действие:', result.action);
    console.log('Сообщение (первые 100 символов):', result.message.substring(0, 100) + '...');
  }
  
  console.log('\n' + '─'.repeat(50));

  // Тест 3: Админские действия через callback
  console.log('\n📋 Тест 3: Админские действия через callback');
  
  const adminActions = [
    'admin_stats',
    'admin_users', 
    'admin_broadcast',
    'admin_music',
    'admin_export'
  ];

  for (const action of adminActions) {
    console.log(`\nДействие: ${action}`);
    const result = await adminService.handleCommand({
      chatId: adminChatId,
      adminAction: action
    });
    
    console.log('Действие:', result.action);
    console.log('Сообщение (первые 100 символов):', result.message.substring(0, 100) + '...');
  }

  // Тест 4: Проверка конфигурации
  console.log('\n📋 Тест 4: Конфигурация админов');
  console.log('Админы из конфига:', config.admin.chatIds);
  console.log('Переменная ADMIN_CHAT_IDS:', process.env.ADMIN_CHAT_IDS);

  console.log('\n✅ Тестирование админских функций завершено!');
}

// Запуск теста
testAdminFunctions().catch(error => {
  console.error('❌ Ошибка тестирования:', error);
  process.exit(1);
}); 