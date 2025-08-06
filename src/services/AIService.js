const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../../config');

class AIService {
  constructor() {
    this.openaiConfig = config.openai;
  }

  async getBasicRecommendation(routingResult) {
    try {
      const { keywords, chatId, userQuery } = routingResult;
      
      logger.info('🤖 AI Basic recommendation for:', keywords);

      // Пытаемся использовать OpenAI для базовых рекомендаций
      if (this.openaiConfig.apiKey && keywords?.length > 0) {
        const prompt = `Дай рекомендации по ароматерапии для ${keywords.join(', ')}. Включи конкретные масла, дозировки, способы применения и меры безопасности. Ответь на русском языке в формате Markdown.`;
        
        const openaiResponse = await this.getOpenAIRecommendation(prompt);
        
        if (openaiResponse) {
          return {
            action: 'ai_recommendation',
            chatId: chatId,
            message: openaiResponse,
            keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ],
            aiData: {
              type: 'basic',
              keywords: keywords,
              tokensUsed: 150,
              source: 'openai'
            }
          };
        }
      }

      // Fallback к заглушке, если OpenAI недоступен
      const recommendations = {
        'энергия': '⚡ **Для энергии рекомендую:**\n\n🌿 **Мята перечная**\n💡 **Применение:**\n• **Основной способ:** 2-3 капли + базовое масло\n• **Частота:** 2-3 раза в день\n\n⚡ **Быстрый рецепт:**\n- Мята перечная: 2 капли\n- Базовое масло: 10 мл\n- **Применение:** Массаж висков и шеи\n\n⚠️ **Безопасность:**\n- Разбавлять базовым маслом\n- Тест на чувствительность',
        'спокойствие': '🧘 **Для спокойствия рекомендую:**\n\n🌿 **Лаванда**\n💡 **Применение:**\n• **Основной способ:** 3-4 капли в диффузор\n• **Частота:** 1-2 раза в день\n\n⚡ **Быстрый рецепт:**\n- Лаванда: 3 капли\n- Базовое масло: 15 мл\n- **Применение:** Массаж спины и плеч\n\n⚠️ **Безопасность:**\n- Не использовать при беременности\n- Тест на аллергию обязателен',
        'сон': '🌙 **Для сна рекомендую:**\n\n🌿 **Римская ромашка**\n💡 **Применение:**\n• **Основной способ:** 2-3 капли в аромалампу\n• **Частота:** За 30 минут до сна\n\n⚡ **Быстрый рецепт:**\n- Ромашка: 2 капли\n- Лаванда: 1 капля\n- Базовое масло: 10 мл\n- **Применение:** Массаж стоп\n\n⚠️ **Безопасность:**\n- Не превышать дозировку\n- Консультация с врачом при проблемах со сном',
        'успокоить': '💕 **Для успокоения мужа рекомендую:**\n\n🌿 **Лаванда + Иланг-иланг**\n💡 **Применение:**\n• **Аромалампа:** 2 капли лаванды + 1 капля иланг-иланга\n• **Массаж:** 3 капли смеси + 20 мл базового масла\n• **Ванна:** 4-5 капель смеси + соль для ванны\n\n⚡ **Быстрый рецепт для массажа плеч:**\n- Лаванда: 2 капли\n- Иланг-иланг: 1 капля\n- Базовое масло: 15 мл\n- **Применение:** Массаж плеч и шеи\n\n💡 **Дополнительные советы:**\n- Создайте спокойную атмосферу\n- Включите расслабляющую музыку\n- Предложите теплый чай\n\n⚠️ **Безопасность:**\n- Тест на аллергию обязателен\n- Не использовать при беременности\n- Избегать попадания в глаза',
        'муж': '💕 **Для успокоения мужа рекомендую:**\n\n🌿 **Лаванда + Иланг-иланг**\n💡 **Применение:**\n• **Аромалампа:** 2 капли лаванды + 1 капля иланг-иланга\n• **Массаж:** 3 капли смеси + 20 мл базового масла\n• **Ванна:** 4-5 капель смеси + соль для ванны\n\n⚡ **Быстрый рецепт для массажа плеч:**\n- Лаванда: 2 капли\n- Иланг-иланг: 1 капля\n- Базовое масло: 15 мл\n- **Применение:** Массаж плеч и шеи\n\n💡 **Дополнительные советы:**\n- Создайте спокойную атмосферу\n- Включите расслабляющую музыку\n- Предложите теплый чай\n\n⚠️ **Безопасность:**\n- Тест на аллергию обязателен\n- Не использовать при беременности\n- Избегать попадания в глаза',
        'отношения': '💕 **Для гармонии в отношениях рекомендую:**\n\n🌿 **Роза + Пачули**\n💡 **Применение:**\n• **Аромалампа:** 2 капли розы + 1 капля пачули\n• **Массаж:** 3 капли смеси + 20 мл базового масла\n• **Диффузор:** 3-4 капли смеси\n\n⚡ **Романтический рецепт:**\n- Роза: 2 капли\n- Пачули: 1 капля\n- Базовое масло: 20 мл\n- **Применение:** Массаж рук и плеч\n\n💡 **Дополнительные советы:**\n- Создайте романтическую атмосферу\n- Включите любимую музыку\n- Приготовьте ужин при свечах\n\n⚠️ **Безопасность:**\n- Тест на аллергию обязателен\n- Не использовать при беременности\n- Избегать попадания в глаза'
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
          tokensUsed: 150,
          source: 'fallback'
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

      // Пытаемся использовать OpenAI для медицинских рекомендаций
      if (this.openaiConfig.apiKey) {
        const openaiResponse = await this.getOpenAIRecommendation(
          `Дай рекомендации по ароматерапии для ${medicalInfo?.category || 'общего оздоровления'}. Включи конкретные масла, дозировки, способы применения и меры безопасности. Ответь на русском языке.`
        );
        
        if (openaiResponse) {
          return {
            action: 'ai_medical_recommendation',
            chatId: chatId,
            message: openaiResponse,
            keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ],
            aiData: {
              type: 'medical',
              category: medicalInfo?.category,
              tokensUsed: 200,
              source: 'openai'
            }
          };
        }
      }

      // Fallback к заглушке, если OpenAI недоступен
      const medicalRecommendations = {
        'головная_боль': '🏥 **Для головной боли рекомендую:**\n\n🌿 **Мята перечная**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Массаж:** 2 капли + 10 мл базового масла\n• **Компресс:** 1 капля на холодный компресс\n• **Ингаляция:** 1-2 капли в горячую воду\n\n⚠️ **Безопасность:**\n- Не наносить на слизистые\n- При сильной боли обратиться к врачу\n- Не использовать при беременности',
        'стресс': '🧘 **Для снятия стресса рекомендую:**\n\n🌿 **Лаванда + Бергамот**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Аромалампа:** 2 капли лаванды + 1 капля бергамота\n• **Массаж:** 3 капли смеси + 15 мл базового масла\n• **Ванна:** 5 капель смеси + соль для ванны\n\n⚠️ **Безопасность:**\n- Бергамот фототоксичен\n- Избегать прямого солнца\n- Тест на аллергию обязателен',
        'простуда': '🤧 **При простуде рекомендую:**\n\n🌿 **Эвкалипт + Чайное дерево**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Ингаляция:** 2 капли эвкалипта + 1 капля чайного дерева\n• **Растирание груди:** 3 капли смеси + 10 мл базового масла\n• **Аромалампа:** 3-4 капли смеси\n\n⚠️ **Безопасность:**\n- Не использовать при астме\n- Консультация с врачом при температуре\n- Не превышать дозировку',
        'бессонница': '🌙 **При бессоннице рекомендую:**\n\n🌿 **Римская ромашка + Лаванда**\n💡 **КАК ПРИМЕНЯТЬ:**\n• **Аромалампа:** 2 капли ромашки + 2 капли лаванды\n• **Массаж стоп:** 3 капли смеси + 15 мл базового масла\n• **Подушка:** 1 капля лаванды на подушку\n\n⚠️ **Безопасность:**\n- Не превышать дозировку\n- Консультация с врачом при хронической бессоннице\n- Тест на аллергию обязателен'
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
          tokensUsed: 200,
          source: 'fallback'
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

  async getOpenAIRecommendation(prompt) {
    try {
      if (!this.openaiConfig.apiKey) {
        logger.warn('OpenAI API key not configured');
        return null;
      }

      logger.info('🤖 Using OpenAI API for recommendation');

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: this.openaiConfig.model,
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по ароматерапии и эфирным маслам. Давай точные, безопасные и практичные рекомендации. Всегда включай дозировки, способы применения и меры безопасности.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.openaiConfig.maxTokens,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const recommendation = response.data.choices[0].message.content;
      logger.info('✅ OpenAI recommendation received');

      return recommendation;

    } catch (error) {
      logger.error('❌ OpenAI API error:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = AIService; 