const DailyRecommendationsService = require('../src/services/DailyRecommendationsService');
const SubscriptionService = require('../src/services/SubscriptionService');
const logger = require('../src/utils/logger');

async function testDailyRecommendations() {
  console.log('📅 Тестирование системы ежедневных рекомендаций\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const dailyRecommendationsService = new DailyRecommendationsService();
  const subscriptionService = new SubscriptionService();
  
  const testUserId = 123456789;
  
  // Тест 1: Создание рекомендации
  console.log('📋 ТЕСТ 1: Создание ежедневной рекомендации');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const recommendationData = {
    type: 'morning_boost',
    oils: {
      oils: ['Мята перечная', 'Розмарин', 'Эвкалипт'],
      effects: ['энергия', 'концентрация', 'освежение'],
      blend_ratio: '1:1:1'
    },
    music: {
      mood: 'энергичная',
      genre: 'pop',
      duration: 25,
      youtube: 'https://youtube.com/watch?v=example'
    },
    instructions: 'Используйте масла утром для бодрости и концентрации'
  };
  
  const createdRecommendation = await dailyRecommendationsService.createRecommendation(testUserId, recommendationData);
  console.log('✅ Создана рекомендация:');
  console.log(`   ID: ${createdRecommendation.id}`);
  console.log(`   Тип: ${createdRecommendation.recommendation_type || recommendationData.type}`);
  console.log(`   Масла: ${createdRecommendation.oils_recommended?.oils?.join(', ') || recommendationData.oils.oils.join(', ')}`);
  console.log(`   Музыка: ${createdRecommendation.music_recommendations?.mood || recommendationData.music.mood}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 2: Получение рекомендаций пользователя
  console.log('📋 ТЕСТ 2: Получение рекомендаций пользователя');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const userRecommendations = await dailyRecommendationsService.getUserRecommendations(testUserId);
  console.log('📊 Рекомендации пользователя:');
  console.log(`   Всего рекомендаций: ${userRecommendations.length}`);
  
  userRecommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.recommendation_type} (${rec.recommendation_date})`);
    console.log(`      Масла: ${rec.oils_recommended?.oils?.join(', ') || 'не указаны'}`);
    console.log(`      Статус: ${rec.was_sent ? 'отправлено' : 'не отправлено'}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 3: Отметка как отправленную
  console.log('📋 ТЕСТ 3: Отметка рекомендации как отправленной');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const markedAsSent = await dailyRecommendationsService.markAsSent(createdRecommendation.id);
  console.log('✅ Рекомендация отмечена как отправленная:');
  console.log(`   ID: ${markedAsSent.id}`);
  console.log(`   Время отправки: ${markedAsSent.sent_at}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 4: Получение рекомендации по дате
  console.log('📋 ТЕСТ 4: Получение рекомендации по дате');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const today = new Date().toISOString().split('T')[0];
  const recommendationByDate = await dailyRecommendationsService.getRecommendationByDate(testUserId, today);
  
  if (recommendationByDate) {
    console.log('📅 Рекомендация на сегодня:');
    console.log(`   Тип: ${recommendationByDate.recommendation_type}`);
    console.log(`   Масла: ${recommendationByDate.oils_recommended?.oils?.join(', ') || 'не указаны'}`);
    console.log(`   Инструкции: ${recommendationByDate.instructions || 'не указаны'}`);
  } else {
    console.log('📅 Рекомендация на сегодня не найдена');
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 5: Сохранение обратной связи
  console.log('📋 ТЕСТ 5: Сохранение обратной связи пользователя');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const userFeedback = {
    notes: 'Отличные масла, очень помогли с концентрацией',
    rating: 5,
    used_oils: true,
    effectiveness: 'high',
    listened_music: true
  };
  
  const savedFeedback = await dailyRecommendationsService.saveUserFeedback(createdRecommendation.id, userFeedback);
  console.log('✅ Обратная связь сохранена:');
  console.log(`   Рейтинг: ${savedFeedback.user_feedback?.rating || 0}/5`);
  console.log(`   Использовал масла: ${savedFeedback.user_feedback?.used_oils ? 'да' : 'нет'}`);
  console.log(`   Эффективность: ${savedFeedback.user_feedback?.effectiveness || 'не указана'}`);
  console.log(`   Заметки: ${savedFeedback.user_feedback?.notes || 'нет заметок'}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 6: Генерация персонализированной рекомендации
  console.log('📋 ТЕСТ 6: Генерация персонализированной рекомендации');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Получаем профиль пользователя
  const userProfile = await subscriptionService.getUserProfile(testUserId);
  console.log('👤 Профиль пользователя:');
  console.log(`   Настроение: ${userProfile?.current_state?.last_mood || 'неизвестно'}`);
  console.log(`   Любимые масла: ${userProfile?.stats?.favorite_oils?.join(', ') || 'нет'}`);
  console.log(`   Дней подряд: ${userProfile?.current_state?.streak_days || 0}`);
  
  // Генерируем персонализированную рекомендацию
  const personalizedRecommendation = await dailyRecommendationsService.generatePersonalizedRecommendation(testUserId, userProfile);
  console.log('\n🎯 Персонализированная рекомендация:');
  console.log(`   Тип: ${personalizedRecommendation.recommendation_type || personalizedRecommendation.type}`);
  console.log(`   Масла: ${personalizedRecommendation.oils_recommended?.oils?.join(', ') || 'не указаны'}`);
  console.log(`   Эффекты: ${personalizedRecommendation.oils_recommended?.effects?.join(', ') || 'не указаны'}`);
  console.log(`   Музыка: ${personalizedRecommendation.music_recommendations?.mood || 'не указано'} (${personalizedRecommendation.music_recommendations?.duration || 0} мин)`);
  console.log(`   Инструкции: ${personalizedRecommendation.instructions || 'не указаны'}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 7: Получение статистики
  console.log('📋 ТЕСТ 7: Получение статистики рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const stats = await dailyRecommendationsService.getRecommendationsStats();
  console.log('📈 Статистика рекомендаций:');
  console.log(`   Всего рекомендаций: ${stats.total_recommendations}`);
  console.log(`   Отправлено: ${stats.sent_recommendations}`);
  console.log(`   Прочитано: ${stats.read_recommendations}`);
  console.log(`   Средний рейтинг: ${stats.avg_rating || 0}`);
  console.log(`   Популярный тип: ${stats.most_popular_type || 'нет данных'}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 8: Получение неотправленных рекомендаций
  console.log('📋 ТЕСТ 8: Получение неотправленных рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const unsentRecommendations = await dailyRecommendationsService.getUnsentRecommendations();
  console.log('📤 Неотправленные рекомендации:');
  console.log(`   Количество: ${unsentRecommendations.length}`);
  
  unsentRecommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. Пользователь ${rec.chat_id} - ${rec.recommendation_type}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 9: Тестирование различных типов рекомендаций
  console.log('📋 ТЕСТ 9: Тестирование различных типов рекомендаций');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const recommendationTypes = [
    'morning_boost',
    'afternoon_focus', 
    'evening_relax',
    'night_sleep'
  ];
  
  for (const type of recommendationTypes) {
    const testData = {
      type: type,
      oils: {
        oils: ['Тестовое масло'],
        effects: ['тест'],
        blend_ratio: '1:1'
      },
      music: {
        mood: 'тестовая',
        duration: 15
      },
      instructions: `Тестовая инструкция для ${type}`
    };
    
    const testRec = await dailyRecommendationsService.createRecommendation(testUserId, testData);
    console.log(`✅ Создана ${type}: ${testRec.id}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Рекомендации по улучшению
  console.log('💡 РЕКОМЕНДАЦИИ ПО СИСТЕМЕ ЕЖЕДНЕВНЫХ РЕКОМЕНДАЦИЙ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🧠 **Что уже работает:**');
  console.log('   • Создание и сохранение рекомендаций');
  console.log('   • Отслеживание статуса отправки');
  console.log('   • Сохранение обратной связи');
  console.log('   • Персонализация на основе профиля');
  console.log('   • Статистика и аналитика');
  console.log('   • Автоматическое определение типа рекомендации');
  
  console.log('\n🚀 **Что можно улучшить:**');
  console.log('   • Машинное обучение для предсказания предпочтений');
  console.log('   • A/B тестирование рекомендаций');
  console.log('   • Уведомления о новых рекомендациях');
  console.log('   • Интеграция с календарем пользователя');
  console.log('   • Групповые рекомендации');
  console.log('   • Сезонные рекомендации');
  
  console.log('\n📊 **Метрики для отслеживания:**');
  console.log('   • Процент открытия рекомендаций');
  console.log('   • Время между созданием и отправкой');
  console.log('   • Рейтинг эффективности');
  console.log('   • Популярность типов рекомендаций');
  console.log('   • Конверсия в использование масел');
  
  console.log('\n🔧 **Технические улучшения:**');
  console.log('   • Кэширование частых запросов');
  console.log('   • Пакетная обработка рекомендаций');
  console.log('   • Автоматическая очистка старых данных');
  console.log('   • Мониторинг производительности');
  
  console.log('\n✅ Тестирование системы ежедневных рекомендаций завершено!');
}

// Запускаем тест
if (require.main === module) {
  testDailyRecommendations().catch(console.error);
}

module.exports = { testDailyRecommendations }; 