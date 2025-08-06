#!/usr/bin/env node

const UserService = require('../src/services/UserService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testUsers() {
  console.log('👥 Тестирование системы пользователей...\n');

  const userService = new UserService();
  const testTelegramId = 123456789;

  // Тест 1: Проверка подключения к базе данных
  console.log('📋 Тест 1: Проверка подключения к базе данных');
  console.log('─'.repeat(50));
  
  if (!config.supabase.url || !config.supabase.key) {
    console.log('⚠️ Supabase credentials not configured - будет использоваться mock режим');
    console.log('💡 Для полного тестирования установите SUPABASE_URL и SUPABASE_ANON_KEY');
  } else {
    console.log('✅ Supabase credentials found - будет использоваться реальная база данных');
  }

  // Тест 2: Инициализация пользователя
  console.log('\n📋 Тест 2: Инициализация пользователя');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Инициализируем пользователя ${testTelegramId}`);
    
    const initResult = await userService.initializeUser(testTelegramId);
    
    if (initResult.success) {
      console.log('✅ Пользователь инициализирован');
      console.log(`   ID: ${initResult.user_id}`);
      console.log(`   Telegram ID: ${initResult.telegram_id}`);
      console.log(`   Статус: ${initResult.status}`);
      console.log(`   Текущий день: ${initResult.current_day}`);
      console.log(`   Дата начала: ${initResult.start_date}`);
      if (initResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при инициализации пользователя');
    }
  } catch (error) {
    console.log('❌ Ошибка при инициализации:', error.message);
  }

  // Тест 3: Получение пользователя
  console.log('\n📋 Тест 3: Получение пользователя');
  console.log('─'.repeat(50));
  
  try {
    const user = await userService.getUser(testTelegramId);
    
    if (user) {
      console.log('✅ Пользователь получен успешно');
      console.log('📋 Информация о пользователе:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Telegram ID: ${user.telegram_id}`);
      console.log(`   Статус: ${user.status}`);
      console.log(`   Текущий день: ${user.current_day}`);
      console.log(`   Дата начала: ${user.start_date}`);
      console.log(`   Окончание подписки: ${user.subscription_end || 'Не установлено'}`);
      if (user.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Пользователь не найден');
    }
  } catch (error) {
    console.log('❌ Ошибка при получении пользователя:', error.message);
  }

  // Тест 4: Обновление дня пользователя
  console.log('\n📋 Тест 4: Обновление дня пользователя');
  console.log('─'.repeat(50));
  
  try {
    const newDay = 5;
    console.log(`🔧 Обновляем день пользователя на ${newDay}`);
    
    const updateResult = await userService.updateUserDay(testTelegramId, newDay);
    
    if (updateResult.success) {
      console.log('✅ День пользователя обновлен');
      console.log(`   Новый день: ${updateResult.current_day}`);
      if (updateResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при обновлении дня');
    }
  } catch (error) {
    console.log('❌ Ошибка при обновлении дня:', error.message);
  }

  // Тест 5: Обновление статуса пользователя
  console.log('\n📋 Тест 5: Обновление статуса пользователя');
  console.log('─'.repeat(50));
  
  try {
    const newStatus = 'premium';
    console.log(`🔧 Обновляем статус пользователя на ${newStatus}`);
    
    const statusResult = await userService.updateUserStatus(testTelegramId, newStatus);
    
    if (statusResult.success) {
      console.log('✅ Статус пользователя обновлен');
      console.log(`   Новый статус: ${statusResult.status}`);
      if (statusResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при обновлении статуса');
    }
  } catch (error) {
    console.log('❌ Ошибка при обновлении статуса:', error.message);
  }

  // Тест 6: Специализированные методы
  console.log('\n📋 Тест 6: Специализированные методы');
  console.log('─'.repeat(50));
  
  try {
    // Проверка активности пользователя
    const isActive = await userService.isUserActive(testTelegramId);
    console.log(`🔧 Пользователь активен: ${isActive ? '✅ Да' : '❌ Нет'}`);
    
    // Проверка активности подписки
    const isSubscriptionActive = await userService.isSubscriptionActive(testTelegramId);
    console.log(`🔧 Подписка активна: ${isSubscriptionActive ? '✅ Да' : '❌ Нет'}`);
    
    // Получение текущего дня
    const currentDay = await userService.getCurrentDay(testTelegramId);
    console.log(`🔧 Текущий день: ${currentDay}`);
    
    // Инкремент дня
    const incrementResult = await userService.incrementDay(testTelegramId);
    if (incrementResult.success) {
      console.log(`🔧 День инкрементирован: ${incrementResult.current_day}`);
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке специализированных методов:', error.message);
  }

  // Тест 7: Статистика пользователей
  console.log('\n📋 Тест 7: Статистика пользователей');
  console.log('─'.repeat(50));
  
  try {
    const stats = await userService.getUsersStats();
    
    console.log('📊 Статистика пользователей:');
    console.log(`   👥 Всего пользователей: ${stats.total_users}`);
    console.log(`   ✅ Активных пользователей: ${stats.active_users}`);
    console.log(`   ❌ Неактивных пользователей: ${stats.inactive_users}`);
    console.log(`   🆕 Новых пользователей сегодня: ${stats.new_users_today}`);
    if (stats.mock) {
      console.log('⚠️ Использованы mock данные');
    }
  } catch (error) {
    console.log('❌ Ошибка при получении статистики:', error.message);
  }

  // Тест 8: Получение пользователей по статусу
  console.log('\n📋 Тест 8: Получение пользователей по статусу');
  console.log('─'.repeat(50));
  
  try {
    const activeUsers = await userService.getUsersByStatus('active');
    console.log(`🔧 Активных пользователей: ${activeUsers.length}`);
    
    const premiumUsers = await userService.getUsersByStatus('premium');
    console.log(`🔧 Премиум пользователей: ${premiumUsers.length}`);
    
    if (activeUsers.length > 0) {
      console.log('📋 Пример активного пользователя:');
      console.log(`   ID: ${activeUsers[0].id}`);
      console.log(`   Telegram ID: ${activeUsers[0].telegram_id}`);
      console.log(`   Статус: ${activeUsers[0].status}`);
    }
  } catch (error) {
    console.log('❌ Ошибка при получении пользователей по статусу:', error.message);
  }

  // Тест 9: Пользователи с истекающей подпиской
  console.log('\n📋 Тест 9: Пользователи с истекающей подпиской');
  console.log('─'.repeat(50));
  
  try {
    const expiringUsers = await userService.getUsersWithExpiringSubscription(7);
    console.log(`🔧 Пользователей с истекающей подпиской (7 дней): ${expiringUsers.length}`);
    
    if (expiringUsers.length > 0) {
      console.log('📋 Пример пользователя с истекающей подпиской:');
      console.log(`   ID: ${expiringUsers[0].id}`);
      console.log(`   Telegram ID: ${expiringUsers[0].telegram_id}`);
      console.log(`   Окончание подписки: ${expiringUsers[0].subscription_end}`);
    }
  } catch (error) {
    console.log('❌ Ошибка при получении пользователей с истекающей подпиской:', error.message);
  }

  // Тест 10: Утилиты
  console.log('\n📋 Тест 10: Утилиты');
  console.log('─'.repeat(50));
  
  try {
    // Сброс прогресса пользователя
    console.log('🔧 Сбрасываем прогресс пользователя...');
    const resetResult = await userService.resetUserProgress(testTelegramId);
    
    if (resetResult.success) {
      console.log('✅ Прогресс пользователя сброшен');
      console.log(`   Новый день: ${resetResult.current_day}`);
    } else {
      console.log('❌ Ошибка при сбросе прогресса');
    }
  } catch (error) {
    console.log('❌ Ошибка при работе с утилитами:', error.message);
  }

  console.log('\n✅ Тестирование системы пользователей завершено!');
  
  console.log('\n💡 Рекомендации:');
  console.log('   1. Убедитесь, что миграция 004_create_users_table.sql выполнена');
  console.log('   2. Проверьте права доступа к таблице users');
  console.log('   3. Настройте RLS политики если необходимо');
  console.log('   4. Проверьте работу функций initialize_user, update_user_day, update_user_status');
  console.log('   5. Для полного тестирования настройте SUPABASE_URL и SUPABASE_ANON_KEY');
}

// Запуск теста
testUsers().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 