const logger = require('../utils/logger');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');
const { findOilByName, findOilsByKeywords, getAllOils } = require('../data/full_oils_database');

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

      // Пытаемся найти масло в Supabase (таблица public.oils)
      if (this.supabase) {
        try {
          const search = normalizedOilName.replace(/[,]/g, ' ').trim();
          // 1) точное совпадение по названию (без wildcard)
          let { data, error } = await this.supabase
            .from('oils')
            .select('oil_name, description, keywords, emotional_effect, physical_effect, applications, safety_warning, joke')
            .ilike('oil_name', search)
            .limit(1)
            .maybeSingle();

          if (error) {
            logger.warn('Supabase search error (exact name):', error.message);
          }

          // 2) частичное совпадение по названию
          if (!data) {
            const res2 = await this.supabase
              .from('oils')
              .select('oil_name, description, keywords, emotional_effect, physical_effect, applications, safety_warning, joke')
              .ilike('oil_name', `%${search}%`)
              .limit(1)
              .maybeSingle();
            if (!res2.error) data = res2.data; else logger.warn('Supabase search error (name like):', res2.error.message);
          }

          // 3) частичное совпадение по keywords
          if (!data) {
            const res3 = await this.supabase
              .from('oils')
              .select('oil_name, description, keywords, emotional_effect, physical_effect, applications, safety_warning, joke')
              .ilike('keywords', `%${search}%`)
              .limit(1)
              .maybeSingle();
            if (!res3.error) data = res3.data; else logger.warn('Supabase search error (keywords like):', res3.error.message);
          }

          if (data) {
            oilData = {
              name: data.oil_name,
              description: data.description,
              emotional_effect: data.emotional_effect,
              physical_effect: data.physical_effect,
              applications: data.applications,
              safety_warning: data.safety_warning,
              joke: data.joke || 'Ароматерапия — это маленькая радость в капле! 😊',
              source: 'db'
            };
            logger.info('✅ Oil found in Supabase (oils):', data.oil_name);
          }

          // 4) HTTP REST fallback (на случай сетевых/клиентских нюансов supabase-js)
          if (!data) {
            try {
              const baseUrl = `${config.supabase.url}/rest/v1/oils`;
              const headers = {
                apikey: config.supabase.key,
                Authorization: `Bearer ${config.supabase.key}`
              };
              const select = 'oil_name,description,keywords,emotional_effect,physical_effect,applications,safety_warning,joke';

              // eq
              let resp = await axios.get(baseUrl, {
                headers,
                params: { select, oil_name: `eq.${search}` }
              });
              let rows = Array.isArray(resp.data) ? resp.data : [];

              // ilike name
              if (rows.length === 0) {
                resp = await axios.get(baseUrl, {
                  headers,
                  params: { select, oil_name: `ilike.*${search}*` }
                });
                rows = Array.isArray(resp.data) ? resp.data : [];
              }

              // ilike keywords
              if (rows.length === 0) {
                resp = await axios.get(baseUrl, {
                  headers,
                  params: { select, keywords: `ilike.*${search}*` }
                });
                rows = Array.isArray(resp.data) ? resp.data : [];
              }

              if (rows.length > 0) {
                const row = rows[0];
                oilData = {
                  name: row.oil_name,
                  description: row.description,
                  emotional_effect: row.emotional_effect,
                  physical_effect: row.physical_effect,
                  applications: row.applications,
                  safety_warning: row.safety_warning,
                  joke: row.joke || 'Ароматерапия — это маленькая радость в капле! 😊',
                  source: 'db'
                };
                logger.info('✅ Oil found via REST fallback:', row.oil_name);
              }
            } catch (httpErr) {
              logger.warn('Supabase REST fallback error:', httpErr?.response?.data || httpErr.message);
            }
          }
        } catch (dbError) {
          logger.error('Database search error (oils):', dbError);
        }
      }

      // Режим «только БД»: если не нашли в Supabase — честно сообщаем
      if (!oilData) {
        return {
          action: 'oil_found',
          chatId: chatId,
          message: '🤷 Масло не найдено в базе данных. Попробуйте другое название или добавьте синонимы в поле keywords.',
          keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ],
          oilData: { name: normalizedOilName, source: 'db_miss' }
        };
      }

      // Формируем сообщение
      let message = `🌿 **${oilData.name}**\n\n${oilData.description}\n\n🧠 **Эмоциональный эффект:**\n${oilData.emotional_effect}\n\n💪 **Физический эффект:**\n${oilData.physical_effect}\n\n🧴 **Применение:**\n${oilData.applications}\n\n⚠️ **Осторожно:**\n${oilData.safety_warning}\n\n😄 **Кстати:**\n${oilData.joke}`;
      if (oilData.source) {
        message += `\n\n🧩 Источник: ${oilData.source === 'db' ? 'БД' : 'локальная база'}`;
      }

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