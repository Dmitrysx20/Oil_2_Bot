const RecommendationSubscriptionService = require('../src/services/RecommendationSubscriptionService');
const logger = require('../src/utils/logger');

async function testRecommendationSubscriptions() {
  console.log('📅 Тестирование системы подписок на рекомендации\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const subscriptionService = new RecommendationSubscriptionService();
  
  const testUserId = 123456789;
  
  // Тест 1: Подписка на утренние рекомендации
  console.log('📋 ТЕСТ 1: Подписка на утренние рекомендации');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const morningSubscription = await subscriptionService.subscribeToMorningRecommendations(testUserId, '08:30');
  console.log('✅ Подписка на утренние рекомендации:');
  console.log(`   Пользователь: ${morningSubscription.chat_id}`);
  console.log(`   Статус: ${morningSubscription.status}`);
  console.log(`   Время: ${morningSubscription.morning_time}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 2: Подписка на вечерние рекомендации
  console.log('📋 ТЕСТ 2: Подписка на вечерние рекомендации');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const eveningSubscription = await subscriptionService.subscribeToEveningRecommendations(testUserId, '21:00');
  console.log('✅ Подписка на вечерние рекомендации:');
  console.log(`   Пользователь: ${eveningSubscription.chat_id}`);
  console.log(`   Статус: ${eveningSubscription.status}`);
  console.log(`   Время: ${eveningSubscription.evening_time}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 3: Получение статуса подписок
  console.log('📋 ТЕСТ 3: Получение статуса подписок');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const subscriptionStatus = await subscriptionService.getSubscriptionStatus(testUserId);
  console.log('📊 Статус подписок пользователя:');
  console.log(`   Утренние: ${subscriptionStatus.morning_subscription ? '✅' : '❌'} (${subscriptionStatus.morning_time})`);
  console.log(`   Вечерние: ${subscriptionStatus.evening_subscription ? '✅' : '❌'} (${subscriptionStatus.evening_time})`);
  console.log(`   Общий статус: ${subscriptionStatus.status}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 4: Обновление времени уведомлений
  console.log('📋 ТЕСТ 4: Обновление времени уведомлений');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const updatedMorningTime = await subscriptionService.updateMorningTime(testUserId, '07:00');
  console.log('⏰ Обновлено время утренних уведомлений:');
  console.log(`   Новое время: ${updatedMorningTime.morning_time}`);
  
  const updatedEveningTime = await subscriptionService.updateEveningTime(testUserId, '22:30');
  console.log('⏰ Обновлено время вечерних уведомлений:');
  console.log(`   Новое время: ${updatedEveningTime.evening_time}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 5: Получение списка подписчиков
  console.log('📋 ТЕСТ 5: Получение списка подписчиков');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const morningSubscribers = await subscriptionService.getMorningSubscribers();
  console.log('🌅 Подписчики на утренние рекомендации:');
  console.log(`   Количество: ${morningSubscribers.length}`);
  morningSubscribers.forEach((subscriber, i) => {
    console.log(`   ${i + 1}. Пользователь ${subscriber.chat_id} - ${subscriber.morning_time}`);
  });
  
  const eveningSubscribers = await subscriptionService.getEveningSubscribers();
  console.log('\n🌆 Подписчики на вечерние рекомендации:');
  console.log(`   Количество: ${eveningSubscribers.length}`);
  eveningSubscribers.forEach((subscriber, i) => {
    console.log(`   ${i + 1}. Пользователь ${subscriber.chat_id} - ${subscriber.evening_time}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 6: Отправка утренних рекомендаций
  console.log('📋 ТЕСТ 6: Отправка утренних рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const morningResult = await subscriptionService.sendMorningRecommendations();
  console.log('🌅 Результат отправки утренних рекомендаций:');
  console.log(`   Отправлено: ${morningResult.sent}`);
  console.log(`   Ошибок: ${morningResult.errors}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 7: Отправка вечерних рекомендаций
  console.log('📋 ТЕСТ 7: Отправка вечерних рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const eveningResult = await subscriptionService.sendEveningRecommendations();
  console.log('🌆 Результат отправки вечерних рекомендаций:');
  console.log(`   Отправлено: ${eveningResult.sent}`);
  console.log(`   Ошибок: ${eveningResult.errors}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 8: Форматирование сообщений
  console.log('📋 ТЕСТ 8: Форматирование сообщений');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mockRecommendation = {
    oils_recommended: {
      oils: ['Мята перечная', 'Розмарин', 'Эвкалипт'],
      effects: ['энергия', 'концентрация', 'освежение']
    },
    music_recommendations: {
      mood: 'энергичная',
      duration: 25
    },
    instructions: 'Используйте масла в аромалампе для бодрости и концентрации'
  };
  
  const morningMessage = subscriptionService.formatMorningRecommendation(mockRecommendation);
  console.log('🌅 Пример утреннего сообщения:');
  console.log(morningMessage);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  const eveningMessage = subscriptionService.formatEveningRecommendation(mockRecommendation);
  console.log('🌆 Пример вечернего сообщения:');
  console.log(eveningMessage);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 9: Статистика подписок
  console.log('📋 ТЕСТ 9: Статистика подписок');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const subscriptionStats = await subscriptionService.getSubscriptionStats();
  console.log('📈 Статистика подписок:');
  console.log(`   Всего подписчиков: ${subscriptionStats.total_subscribers}`);
  console.log(`   Подписчики на утренние: ${subscriptionStats.morning_subscribers}`);
  console.log(`   Подписчики на вечерние: ${subscriptionStats.evening_subscribers}`);
  console.log(`   Подписчики на оба типа: ${subscriptionStats.both_subscriptions}`);
  console.log(`   Активных подписчиков: ${subscriptionStats.active_subscribers}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 10: Отписка от рекомендаций
  console.log('📋 ТЕСТ 10: Отписка от рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const unsubscribedMorning = await subscriptionService.unsubscribeFromMorningRecommendations(testUserId);
  console.log('❌ Отписка от утренних рекомендаций:');
  console.log(`   Статус: ${unsubscribedMorning.status}`);
  
  const unsubscribedEvening = await subscriptionService.unsubscribeFromEveningRecommendations(testUserId);
  console.log('❌ Отписка от вечерних рекомендаций:');
  console.log(`   Статус: ${unsubscribedEvening.status}`);
  
  // Проверяем финальный статус
  const finalStatus = await subscriptionService.getSubscriptionStatus(testUserId);
  console.log('\n📊 Финальный статус подписок:');
  console.log(`   Утренние: ${finalStatus.morning_subscription ? '✅' : '❌'}`);
  console.log(`   Вечерние: ${finalStatus.evening_subscription ? '✅' : '❌'}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Демонстрация работы системы
  console.log('🎯 ДЕМОНСТРАЦИЯ РАБОТЫ СИСТЕМЫ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🌅 **Как работают утренние рекомендации:**');
  console.log('   1. Пользователь подписывается на утренние рекомендации');
  console.log('   2. Указывает удобное время (например, 08:30)');
  console.log('   3. Система автоматически генерирует персонализированную рекомендацию');
  console.log('   4. В указанное время отправляется сообщение с маслами и музыкой');
  console.log('   5. Рекомендация сохраняется в базе данных');
  
  console.log('\n🌆 **Как работают вечерние рекомендации:**');
  console.log('   1. Пользователь подписывается на вечерние рекомендации');
  console.log('   2. Указывает удобное время (например, 21:00)');
  console.log('   3. Система создает расслабляющую рекомендацию');
  console.log('   4. В указанное время отправляется сообщение для вечернего отдыха');
  console.log('   5. Рекомендация адаптируется под настроение пользователя');
  
  console.log('\n🎨 **Персонализация:**');
  console.log('   • Учитываются любимые масла пользователя');
  console.log('   • Анализируется история использования');
  console.log('   • Учитывается текущее настроение');
  console.log('   • Адаптируется под время суток');
  
  console.log('\n📊 **Отслеживание:**');
  console.log('   • Статистика отправленных рекомендаций');
  console.log('   • Процент открытия сообщений');
  console.log('   • Обратная связь от пользователей');
  console.log('   • Эффективность рекомендаций');
  
  console.log('\n✅ Тестирование системы подписок завершено!');
}

// Запускаем тест
if (require.main === module) {
  testRecommendationSubscriptions().catch(console.error);
}

module.exports = { testRecommendationSubscriptions }; 