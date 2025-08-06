const MusicService = require('../src/services/MusicService');
const logger = require('../src/utils/logger');

async function testMusicService() {
  try {
    logger.info('🎵 Starting music service test...');

    const musicService = new MusicService();

    // Тестируем доступные настроения
    const availableMoods = musicService.getAvailableMoods();
    logger.info('📋 Available moods:', availableMoods);

    // Тестируем каждое настроение
    for (const mood of availableMoods) {
      logger.info(`\n🎵 Testing mood: ${mood}`);
      
      const description = musicService.getMoodDescription(mood);
      logger.info(`📝 Description: ${description}`);

      // Тестируем поиск музыки
      const result = await musicService.findMusicByMood({
        requestedMood: mood,
        chatId: 123456789
      });

      logger.info(`✅ Result action: ${result.action}`);
      logger.info(`📱 Message preview: ${result.message.substring(0, 100)}...`);
      
      if (result.data) {
        logger.info(`🎧 Tracks found: ${result.data.tracks.length}`);
        logger.info(`🌿 Oils recommended: ${result.data.recommendedOils.length}`);
      }

      // Небольшая задержка между тестами
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Тестируем несуществующее настроение
    logger.info('\n🎵 Testing non-existent mood...');
    const invalidResult = await musicService.findMusicByMood({
      requestedMood: 'несуществующее',
      chatId: 123456789
    });
    logger.info(`❌ Invalid mood result: ${invalidResult.action}`);

    // Тестируем рекомендации по времени дня
    logger.info('\n🎵 Testing time-based recommendations...');
    const morningRec = await musicService.getMusicRecommendation(null, 'morning');
    const eveningRec = await musicService.getMusicRecommendation(null, 'evening');
    const nightRec = await musicService.getMusicRecommendation(null, 'night');

    logger.info(`🌅 Morning recommendation: ${morningRec?.mood}`);
    logger.info(`🌙 Evening recommendation: ${eveningRec?.mood}`);
    logger.info(`🌃 Night recommendation: ${nightRec?.mood}`);

    // Тестируем клавиатуру
    logger.info('\n🎵 Testing music keyboard...');
    const testTracks = [
      { title: 'Test Track 1', artist: 'Test Artist 1', genre: 'test', duration: '3:00' },
      { title: 'Test Track 2', artist: 'Test Artist 2', genre: 'test', duration: '4:00' }
    ];
    const keyboard = musicService.getMusicKeyboard('тестовое', testTracks);
    logger.info(`⌨️ Keyboard buttons: ${keyboard.length} rows`);

    logger.info('\n✅ Music service test completed successfully!');

  } catch (error) {
    logger.error('❌ Music service test failed:', error);
  }
}

// Запускаем тест
testMusicService(); 