const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const { findOilByName, findOilsByKeywords, getAllOils } = require('../data/oils_database');

class OilSearchService {
  constructor() {
    this.supabase = null;
    this.initSupabase();
  }

  initSupabase() {
    try {
      if (config.supabase.url && config.supabase.key) {
        this.supabase = createClient(config.supabase.url, config.supabase.key);
        logger.info('✅ Supabase client initialized');
      } else {
        logger.warn('⚠️ Supabase credentials not found, using mock data');
      }
    } catch (error) {
      logger.error('❌ Failed to initialize Supabase:', error);
    }
  }

  async searchDirectOil(routingResult) {
    try {
      const { normalizedOilName, oilName, chatId } = routingResult;
      
      logger.info('🌿 Searching for oil:', normalizedOilName);

      let oilData = null;

      // Пытаемся найти масло в Supabase
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('essential_oils')
            .select('*')
            .ilike('name', `%${normalizedOilName}%`)
            .limit(1)
            .single();

          if (error) {
            logger.warn('Supabase search error:', error);
          } else if (data) {
            oilData = data;
            logger.info('✅ Oil found in Supabase:', data.name);
          }
        } catch (dbError) {
          logger.error('Database search error:', dbError);
        }
      }

      // Если не найдено в Supabase, ищем в локальной базе данных
      if (!oilData) {
        logger.info('Searching in local database for oil:', normalizedOilName);
        const localOil = findOilByName(normalizedOilName);
        
        if (localOil) {
          oilData = {
            name: localOil.oil_name,
            description: localOil.description,
            emotional_effect: localOil.emotional_effect,
            physical_effect: localOil.physical_effect,
            applications: localOil.applications,
            safety_warning: localOil.safety_warning,
            joke: localOil.joke
          };
          logger.info('✅ Oil found in local database:', localOil.oil_name);
        } else {
          // Fallback к заглушке, если масло не найдено
          logger.info('Oil not found, using fallback data for:', normalizedOilName);
          oilData = {
            name: normalizedOilName || 'Лаванда',
            description: 'Универсальное эфирное масло с успокаивающими свойствами.',
            emotional_effect: 'Снимает стресс, успокаивает нервную систему, улучшает сон.',
            physical_effect: 'Обладает антисептическими и противовоспалительными свойствами.',
            applications: 'Ароматерапия, массаж, ингаляции, добавление в косметику.',
            safety_warning: 'Не использовать при беременности. Тест на аллергию обязателен.',
            joke: 'Лаванда - как лучший друг: всегда рядом и всегда помогает! 😊'
          };
        }
      }

      // Формируем сообщение
      const message = `🌿 **${oilData.name}**\n\n${oilData.description}\n\n🧠 **Эмоциональный эффект:**\n${oilData.emotional_effect}\n\n💪 **Физический эффект:**\n${oilData.physical_effect}\n\n🧴 **Применение:**\n${oilData.applications}\n\n⚠️ **Осторожно:**\n${oilData.safety_warning}\n\n😄 **Кстати:**\n${oilData.joke}`;

      return {
        action: 'oil_found',
        chatId: chatId,
        message: message,
        keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ],
        oilData: oilData
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