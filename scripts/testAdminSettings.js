#!/usr/bin/env node

const AdminSettingsService = require('../src/services/AdminSettingsService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testAdminSettings() {
  console.log('⚙️ Тестирование админских настроек...\n');

  const adminSettingsService = new AdminSettingsService();
  const testAdminId = 802895688;

  // Тест 1: Проверка подключения к базе данных
  console.log('📋 Тест 1: Проверка подключения к базе данных');
  console.log('─'.repeat(50));
  
  if (!config.supabase.url || !config.supabase.key) {
    console.log('⚠️ Supabase credentials not configured - будет использоваться mock режим');
    console.log('💡 Для полного тестирования установите SUPABASE_URL и SUPABASE_ANON_KEY');
  } else {
    console.log('✅ Supabase credentials found - будет использоваться реальная база данных');
  }

  // Тест 2: Инициализация админских настроек
  console.log('\n📋 Тест 2: Инициализация админских настроек');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Инициализируем настройки для админа ${testAdminId}`);
    
    const initResult = await adminSettingsService.initializeAdminSettings(testAdminId);
    
    if (initResult.success) {
      console.log('✅ Админские настройки инициализированы');
      if (initResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при инициализации настроек');
    }
  } catch (error) {
    console.log('❌ Ошибка при инициализации:', error.message);
  }

  // Тест 3: Получение админских настроек
  console.log('\n📋 Тест 3: Получение админских настроек');
  console.log('─'.repeat(50));
  
  try {
    const settings = await adminSettingsService.getAdminSettings(testAdminId);
    
    if (settings) {
      console.log('✅ Настройки получены успешно');
      console.log('🔧 Настройки бота:');
      console.log(`   Режим обслуживания: ${settings.bot_settings?.maintenance_mode ? '🔴 ВКЛ' : '🟢 ВЫКЛ'}`);
      console.log(`   Ежедневная статистика: ${settings.bot_settings?.daily_stats ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Рассылки: ${settings.bot_settings?.broadcast_enabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Уведомления об ошибках: ${settings.bot_settings?.error_notifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Уведомления о новых пользователях: ${settings.bot_settings?.new_user_notifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      
      console.log('\n📊 Ежедневная статистика:');
      console.log(`   ❌ Ошибки: ${settings.daily_stats?.errors || 0}`);
      console.log(`   👥 Новые пользователи: ${settings.daily_stats?.new_users || 0}`);
      console.log(`   ✅ Активные пользователи: ${settings.daily_stats?.active_users || 0}`);
      console.log(`   📨 Отправлено сообщений: ${settings.daily_stats?.messages_sent || 0}`);
      console.log(`   🕐 Последнее обновление: ${settings.daily_stats?.last_updated ? new Date(settings.daily_stats.last_updated).toLocaleString('ru-RU') : 'Не обновлялось'}`);
    } else {
      console.log('❌ Настройки не найдены');
    }
  } catch (error) {
    console.log('❌ Ошибка при получении настроек:', error.message);
  }

  // Тест 4: Обновление настроек бота
  console.log('\n📋 Тест 4: Обновление настроек бота');
  console.log('─'.repeat(50));
  
  try {
    const newBotSettings = {
      daily_stats: true,
      maintenance_mode: false,
      broadcast_enabled: true,
      error_notifications: true,
      new_user_notifications: false
    };
    
    console.log('🔧 Обновляем настройки бота...');
    console.log('   Новые настройки:', JSON.stringify(newBotSettings, null, 2));
    
    const updateResult = await adminSettingsService.updateBotSettings(testAdminId, newBotSettings);
    
    if (updateResult.success) {
      console.log('✅ Настройки бота обновлены');
      if (updateResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при обновлении настроек');
    }
  } catch (error) {
    console.log('❌ Ошибка при обновлении настроек:', error.message);
  }

  // Тест 5: Обновление ежедневной статистики
  console.log('\n📋 Тест 5: Обновление ежедневной статистики');
  console.log('─'.repeat(50));
  
  try {
    const statsUpdate = {
      errors: 2,
      new_users: 5,
      active_users: 15,
      messages_sent: 50
    };
    
    console.log('🔧 Обновляем ежедневную статистику...');
    console.log('   Новая статистика:', JSON.stringify(statsUpdate, null, 2));
    
    const statsResult = await adminSettingsService.updateDailyStats(testAdminId, statsUpdate);
    
    if (statsResult.success) {
      console.log('✅ Ежедневная статистика обновлена');
      if (statsResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при обновлении статистики');
    }
  } catch (error) {
    console.log('❌ Ошибка при обновлении статистики:', error.message);
  }

  // Тест 6: Получение статистики дашборда
  console.log('\n📋 Тест 6: Статистика дашборда');
  console.log('─'.repeat(50));
  
  try {
    const dashboardStats = await adminSettingsService.getDashboardStats();
    
    console.log('📊 Статистика дашборда:');
    console.log(`   👥 Всего админов: ${dashboardStats.total_admins}`);
    console.log(`   🔴 Режим обслуживания включен: ${dashboardStats.maintenance_mode_enabled}`);
    console.log(`   📊 Ежедневная статистика включена: ${dashboardStats.daily_stats_enabled}`);
    console.log(`   📢 Рассылки включены: ${dashboardStats.broadcast_enabled}`);
    console.log(`   ❌ Всего ошибок: ${dashboardStats.total_errors}`);
    console.log(`   👥 Всего новых пользователей: ${dashboardStats.total_new_users}`);
    console.log(`   ✅ Всего активных пользователей: ${dashboardStats.total_active_users}`);
    console.log(`   📨 Всего отправлено сообщений: ${dashboardStats.total_messages_sent}`);
  } catch (error) {
    console.log('❌ Ошибка при получении статистики дашборда:', error.message);
  }

  // Тест 7: Специализированные методы
  console.log('\n📋 Тест 7: Специализированные методы');
  console.log('─'.repeat(50));
  
  try {
    // Проверка режима обслуживания
    const maintenanceMode = await adminSettingsService.isMaintenanceMode(testAdminId);
    console.log(`🔧 Режим обслуживания: ${maintenanceMode ? '🔴 ВКЛ' : '🟢 ВЫКЛ'}`);
    
    // Проверка ежедневной статистики
    const dailyStatsEnabled = await adminSettingsService.shouldSendDailyStats(testAdminId);
    console.log(`📊 Ежедневная статистика: ${dailyStatsEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
    
    // Проверка рассылок
    const broadcastEnabled = await adminSettingsService.isBroadcastEnabled(testAdminId);
    console.log(`📢 Рассылки: ${broadcastEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
    
    // Проверка уведомлений об ошибках
    const errorNotifications = await adminSettingsService.shouldSendErrorNotifications(testAdminId);
    console.log(`⚠️ Уведомления об ошибках: ${errorNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
    
    // Проверка уведомлений о новых пользователях
    const newUserNotifications = await adminSettingsService.shouldSendNewUserNotifications(testAdminId);
    console.log(`👥 Уведомления о новых пользователях: ${newUserNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
  } catch (error) {
    console.log('❌ Ошибка при проверке специализированных методов:', error.message);
  }

  // Тест 8: Инкремент статистики
  console.log('\n📋 Тест 8: Инкремент статистики');
  console.log('─'.repeat(50));
  
  try {
    console.log('🔧 Инкрементируем различные метрики...');
    
    await adminSettingsService.incrementErrors(testAdminId, 1);
    console.log('✅ Ошибки инкрементированы (+1)');
    
    await adminSettingsService.incrementNewUsers(testAdminId, 2);
    console.log('✅ Новые пользователи инкрементированы (+2)');
    
    await adminSettingsService.incrementActiveUsers(testAdminId, 3);
    console.log('✅ Активные пользователи инкрементированы (+3)');
    
    await adminSettingsService.incrementMessagesSent(testAdminId, 10);
    console.log('✅ Отправленные сообщения инкрементированы (+10)');
  } catch (error) {
    console.log('❌ Ошибка при инкременте статистики:', error.message);
  }

  // Тест 9: Переключение настроек
  console.log('\n📋 Тест 9: Переключение настроек');
  console.log('─'.repeat(50));
  
  try {
    console.log('🔧 Переключаем режим обслуживания...');
    await adminSettingsService.setMaintenanceMode(testAdminId, true);
    console.log('✅ Режим обслуживания включен');
    
    await adminSettingsService.setMaintenanceMode(testAdminId, false);
    console.log('✅ Режим обслуживания выключен');
    
    console.log('🔧 Переключаем ежедневную статистику...');
    await adminSettingsService.toggleDailyStats(testAdminId, false);
    console.log('✅ Ежедневная статистика выключена');
    
    await adminSettingsService.toggleDailyStats(testAdminId, true);
    console.log('✅ Ежедневная статистика включена');
  } catch (error) {
    console.log('❌ Ошибка при переключении настроек:', error.message);
  }

  // Тест 10: Проверка финального состояния
  console.log('\n📋 Тест 10: Финальное состояние настроек');
  console.log('─'.repeat(50));
  
  try {
    const finalSettings = await adminSettingsService.getAdminSettings(testAdminId);
    
    if (finalSettings) {
      console.log('🔧 Финальные настройки бота:');
      console.log(`   Режим обслуживания: ${finalSettings.bot_settings?.maintenance_mode ? '🔴 ВКЛ' : '🟢 ВЫКЛ'}`);
      console.log(`   Ежедневная статистика: ${finalSettings.bot_settings?.daily_stats ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Рассылки: ${finalSettings.bot_settings?.broadcast_enabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Уведомления об ошибках: ${finalSettings.bot_settings?.error_notifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      console.log(`   Уведомления о новых пользователях: ${finalSettings.bot_settings?.new_user_notifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`);
      
      console.log('\n📊 Финальная статистика:');
      console.log(`   Ошибки: ${finalSettings.daily_stats?.errors || 0}`);
      console.log(`   Новые пользователи: ${finalSettings.daily_stats?.new_users || 0}`);
      console.log(`   Активные пользователи: ${finalSettings.daily_stats?.active_users || 0}`);
      console.log(`   Отправлено сообщений: ${finalSettings.daily_stats?.messages_sent || 0}`);
    }
  } catch (error) {
    console.log('❌ Ошибка при получении финального состояния:', error.message);
  }

  console.log('\n✅ Тестирование админских настроек завершено!');
  
  console.log('\n💡 Рекомендации:');
  console.log('   1. Убедитесь, что миграции выполнены в Supabase');
  console.log('   2. Проверьте права доступа к таблице admin_settings');
  console.log('   3. Настройте RLS политики если необходимо');
  console.log('   4. Проверьте логи в Supabase Dashboard');
  console.log('   5. Админские настройки интегрированы с админ-панелью');
  console.log('   6. Для полного тестирования настройте SUPABASE_URL и SUPABASE_ANON_KEY');
}

// Запуск теста
testAdminSettings().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 