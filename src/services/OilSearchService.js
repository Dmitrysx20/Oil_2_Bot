const logger = require('../utils/logger');

class OilSearchService {
  constructor() {
    // Заглушка для сервиса поиска масел
  }

  async searchDirectOil(routingResult) {
    try {
      const { normalizedOilName, oilName, chatId } = routingResult;
      
      logger.info('🌿 Searching for oil:', normalizedOilName);

      // Заглушка - возвращаем тестовый ответ
      const mockOilData = {
        oil_name: normalizedOilName || 'Лаванда',
        description: 'Универсальное эфирное масло с успокаивающими свойствами.',
        emotional_effect: 'Снимает стресс, успокаивает нервную систему, улучшает сон.',
        physical_effect: 'Обладает антисептическими и противовоспалительными свойствами.',
        applications: 'Ароматерапия, массаж, ингаляции, добавление в косметику.',
        safety_warning: 'Не использовать при беременности. Тест на аллергию обязателен.',
        joke: 'Лаванда - как лучший друг: всегда рядом и всегда помогает! 😊'
      };

      return {
        action: 'oil_found',
        chatId: chatId,
        message: `🌿 **${mockOilData.oil_name}**\n\n${mockOilData.description}\n\n🧠 **Эмоциональный эффект:**\n${mockOilData.emotional_effect}\n\n💪 **Физический эффект:**\n${mockOilData.physical_effect}\n\n🧴 **Применение:**\n${mockOilData.applications}\n\n⚠️ **Осторожно:**\n${mockOilData.safety_warning}\n\n😄 **Кстати:**\n${mockOilData.joke}`,
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ],
        oilData: mockOilData
      };

    } catch (error) {
      logger.error('Oil search error:', error);
      return {
        action: 'oil_search_error',
        chatId: routingResult.chatId,
        message: 'Произошла ошибка при поиске масла. Попробуйте позже.',
        error: error.message
      };
    }
  }

  async handleAmbiguousOil(routingResult) {
    const { ambiguousKey, options, defaultChoice, originalQuery, chatId } = routingResult;
    
    let message = `🤔 Нашел несколько вариантов для "${originalQuery}":\n\n`;
    message += `🌟 **Самый популярный: ${defaultChoice}**\n`;
    message += `(автоматически выберется через 10 секунд)\n\n`;
    message += `🎯 **Все варианты:**\n`;
    
    options.forEach(option => {
      const isDefault = option === defaultChoice;
      const emoji = isDefault ? '🌟' : '🌿';
      message += `${emoji} ${option}\n`;
    });
    
    message += `\n💡 **Выбери нужный вариант кнопками ниже**`;

    const keyboard = options.map(option => [{
      text: `${option === defaultChoice ? '🌟' : '🌿'} ${option}`,
      callback_data: `select_oil:${option}`
    }]);
    
    keyboard.push([{ text: '🏠 Главное меню', callback_data: 'main_menu' }]);

    return {
      action: 'disambiguation',
      chatId: chatId,
      message: message,
      keyboard: keyboard,
      ambiguousData: {
        key: ambiguousKey,
        options: options,
        defaultChoice: defaultChoice
      }
    };
  }
}

module.exports = OilSearchService; 