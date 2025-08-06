/**
 * 🗄️ Oil Database - Модуль для работы с базой данных масел
 * 
 * Этот модуль предоставляет методы для поиска и обработки
 * информации об эфирных маслах из базы данных.
 */

class OilDatabase {
  constructor() {
    this.requiredFields = [
      'oil_name',
      'description', 
      'emotional_effect',
      'physical_effect',
      'applications',
      'safety_warning',
      'joke'
    ];

    this.popularOils = {
      citrus: ['Лимон', 'Дикий апельсин', 'Грейпфрут', 'Лайм', 'Бергамот'],
      relaxing: ['Лаванда', 'Ромашка', 'Иланг-иланг', 'Баланс', 'Виспер'],
      energizing: ['Мята перечная', 'Розмарин', 'Эвкалипт', 'Мотивейт', 'Чир'],
      healing: ['Чайное дерево', 'Ладан', 'Гелихризум', 'Мелалеука', 'Стронгер'],
      blends: ['ДайджестЗен', 'Изи Эйр', 'Дип Блу', 'Ситрус Блисс', 'АромаТач']
    };
  }

  /**
   * Обработка результатов поиска масла
   * @param {Array} supabaseResults - Результаты из Supabase
   * @param {Object} smartRouterData - Данные от Smart Router
   * @returns {Object} Обработанные данные масла или ошибка
   */
  processOilSearch(supabaseResults, smartRouterData) {
    console.log('🔍 Processing oil search results:', supabaseResults.length);

    // Проверка наличия результатов
    if (!Array.isArray(supabaseResults) || supabaseResults.length === 0) {
      console.log('❌ No results from Supabase');
      return this.createNotFoundResponse(smartRouterData);
    }

    // Берем первый результат (должен быть единственный благодаря фильтру)
    const foundOil = supabaseResults[0].json;
    console.log('✅ Found oil:', foundOil.oil_name);

    // Проверяем полноту данных
    const missingFields = this.checkRequiredFields(foundOil);
    if (missingFields.length > 0) {
      console.log('⚠️ Missing fields:', missingFields);
    }

    // Возвращаем найденное масло с метаданными
    return {
      // Все поля масла
      oil_name: foundOil.oil_name,
      description: foundOil.description,
      emotional_effect: foundOil.emotional_effect,
      physical_effect: foundOil.physical_effect,
      applications: foundOil.applications,
      safety_warning: foundOil.safety_warning,
      joke: foundOil.joke,
      keywords: foundOil.keywords,
      
      // Метаданные для дальнейшей обработки
      chatId: smartRouterData.chatId,
      searchType: 'direct',
      foundBy: 'native_supabase_filter',
      searchedFor: smartRouterData.normalizedOilName,
      originalQuery: smartRouterData.oilName,
      detectedCommand: smartRouterData.detectedCommand,
      
      // Отладочная информация
      debug: {
        foundOilName: foundOil.oil_name,
        totalResults: supabaseResults.length,
        hasAllFields: missingFields.length === 0,
        searchMethod: 'exact_match'
      }
    };
  }

  /**
   * Создание ответа "масло не найдено"
   * @param {Object} smartRouterData - Данные от Smart Router
   * @returns {Object} Ответ с предложениями
   */
  createNotFoundResponse(smartRouterData) {
    const originalQuery = smartRouterData.oilName || smartRouterData.originalText || '';
    const suggestions = this.generateSuggestions(originalQuery);

    return {
      error: "Масло не найдено",
      searchedName: smartRouterData.normalizedOilName || originalQuery,
      originalQuery: smartRouterData.oilName || originalQuery,
      chatId: smartRouterData.chatId,
      debug: {
        supabaseResults: 0,
        searchedFor: smartRouterData.normalizedOilName,
        detectedCommand: smartRouterData.detectedCommand
      },
      suggestions: suggestions
    };
  }

  /**
   * Проверка наличия обязательных полей
   * @param {Object} oilData - Данные масла
   * @returns {Array} Список отсутствующих полей
   */
  checkRequiredFields(oilData) {
    return this.requiredFields.filter(field => !oilData[field]);
  }

  /**
   * Генерация умных предложений на основе поискового запроса
   * @param {string} query - Поисковый запрос
   * @returns {Array} Список предложений
   */
  generateSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    
    // Определяем категорию по запросу
    if (/цитрус|апельсин|лимон|лайм|свеж/.test(lowerQuery)) {
      return this.popularOils.citrus.map(oil => `Попробуй: "${oil}"`);
    }
    
    if (/спокой|релакс|сон|расслаб|стресс/.test(lowerQuery)) {
      return this.popularOils.relaxing.map(oil => `Попробуй: "${oil}"`);
    }
    
