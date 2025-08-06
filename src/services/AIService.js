const logger = require('../utils/logger');

class AIService {
  constructor() {
    // Заглушка для ИИ сервиса
  }

  async getBasicRecommendation(routingResult) {
    try {
      const { keywords, chatId, userQuery } = routingResult;
      
      logger.info('🤖 AI Basic recommendation for:', keywords);

      // Заглушка - возвращаем тестовый ответ
      const recommendations = {
        'энергия': '⚡ **Для энергии рекомендую:**\n\n🌿 **Мята перечная**\n💡 **Применение:**\n• **Основной способ:** 2-3 капли + базовое масло\n• **Частота:** 2-3 раза в день\n\n⚡ **Быстрый рецепт:**\n- Мята перечная: 2 капли\n- Базовое масло: 10 мл\n- **Применение:** Массаж висков и шеи\n\n⚠️ **Безопасность:**\n- Разбавлять базовым маслом\n- Тест на чувствительность',
        'спокойствие': '🧘 **Для спокойствия рекомендую:**\n\n🌿 **Лаванда**\n💡 **Применение:**\n• **Основной способ:** 3-4 капли в диффузор\n• **Частота:** 1-2 раза в день\n\n⚡ **Быстрый рецепт:**\n- Лаванда: 3 капли\n- Базовое масло: 15 мл\n- **Применение:** Массаж спины и плеч\n\n⚠️ **Безопасность:**\n- Не использовать при беременности\n- Тест на аллергию обязателен',
        'сон': '🌙 **Для сна рекомендую:**\n\n🌿 **Римская ромашка**\n💡 **Применение:**\n• **Основной способ:** 2-3 капли в аромалампу\n• **Частота:** За 30 минут до сна\n\n⚡ **Быстрый рецепт:**\n- Ромашка: 2 капли\n- Лаванда: 1 капля\n- Базовое масло: 10 мл\n- **Применение:** Массаж стоп\n\n⚠️ **Безопасность:**\n- Не превышать дозировку\n- Консультация с врачом при проблемах со сном'
      };

      const mainKeyword = keywords?.[0] || 'спокойствие';
      const recommendation = recommendations[mainKeyword] || recommendations['спокойствие'];

      return {
        action: 'ai_recommendation',
        chatId: chatId,
        message: recommendation,
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ],
        aiData: {
          type: 'basic',
          keywords: keywords,
          tokensUsed: 150
        }
      };

    } catch (error) {
      logger.error('AI Basic recommendation error:', error);
      return {
        action: 'ai_error',
        chatId: routingResult.chatId,
        message: 'Извините, не могу дать рекомендацию прямо сейчас. Попробуйте поискать конкретное масло по названию.',
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      };
    }
  }

  async getMedicalRecommendation(routingResult) {
    try {
      const { medicalInfo, chatId, userQuery } = routingResult;
      
      logger.info('🏥 AI Medical recommendation for:', medicalInfo);

      // Заглушка - возвращаем тестовый ответ
      const medicalRecommendations = {
        'головная_боль': '🏥 **Для головной боли рекомендую:**\n\n🌿 **Мята перечная**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Массаж:** 2 капли + 10 мл базового масла\n• **Ингаляция:** 1 капля, 5-10 минут\n• **Частота:** 2-3 раза в день\n\n🧴 **ГОТОВЫЙ РЕЦЕПТ:**\n- Мята перечная: 2 капли\n- Лаванда: 1 капля\n- Базовое масло: 10 мл\n- **Применение:** Массаж висков и затылка\n\n⚠️ **БЕЗОПАСНОСТЬ:**\n- Не наносить на слизистые\n- Тест на аллергию обязателен\n\n🏥 **ВАЖНО:** При сильных болях консультируйтесь с врачом.',
        'простуда': '🏥 **Для простуды рекомендую:**\n\n🌿 **Эвкалипт**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Ингаляция:** 2-3 капли, 10-15 минут\n• **Массаж груди:** 3 капли + 15 мл базового масла\n• **Частота:** 3-4 раза в день\n\n🧴 **ГОТОВЫЙ РЕЦЕПТ:**\n- Эвкалипт: 3 капли\n- Чайное дерево: 2 капли\n- Базовое масло: 15 мл\n- **Применение:** Массаж груди и спины\n\n⚠️ **БЕЗОПАСНОСТЬ:**\n- Не использовать при астме\n- Консультация с врачом обязательна\n\n🏥 **ВАЖНО:** При высокой температуре обратитесь к врачу.',
        'стресс': '🏥 **Для стресса рекомендую:**\n\n🌿 **Лаванда + Бергамот**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Ароматерапия:** 3-4 капли в диффузор\n• **Массаж:** 2 капли каждого + 20 мл базового масла\n• **Частота:** 2 раза в день\n\n🧴 **ГОТОВЫЙ РЕЦЕПТ:**\n- Лаванда: 2 капли\n- Бергамот: 2 капли\n- Базовое масло: 20 мл\n- **Применение:** Массаж плеч и спины\n\n⚠️ **БЕЗОПАСНОСТЬ:**\n- Бергамот фототоксичен\n- Избегать прямого солнца\n\n🏥 **ВАЖНО:** При хроническом стрессе обратитесь к специалисту.'
      };

      const category = medicalInfo?.category || 'стресс';
      const recommendation = medicalRecommendations[category] || medicalRecommendations['стресс'];

      return {
        action: 'ai_medical_recommendation',
        chatId: chatId,
        message: recommendation,
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ],
        aiData: {
          type: 'medical',
          category: medicalInfo?.category,
          searchUsed: true,
          tokensUsed: 200
        }
      };

    } catch (error) {
      logger.error('AI Medical recommendation error:', error);
      return {
        action: 'ai_error',
        chatId: routingResult.chatId,
        message: 'К сожалению, медицинские рекомендации временно недоступны. Обратитесь к специалисту или попробуйте позже.',
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      };
    }
  }
}

module.exports = AIService; 