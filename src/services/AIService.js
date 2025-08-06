const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../../config');

class AIService {
  constructor() {
    this.perplexityConfig = config.perplexity;
    this.openaiConfig = config.openai;
  }

  async getBasicRecommendation(routingResult) {
    try {
      const { keywords, chatId, userQuery } = routingResult;
      
      logger.info('🤖 AI Basic recommendation for:', keywords);

      // Пытаемся использовать Perplexity для базовых рекомендаций
      if (this.perplexityConfig.apiKey && keywords?.length > 0) {
        const prompt = `Дай рекомендации по ароматерапии для ${keywords.join(', ')}. Включи конкретные масла, дозировки, способы применения и меры безопасности. Ответь на русском языке в формате Markdown.`;
        
        const perplexityResponse = await this.getPerplexityRecommendation(prompt);
        
        if (perplexityResponse) {
          return {
            action: 'ai_recommendation',
            chatId: chatId,
            message: perplexityResponse,
            keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ],
            aiData: {
              type: 'basic',
              keywords: keywords,
              tokensUsed: 150,
              source: 'perplexity'
            }
          };
        }
      }

      // Fallback к заглушке, если Perplexity недоступен
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

      // Пытаемся использовать Perplexity для медицинских рекомендаций
      if (this.perplexityConfig.apiKey) {
        const perplexityResponse = await this.getPerplexityRecommendation(
          `Дай рекомендации по ароматерапии для ${medicalInfo?.category || 'общего оздоровления'}. Включи конкретные масла, дозировки, способы применения и меры безопасности. Ответь на русском языке.`
        );
        
        if (perplexityResponse) {
          return {
            action: 'ai_medical_recommendation',
            chatId: chatId,
            message: perplexityResponse,
            keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ],
            aiData: {
              type: 'medical',
              category: medicalInfo?.category,
              searchUsed: true,
              tokensUsed: 200,
              source: 'perplexity'
            }
          };
        }
      }

      // Fallback к заглушке, если Perplexity недоступен
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

  async getPerplexityRecommendation(prompt) {
    try {
      if (!this.perplexityConfig.apiKey) {
        logger.warn('Perplexity API key not configured');
        return null;
      }

      logger.info('🔍 Using Perplexity API for recommendation');

      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: this.perplexityConfig.model,
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
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.perplexityConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const recommendation = response.data.choices[0].message.content;
      logger.info('✅ Perplexity recommendation received');

      return recommendation;

    } catch (error) {
      logger.error('❌ Perplexity API error:', error.response?.data || error.message);
      return null;
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