    if (/энерг|бодр|актив|мотив|сил/.test(lowerQuery)) {
      return this.popularOils.energizing.map(oil => `Попробуй: "${oil}"`);
    }
    
    if (/лечен|здоров|болезн|простуд|лечит/.test(lowerQuery)) {
      return this.popularOils.healing.map(oil => `Попробуй: "${oil}"`);
    }
    
    if (/смесь|блен|комплекс/.test(lowerQuery)) {
      return this.popularOils.blends.map(oil => `Попробуй: "${oil}"`);
    }
    
    // Базовые предложения
    return [
      'Попробуй: "Лаванда" - для спокойствия',
      'Попробуй: "Мята перечная" - для энергии', 
      'Попробуй: "Лимон" - для настроения',
      'Или напиши: "расскажи про эвкалипт"',
      'Или просто: "нужна энергия"'
    ];
  }

  /**
   * Форматирование сообщения об ошибке поиска
   * @param {Object} errorData - Данные об ошибке
   * @returns {string} Отформатированное сообщение
   */
  formatNotFoundMessage(errorData) {
    const suggestions = errorData.suggestions || [];
    const searchedName = errorData.searchedName || 'неизвестное масло';
    
    let message = `🔍 Не нашел масло "${searchedName}".\n\n`;
    
    if (suggestions.length > 0) {
      message += `💡 Возможно, ты искал:\n`;
      suggestions.slice(0, 5).forEach(suggestion => {
        message += `• ${suggestion}\n`;
      });
      message += '\n';
    }
    
    message += `🎯 Как правильно искать:\n`;
    message += `• Просто название: "лаванда", "мята"\n`;
    message += `• С командой: "расскажи про эвкалипт"\n`;
    message += `• По эффекту: "нужна энергия", "хочу расслабиться"`;
    
    return message;
  }

  /**
   * Форматирование информации о масле
   * @param {Object} oilData - Данные масла
   * @returns {string} Отформатированное сообщение
   */
  formatOilInfo(oilData) {
    let message = `🌿 ${oilData.oil_name}\n${oilData.description}\n\n`;
    message += `🧠 Эмоциональный эффект:\n${oilData.emotional_effect}\n\n`;
    message += `💪 Физический эффект:\n${oilData.physical_effect}\n\n`;
    message += `🧴 Применение:\n${oilData.applications}\n\n`;
    message += `⚠️ Осторожно:\n${oilData.safety_warning}\n\n`;
    
    if (oilData.keywords) {
      message += `🏷️ Ключевые свойства: ${oilData.keywords}\n\n`;
    }
    
    message += `😄 Кстати:\n${oilData.joke}`;
    
    return message;
  }

  /**
   * Получение всех масел для AI агента
   * @param {Array} oilsData - Данные всех масел
   * @returns {Array} Обработанные данные для AI
   */
  prepareOilsForAI(oilsData) {
    if (!Array.isArray(oilsData) || oilsData.length === 0) {
      return [];
    }

    // Ограничиваем количество для экономии токенов
    return oilsData.slice(0, 20).map(oil => ({
      name: oil.json.oil_name,
      description: oil.json.description,
      applications: oil.json.applications,
      emotional_effect: oil.json.emotional_effect,
      physical_effect: oil.json.physical_effect,
      keywords: oil.json.keywords
    }));
  }

  /**
   * Поиск масел по категории
   * @param {string} category - Категория масел
   * @returns {Array} Список масел категории
   */
  getOilsByCategory(category) {
    return this.popularOils[category] || [];
  }

  /**
   * Получение случайного масла
   * @param {Array} oilsData - Данные всех масел
   * @returns {Object|null} Случайное масло
   */
  getRandomOil(oilsData) {
    if (!Array.isArray(oilsData) || oilsData.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * oilsData.length);
    return oilsData[randomIndex].json;
  }

  /**
   * Поиск масел по ключевым словам
   * @param {Array} oilsData - Данные всех масел
   * @param {Array} keywords - Ключевые слова
   * @returns {Array} Подходящие масла
   */
  searchOilsByKeywords(oilsData, keywords) {
    if (!Array.isArray(oilsData) || !Array.isArray(keywords)) {
      return [];
    }

    return oilsData.filter(oil => {
      const oilText = `${oil.json.oil_name} ${oil.json.description} ${oil.json.keywords || ''}`.toLowerCase();
      return keywords.some(keyword => oilText.includes(keyword.toLowerCase()));
    }).map(oil => oil.json);
  }
}

// Экспорт для использования в n8n
module.exports = OilDatabase; 