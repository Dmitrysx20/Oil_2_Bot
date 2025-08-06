#!/usr/bin/env node

const SubscriptionService = require('../src/services/SubscriptionService');
const config = require('../config');
const logger = require('../src/utils/logger');

async function testSubscribersDatabase() {
  console.log('👥 Тестирование системы учета подписчиков...\n');

  const subscriptionService = new SubscriptionService();

  // Тест 1: Проверка подключения к базе данных
  console.log('📋 Тест 1: Проверка подключения к базе данных');
  console.log('─'.repeat(50));
  
  if (!config.supabase.url || !config.supabase.key) {
    console.log('❌ Supabase credentials not configured');
    console.log('💡 Установите SUPABASE_URL и SUPABASE_ANON_KEY в переменных окружения');
    return;
  }

  console.log('✅ Supabase credentials found');
  console.log(`   URL: ${config.supabase.url.substring(0, 30)}...`);
  console.log(`   Key: ${config.supabase.key.substring(0, 20)}...`);

  // Тест 2: Подписка пользователя
  console.log('\n📋 Тест 2: Подписка пользователя');
  console.log('─'.repeat(50));
  
  const testUserId = 802895688;
  const testUserName = 'Test User';

  try {
    console.log(`🔧 Подписываем пользователя ${testUserName} (ID: ${testUserId})`);
    
    const subscribeResult = await subscriptionService.subscribeUser(testUserId, testUserName);
    
    if (subscribeResult.success) {
      console.log('✅ Пользователь успешно подписан');
      if (subscribeResult.mock) {
        console.log('⚠️ Использованы mock данные (база данных недоступна)');
      } else {
        console.log('✅ Данные сохранены в базе данных');
      }
    } else {
      console.log('❌ Ошибка при подписке пользователя');
    }
  } catch (error) {
    console.log('❌ Ошибка при подписке:', error.message);
  }

  // Тест 3: Получение списка активных подписчиков
  console.log('\n📋 Тест 3: Получение списка активных подписчиков');
  console.log('─'.repeat(50));
  
  try {
    const activeSubscribers = await subscriptionService.getActiveSubscribers();
    
    console.log(`✅ Получено ${activeSubscribers.length} активных подписчиков:`);
    
    activeSubscribers.forEach((subscriber, index) => {
      console.log(`   ${index + 1}. ${subscriber.first_name || subscriber.username} (ID: ${subscriber.chat_id})`);
      if (subscriber.last_activity) {
        console.log(`      Последняя активность: ${new Date(subscriber.last_activity).toLocaleString('ru-RU')}`);
      }
      if (subscriber.stats && subscriber.stats.total_interactions) {
        console.log(`      Взаимодействий: ${subscriber.stats.total_interactions}`);
      }
    });
  } catch (error) {
    console.log('❌ Ошибка при получении подписчиков:', error.message);
  }

  // Тест 4: Статистика подписчиков
  console.log('\n📋 Тест 4: Статистика подписчиков');
  console.log('─'.repeat(50));
  
  try {
    const stats = await subscriptionService.getSubscriberStats();
    
    console.log('📊 Статистика подписчиков:');
    console.log(`   👥 Всего подписчиков: ${stats.total_subscribers}`);
    console.log(`   ✅ Активных: ${stats.active_subscribers}`);
    console.log(`   ❌ Неактивных: ${stats.inactive_subscribers}`);
    console.log(`   🚫 Заблокированных: ${stats.blocked_subscribers}`);
    console.log(`   📅 Активных за 7 дней: ${stats.active_last_7_days}`);
    console.log(`   📅 Активных за 30 дней: ${stats.active_last_30_days}`);
    console.log(`   🆕 Новых за 7 дней: ${stats.new_last_7_days}`);
    console.log(`   🆕 Новых за 30 дней: ${stats.new_last_30_days}`);
  } catch (error) {
    console.log('❌ Ошибка при получении статистики:', error.message);
  }

  // Тест 5: Отписка пользователя
  console.log('\n📋 Тест 5: Отписка пользователя');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Отписываем пользователя ${testUserName} (ID: ${testUserId})`);
    
    const unsubscribeResult = await subscriptionService.unsubscribeUser(testUserId);
    
    if (unsubscribeResult.success) {
      console.log('✅ Пользователь успешно отписан');
      if (unsubscribeResult.mock) {
        console.log('⚠️ Использованы mock данные (база данных недоступна)');
      } else {
        console.log('✅ Данные обновлены в базе данных');
      }
    } else {
      console.log('❌ Ошибка при отписке пользователя');
    }
  } catch (error) {
    console.log('❌ Ошибка при отписке:', error.message);
  }

  // Тест 6: Повторная подписка
  console.log('\n📋 Тест 6: Повторная подписка');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Повторно подписываем пользователя ${testUserName} (ID: ${testUserId})`);
    
    const resubscribeResult = await subscriptionService.subscribeUser(testUserId, testUserName);
    
    if (resubscribeResult.success) {
      console.log('✅ Пользователь успешно переподписан');
      if (resubscribeResult.mock) {
        console.log('⚠️ Использованы mock данные (база данных недоступна)');
      } else {
        console.log('✅ Данные обновлены в базе данных');
      }
    } else {
      console.log('❌ Ошибка при переподписке пользователя');
    }
  } catch (error) {
    console.log('❌ Ошибка при переподписке:', error.message);
  }

  // Тест 7: Обновление активности
  console.log('\n📋 Тест 7: Обновление активности');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Обновляем активность пользователя ${testUserId}`);
    
    await subscriptionService.updateLastActivity(testUserId);
    console.log('✅ Активность обновлена');
  } catch (error) {
    console.log('❌ Ошибка при обновлении активности:', error.message);
  }

  // Тест 8: Логирование активности
  console.log('\n📋 Тест 8: Логирование активности');
  console.log('─'.repeat(50));
  
  try {
    console.log(`🔧 Логируем активность пользователя ${testUserId}`);
    
    await subscriptionService.logActivity(testUserId, 'test_activity', {
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Активность залогирована');
  } catch (error) {
    console.log('❌ Ошибка при логировании активности:', error.message);
  }

  // Финальная статистика
  console.log('\n📋 Финальная статистика');
  console.log('─'.repeat(50));
  
  try {
    const finalStats = await subscriptionService.getSubscriberStats();
    const finalCount = await subscriptionService.getSubscriberCount();
    const finalActiveCount = await subscriptionService.getActiveSubscribersCount();
    
    console.log('📊 Итоговые данные:');
    console.log(`   👥 Всего подписчиков: ${finalCount}`);
    console.log(`   ✅ Активных подписчиков: ${finalActiveCount}`);
    console.log(`   📈 Активных за 7 дней: ${finalStats.active_last_7_days}`);
    console.log(`   📈 Активных за 30 дней: ${finalStats.active_last_30_days}`);
  } catch (error) {
    console.log('❌ Ошибка при получении финальной статистики:', error.message);
  }

  // Тест 9: Новые функции расширенной функциональности
  console.log('\n📋 Тест 9: Расширенная функциональность');
  console.log('─'.repeat(50));
  
  // Тест получения профиля пользователя
  console.log('\n🔧 Тест получения профиля пользователя:');
  try {
    const userProfile = await subscriptionService.getUserProfile(testUserId);
    if (userProfile) {
      console.log('✅ Профиль пользователя получен');
      console.log(`   Имя: ${userProfile.first_name}`);
      console.log(`   Активен: ${userProfile.is_active ? 'Да' : 'Нет'}`);
      if (userProfile.preferences) {
        console.log(`   Язык: ${userProfile.preferences.language}`);
        console.log(`   Время уведомлений: ${userProfile.preferences.morning_time} - ${userProfile.preferences.evening_time}`);
      }
    } else {
      console.log('❌ Профиль пользователя не найден');
    }
  } catch (error) {
    console.log('❌ Ошибка при получении профиля:', error.message);
  }

  // Тест обновления настроек
  console.log('\n🔧 Тест обновления настроек:');
  try {
    const newPreferences = {
      language: 'ru',
      evening_time: '21:00',
      morning_time: '08:00',
      weekend_mode: true,
      music_platforms: ['youtube', 'spotify'],
      notification_enabled: true
    };
    
    const updateResult = await subscriptionService.updateUserPreferences(testUserId, newPreferences);
    if (updateResult.success) {
      console.log('✅ Настройки пользователя обновлены');
      if (updateResult.mock) {
        console.log('⚠️ Использованы mock данные');
      }
    } else {
      console.log('❌ Ошибка при обновлении настроек');
    }
  } catch (error) {
    console.log('❌ Ошибка при обновлении настроек:', error.message);
  }

  // Тест добавления любимого масла
  console.log('\n🔧 Тест добавления любимого масла:');
  try {
    await subscriptionService.addFavoriteOil(testUserId, 'Лаванда');
    console.log('✅ Любимое масло добавлено');
  } catch (error) {
    console.log('❌ Ошибка при добавлении любимого масла:', error.message);
  }

  // Тест инкремента взаимодействий
  console.log('\n🔧 Тест инкремента взаимодействий:');
  try {
    await subscriptionService.incrementInteraction(testUserId, 'oil_search');
    console.log('✅ Взаимодействие засчитано');
  } catch (error) {
    console.log('❌ Ошибка при инкременте взаимодействий:', error.message);
  }

  console.log('\n✅ Тестирование системы учета подписчиков завершено!');
  
  console.log('\n💡 Рекомендации:');
  console.log('   1. Убедитесь, что миграции выполнены в Supabase');
  console.log('   2. Проверьте права доступа к таблицам');
  console.log('   3. Настройте RLS политики если необходимо');
  console.log('   4. Проверьте логи в Supabase Dashboard');
  console.log('   5. Новая схема поддерживает расширенную функциональность');
}

// Запуск теста
testSubscribersDatabase().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 