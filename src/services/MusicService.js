const logger = require('../utils/logger');

class MusicService {
  constructor() {
    // Заглушка для музыкального сервиса
  }

  async findMusicByMood(routingResult) {
    try {
      const { requestedMood, chatId } = routingResult;
      
      logger.info('🎵 Music search:', { mood: requestedMood });

      // Заглушка - возвращаем тестовый ответ
      return {
        action: 'music_recommendation',
        chatId: chatId,
        message: `🎵 **Музыка для настроения "${requestedMood}"**\n\nПока музыкальный сервис в разработке. Скоро здесь будут персональные плейлисты!`,
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      };

    } catch (error) {
      logger.error('Music service error:', error);
      return {
        action: 'music_error',
        chatId: routingResult.chatId,
        message: '🎵 Произошла ошибка при поиске музыки. Попробуйте позже.',
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      };
    }
  }
}

module.exports = MusicService; 