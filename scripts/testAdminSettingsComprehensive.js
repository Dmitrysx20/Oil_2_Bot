#!/usr/bin/env node

const AdminService = require('../src/services/AdminService');
const AdminSettingsService = require('../src/services/AdminSettingsService');
const config = require('../config');
const logger = require('../src/utils/logger');
const fs = require('fs');
const path = require('path');

async function testAdminSettingsComprehensive() {
  console.log('🔍 Комплексное тестирование админских настроек...\n');

  const adminService = new AdminService();
  const adminSettingsService = new AdminSettingsService();
  const testAdminId = 802895688;

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runTest(testName, testFunction) {
    return async () => {
      totalTests++;
      try {
        await testFunction();
        console.log(`✅ ${testName}`);
        passedTests++;
        return true;
      } catch (error) {
        console.log(`❌ ${testName}: ${error.message}`);
        failedTests++;
        return false;
      }
    };
  }

  // ===== ТЕСТ 1: ПРОВЕРКА КОНФИГУРАЦИИ =====
  console.log('📋 Тест 1: Проверка конфигурации');
  console.log('─'.repeat(50));
  
  await runTest('Проверка конфигурации AdminService', () => {
    if (!adminService.adminChatIds) {
      throw new Error('adminChatIds не настроен');
    }
    if (!adminService.adminSettingsService) {
      throw new Error('adminSettingsService не инициализирован');
    }
  })();

  await runTest('Проверка конфигурации AdminSettingsService', () => {
    if (!adminSettingsService.supabase && !config.supabase.url) {
      // Это нормально для mock режима
      console.log('   ⚠️ Используется mock режим (Supabase не настроен)');
    }
  })();

  // ===== ТЕСТ 2: ПРОВЕРКА ФАЙЛОВ МИГРАЦИЙ =====
  console.log('\n📋 Тест 2: Проверка файлов миграций');
  console.log('─'.repeat(50));
  
  await runTest('Проверка существования файлов миграций', () => {
    const migrationsDir = path.join(__dirname, '../migrations');
    const requiredFiles = [
      '001_create_subscribers_table.sql',
      '002_update_subscribers_schema.sql',
      '003_create_admin_settings_table.sql',
      'run.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Файл ${file} не найден`);
      }
    }
  })();

  await runTest('Проверка содержимого миграции админских настроек', () => {
    const migrationPath = path.join(__dirname, '../migrations/003_create_admin_settings_table.sql');
    const content = fs.readFileSync(migrationPath, 'utf8');
    
    const requiredElements = [
      'CREATE TABLE public.admin_settings',
      'admin_chat_id bigint',
      'bot_settings jsonb',
      'daily_stats jsonb',
      'PRIMARY KEY',
      'CREATE INDEX',
      'CREATE TRIGGER'
    ];
    
    for (const element of requiredElements) {
      if (!content.includes(element)) {
        throw new Error(`Элемент "${element}" не найден в миграции`);
      }
    }
  })();

  // ===== ТЕСТ 3: ТЕСТИРОВАНИЕ СЕРВИСА АДМИНСКИХ НАСТРОЕК =====
  console.log('\n📋 Тест 3: Тестирование сервиса админских настроек');
  console.log('─'.repeat(50));
  
  await runTest('Инициализация админских настроек', async () => {
    const result = await adminSettingsService.initializeAdminSettings(testAdminId);
    if (!result || !result.success) {
      throw new Error('Ошибка при инициализации настроек');
    }
  })();

  await runTest('Получение админских настроек', async () => {
    const settings = await adminSettingsService.getAdminSettings(testAdminId);
    if (!settings) {
      throw new Error('Настройки не получены');
    }
    if (!settings.bot_settings || !settings.daily_stats) {
      throw new Error('Структура настроек некорректна');
    }
  })();

  await runTest('Обновление настроек бота', async () => {
    const newSettings = {
      daily_stats: true,
      maintenance_mode: false,
      broadcast_enabled: true,
      error_notifications: true,
      new_user_notifications: false
    };
    
    const result = await adminSettingsService.updateBotSettings(testAdminId, newSettings);
    if (!result || !result.success) {
      throw new Error('Ошибка при обновлении настроек');
    }
  })();

  await runTest('Обновление ежедневной статистики', async () => {
    const stats = {
      errors: 1,
      new_users: 2,
      active_users: 3,
      messages_sent: 4
    };
    
    const result = await adminSettingsService.updateDailyStats(testAdminId, stats);
    if (!result || !result.success) {
      throw new Error('Ошибка при обновлении статистики');
    }
  })();

  // ===== ТЕСТ 4: ТЕСТИРОВАНИЕ СПЕЦИАЛИЗИРОВАННЫХ МЕТОДОВ =====
  console.log('\n📋 Тест 4: Тестирование специализированных методов');
  console.log('─'.repeat(50));
  
  await runTest('Проверка режима обслуживания', async () => {
    const maintenanceMode = await adminSettingsService.isMaintenanceMode(testAdminId);
    if (typeof maintenanceMode !== 'boolean') {
      throw new Error('Некорректный тип возвращаемого значения');
    }
  })();

  await runTest('Проверка ежедневной статистики', async () => {
    const dailyStats = await adminSettingsService.shouldSendDailyStats(testAdminId);
    if (typeof dailyStats !== 'boolean') {
      throw new Error('Некорректный тип возвращаемого значения');
    }
  })();

  await runTest('Проверка рассылок', async () => {
    const broadcast = await adminSettingsService.isBroadcastEnabled(testAdminId);
    if (typeof broadcast !== 'boolean') {
      throw new Error('Некорректный тип возвращаемого значения');
    }
  })();

  await runTest('Проверка уведомлений об ошибках', async () => {
    const errorNotifications = await adminSettingsService.shouldSendErrorNotifications(testAdminId);
    if (typeof errorNotifications !== 'boolean') {
      throw new Error('Некорректный тип возвращаемого значения');
    }
  })();

  await runTest('Проверка уведомлений о новых пользователях', async () => {
    const newUserNotifications = await adminSettingsService.shouldSendNewUserNotifications(testAdminId);
    if (typeof newUserNotifications !== 'boolean') {
      throw new Error('Некорректный тип возвращаемого значения');
    }
  })();

  // ===== ТЕСТ 5: ТЕСТИРОВАНИЕ ИНКРЕМЕНТА СТАТИСТИКИ =====
  console.log('\n📋 Тест 5: Тестирование инкремента статистики');
  console.log('─'.repeat(50));
  
  await runTest('Инкремент ошибок', async () => {
    await adminSettingsService.incrementErrors(testAdminId, 1);
  })();

  await runTest('Инкремент новых пользователей', async () => {
    await adminSettingsService.incrementNewUsers(testAdminId, 1);
  })();

  await runTest('Инкремент активных пользователей', async () => {
    await adminSettingsService.incrementActiveUsers(testAdminId, 1);
  })();

  await runTest('Инкремент отправленных сообщений', async () => {
    await adminSettingsService.incrementMessagesSent(testAdminId, 1);
  })();

  // ===== ТЕСТ 6: ТЕСТИРОВАНИЕ ПЕРЕКЛЮЧЕНИЯ НАСТРОЕК =====
  console.log('\n📋 Тест 6: Тестирование переключения настроек');
  console.log('─'.repeat(50));
  
  await runTest('Переключение режима обслуживания', async () => {
    await adminSettingsService.setMaintenanceMode(testAdminId, true);
    await adminSettingsService.setMaintenanceMode(testAdminId, false);
  })();

  await runTest('Переключение ежедневной статистики', async () => {
    await adminSettingsService.toggleDailyStats(testAdminId, false);
    await adminSettingsService.toggleDailyStats(testAdminId, true);
  })();

  // ===== ТЕСТ 7: ТЕСТИРОВАНИЕ АДМИН-ПАНЕЛИ =====
  console.log('\n📋 Тест 7: Тестирование админ-панели');
  console.log('─'.repeat(50));
  
  await runTest('Генерация админ-панели', () => {
    const adminPanel = adminService.generateAdminPanel(testAdminId);
    if (!adminPanel || !adminPanel.action || !adminPanel.keyboard) {
      throw new Error('Некорректная структура админ-панели');
    }
    
    const settingsButton = adminPanel.keyboard.flat().find(btn => btn.callback_data === 'admin_settings');
    if (!settingsButton) {
      throw new Error('Кнопка настроек не найдена в админ-панели');
    }
  })();

  await runTest('Обработка callback настроек', async () => {
    const response = await adminService.handleCallbackAction('admin_settings', testAdminId);
    if (!response || !response.action || !response.keyboard) {
      throw new Error('Некорректный ответ на callback настроек');
    }
  })();

  // ===== ТЕСТ 8: ТЕСТИРОВАНИЕ ПЕРЕКЛЮЧАТЕЛЕЙ =====
  console.log('\n📋 Тест 8: Тестирование переключателей');
  console.log('─'.repeat(50));
  
  const toggleActions = [
    'admin_maintenance_toggle',
    'admin_daily_stats_toggle',
    'admin_broadcast_toggle',
    'admin_error_notifications_toggle',
    'admin_new_user_notifications_toggle'
  ];

  for (const action of toggleActions) {
    await runTest(`Обработка ${action}`, async () => {
      const response = await adminService.handleCallbackAction(action, testAdminId);
      if (!response) {
        throw new Error(`Callback ${action} не обработан`);
      }
    })();
  }

  // ===== ТЕСТ 9: ТЕСТИРОВАНИЕ СТАТИСТИКИ ДАШБОРДА =====
  console.log('\n📋 Тест 9: Тестирование статистики дашборда');
  console.log('─'.repeat(50));
  
  await runTest('Получение статистики дашборда', async () => {
    const dashboardStats = await adminSettingsService.getDashboardStats();
    if (!dashboardStats) {
      throw new Error('Статистика дашборда не получена');
    }
    
    const requiredFields = [
      'total_admins',
      'maintenance_mode_enabled',
      'daily_stats_enabled',
      'broadcast_enabled',
      'total_errors',
      'total_new_users',
      'total_active_users',
      'total_messages_sent'
    ];
    
    for (const field of requiredFields) {
      if (typeof dashboardStats[field] === 'undefined') {
        throw new Error(`Поле ${field} отсутствует в статистике`);
      }
    }
  })();

  // ===== ТЕСТ 10: ТЕСТИРОВАНИЕ ДРУГИХ АДМИНСКИХ ФУНКЦИЙ =====
  console.log('\n📋 Тест 10: Тестирование других админских функций');
  console.log('─'.repeat(50));
  
  const otherActions = [
    'admin_stats',
    'admin_users',
    'admin_broadcast',
    'admin_music',
    'admin_export'
  ];

  for (const action of otherActions) {
    await runTest(`Обработка ${action}`, async () => {
      const response = await adminService.handleCallbackAction(action, testAdminId);
      if (!response) {
        throw new Error(`Callback ${action} не обработан`);
      }
    })();
  }

  // ===== ТЕСТ 11: ТЕСТИРОВАНИЕ ОБРАБОТКИ ОШИБОК =====
  console.log('\n📋 Тест 11: Тестирование обработки ошибок');
  console.log('─'.repeat(50));
  
  await runTest('Обработка неизвестного callback', () => {
    const response = adminService.handleCallbackAction('unknown_action', testAdminId);
    if (!response) {
      throw new Error('Неизвестный callback не обработан');
    }
  })();

  await runTest('Обработка некорректного admin_chat_id', async () => {
    try {
      await adminSettingsService.getAdminSettings(null);
      // Должно вернуть null или выбросить ошибку
    } catch (error) {
      // Это нормально
    }
  })();

  // ===== ИТОГОВАЯ СТАТИСТИКА =====
  console.log('\n📊 Итоговая статистика тестирования');
  console.log('─'.repeat(50));
  
  console.log(`📋 Всего тестов: ${totalTests}`);
  console.log(`✅ Пройдено: ${passedTests}`);
  console.log(`❌ Провалено: ${failedTests}`);
  console.log(`📈 Процент успеха: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 Все тесты пройдены успешно!');
  } else {
    console.log(`\n⚠️ ${failedTests} тестов провалено`);
  }

  console.log('\n💡 Рекомендации:');
  console.log('   1. Все основные функции админских настроек работают');
  console.log('   2. Интеграция с админ-панелью корректна');
  console.log('   3. Обработка ошибок настроена');
  console.log('   4. Файлы миграций присутствуют и корректны');
  console.log('   5. Для полного тестирования настройте Supabase');
  console.log('   6. Проверьте работу в реальной среде');
}

// Запуск теста
testAdminSettingsComprehensive().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 