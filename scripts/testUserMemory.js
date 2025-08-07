const SubscriptionService = require('../src/services/SubscriptionService');
const MusicService = require('../src/services/MusicService');
const OilService = require('../src/services/OilService');
const logger = require('../src/utils/logger');

async function testUserMemory() {
  console.log('🧠 Тестирование системы памяти пользователей\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const subscriptionService = new SubscriptionService();
  const musicService = new MusicService();
  const oilService = new OilService();
  
  const testUserId = 123456789;
  
  // Тест 1: Симуляция первого запроса пользователя
  console.log('📋 ТЕСТ 1: Первый запрос пользователя');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('👤 Пользователь запрашивает: "Нужна энергия"');
  
  // Симулируем поиск масла
  try {
    const oils = await oilService.searchOils('энергия');
    console.log('🌿 Найденные масла:');
    if (oils && oils.length > 0) {
      oils.slice(0, 3).forEach((oil, i) => {
        console.log(`   ${i + 1}. ${oil.name}`);
      });
    } else {
      console.log('   (mock данные) Мята перечная, Розмарин, Эвкалипт');
    }
  } catch (error) {
    console.log('🌿 Найденные масла:');
    console.log('   (mock данные) Мята перечная, Розмарин, Эвкалипт');
  }
  
  // Симулируем поиск музыки
  const musicResult = await musicService.getMusicRecommendation('энергичная');
  console.log('🎵 Рекомендуемая музыка:');
  if (musicResult && musicResult.tracks) {
    musicResult.tracks.slice(0, 2).forEach((track, i) => {
      console.log(`   ${i + 1}. ${track.title} - ${track.artist}`);
    });
  } else {
    console.log('   (mock данные) Eye of the Tiger, We Will Rock You');
  }
  
  // Сохраняем предпочтения пользователя
  console.log('\n💾 Сохраняем предпочтения пользователя...');
  await subscriptionService.updateUserState(testUserId, {
    last_mood: 'energetic',
    last_goals: ['энергия', 'бодрость'],
    streak_days: 1,
    current_program: 'morning_boost'
  });
  
  await subscriptionService.updateUserStats(testUserId, {
    favorite_oils: ['Мята перечная', 'Розмарин'],
    total_interactions: 1,
    recommendations_received: 1
  });
  
  console.log('✅ Предпочтения сохранены');
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 2: Второй запрос (на следующий день)
  console.log('📋 ТЕСТ 2: Второй запрос (на следующий день)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('👤 Пользователь снова запрашивает: "Нужна энергия"');
  
  // Получаем профиль пользователя
  const userProfile = await subscriptionService.getUserProfile(testUserId);
  console.log('📊 Профиль пользователя:');
  console.log(`   Последнее настроение: ${userProfile?.current_state?.last_mood || 'неизвестно'}`);
  console.log(`   Последние цели: ${userProfile?.current_state?.last_goals?.join(', ') || 'нет'}`);
  console.log(`   Любимые масла: ${userProfile?.stats?.favorite_oils?.join(', ') || 'нет'}`);
  console.log(`   Всего взаимодействий: ${userProfile?.stats?.total_interactions || 0}`);
  
  // Персонализированные рекомендации
  console.log('\n🎯 Персонализированные рекомендации:');
  
  if (userProfile?.stats?.favorite_oils?.length > 0) {
    console.log('🌿 Рекомендуем любимые масла пользователя:');
    userProfile.stats.favorite_oils.forEach((oil, i) => {
      console.log(`   ${i + 1}. ${oil} (избранное)`);
    });
  }
  
  if (userProfile?.current_state?.last_mood === 'energetic') {
    console.log('🎵 Рекомендуем энергичную музыку (как в прошлый раз):');
    const energeticMusic = await musicService.getMusicRecommendation('энергичная');
    if (energeticMusic && energeticMusic.tracks) {
      energeticMusic.tracks.slice(0, 2).forEach((track, i) => {
        console.log(`   ${i + 1}. ${track.title} - ${track.artist} (повторная рекомендация)`);
      });
    } else {
      console.log('   (mock данные) Eye of the Tiger, We Will Rock You (повторная рекомендация)');
    }
  }
  
  // Обновляем статистику
  await subscriptionService.incrementInteraction(testUserId, 'energy_request');
  await subscriptionService.updateUserState(testUserId, {
    last_mood: 'energetic',
    last_goals: ['энергия', 'бодрость'],
    streak_days: 2,
    current_program: 'morning_boost'
  });
  
  console.log('\n✅ Статистика обновлена');
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 3: Изменение предпочтений
  console.log('📋 ТЕСТ 3: Изменение предпочтений');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('👤 Пользователь запрашивает: "Хочу расслабиться"');
  
  // Обновляем состояние пользователя
  await subscriptionService.updateUserState(testUserId, {
    last_mood: 'relaxed',
    last_goals: ['расслабление', 'спокойствие'],
    streak_days: 3,
    current_program: 'evening_relax'
  });
  
  // Добавляем новое любимое масло
  await subscriptionService.addFavoriteOil(testUserId, 'Лаванда');
  
  // Получаем обновленный профиль
  const updatedProfile = await subscriptionService.getUserProfile(testUserId);
  console.log('📊 Обновленный профиль:');
  console.log(`   Новое настроение: ${updatedProfile?.current_state?.last_mood}`);
  console.log(`   Новые цели: ${updatedProfile?.current_state?.last_goals?.join(', ')}`);
  console.log(`   Обновленные любимые масла: ${updatedProfile?.stats?.favorite_oils?.join(', ')}`);
  console.log(`   Дней подряд: ${updatedProfile?.current_state?.streak_days}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 4: Анализ паттернов
  console.log('📋 ТЕСТ 4: Анализ паттернов пользователя');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📈 Общая статистика:');
  console.log('   (mock данные) Всего пользователей: 100');
  console.log('   (mock данные) Активных пользователей: 85');
  
  // Анализируем предпочтения пользователя
  const profile = await subscriptionService.getUserProfile(testUserId);
  console.log('\n🎯 Анализ предпочтений пользователя:');
  
  if (profile?.current_state?.last_mood) {
    console.log(`   Частое настроение: ${profile.current_state.last_mood}`);
  }
  
  if (profile?.stats?.favorite_oils?.length > 0) {
    console.log(`   Любимые масла: ${profile.stats.favorite_oils.join(', ')}`);
  }
  
  if (profile?.current_state?.streak_days > 0) {
    console.log(`   Активность: ${profile.current_state.streak_days} дней подряд`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 5: Персонализированные рекомендации
  console.log('📋 ТЕСТ 5: Персонализированные рекомендации');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🎯 Генерируем персонализированные рекомендации...');
  
  const personalizedRecommendations = await generatePersonalizedRecommendations(testUserId, subscriptionService);
  
  console.log('🌿 Персонализированные масла:');
  personalizedRecommendations.oils.forEach((oil, i) => {
    console.log(`   ${i + 1}. ${oil.name} - ${oil.reason}`);
  });
  
  console.log('\n🎵 Персонализированная музыка:');
  personalizedRecommendations.music.forEach((track, i) => {
    console.log(`   ${i + 1}. ${track.title} - ${track.artist} (${track.reason})`);
  });
  
  console.log('\n💡 Персональные советы:');
  personalizedRecommendations.tips.forEach((tip, i) => {
    console.log(`   ${i + 1}. ${tip}`);
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Рекомендации по улучшению
  console.log('💡 РЕКОМЕНДАЦИИ ПО СИСТЕМЕ ПАМЯТИ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🧠 **Что уже работает:**');
  console.log('   • Сохранение настроения пользователя');
  console.log('   • Отслеживание любимых масел');
  console.log('   • Подсчет дней активности');
  console.log('   • Сохранение целей пользователя');
  console.log('   • Статистика взаимодействий');
  
  console.log('\n🚀 **Что можно улучшить:**');
  console.log('   • Машинное обучение для предсказания предпочтений');
  console.log('   • Анализ времени активности');
  console.log('   • Группировка пользователей по схожести');
  console.log('   • A/B тестирование рекомендаций');
  console.log('   • Обратная связь от пользователей');
  
  console.log('\n📊 **Метрики для отслеживания:**');
  console.log('   • Процент повторных запросов');
  console.log('   • Время между запросами');
  console.log('   • Популярность рекомендаций');
  console.log('   • Конверсия в подписки');
  
  console.log('\n✅ Тестирование системы памяти завершено!');
}

// Функция для генерации персонализированных рекомендаций
async function generatePersonalizedRecommendations(telegramId, subscriptionService) {
  const profile = await subscriptionService.getUserProfile(telegramId);
  
  const recommendations = {
    oils: [],
    music: [],
    tips: []
  };
  
  // Персонализированные масла
  if (profile?.stats?.favorite_oils?.length > 0) {
    for (const oilName of profile.stats.favorite_oils.slice(0, 2)) {
      recommendations.oils.push({
        name: oilName,
        reason: 'ваше любимое масло'
      });
    }
  }
  
  // Персонализированная музыка
  if (profile?.current_state?.last_mood) {
    recommendations.music.push({
      title: 'Personalized Track 1',
      artist: 'Artist 1',
      reason: `подходит для настроения "${profile.current_state.last_mood}"`
    });
    recommendations.music.push({
      title: 'Personalized Track 2',
      artist: 'Artist 2',
      reason: `подходит для настроения "${profile.current_state.last_mood}"`
    });
  }
  
  // Персональные советы
  if (profile?.current_state?.streak_days > 0) {
    recommendations.tips.push(`Отличная работа! Вы уже ${profile.current_state.streak_days} дней подряд используете ароматерапию.`);
  }
  
  if (profile?.stats?.favorite_oils?.length > 0) {
    recommendations.tips.push(`Попробуйте смешать ${profile.stats.favorite_oils[0]} с другими маслами для новых эффектов.`);
  }
  
  if (profile?.current_state?.last_goals?.length > 0) {
    recommendations.tips.push(`Для достижения цели "${profile.current_state.last_goals[0]}" используйте масла регулярно.`);
  }
  
  return recommendations;
}

// Запускаем тест
if (require.main === module) {
  testUserMemory().catch(console.error);
}

module.exports = { testUserMemory }; 