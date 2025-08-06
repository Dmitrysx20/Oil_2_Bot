const logger = require('../utils/logger');

class SubscriptionService {
  constructor() {
    // Заглушка для сервиса подписок
  }

  async handleInquiry(routingResult) {
    try {
      const { chatId, userName, keyword, originalText } = routingResult;
      
      logger.info('🔔 Subscription inquiry:', { chatId, keyword });

      // Анализируем намерение пользователя
      const intent = this.analyzeSubscriptionIntent(originalText, keyword);
      
      switch(intent) {
        case 'subscribe':
          return this.generateSubscriptionOffer(chatId, userName);
          
        case 'unsubscribe':
          return this.generateUnsubscribeConfirmation(chatId, userName);
          
        case 'settings':
          return this.generateSettingsMenu(chatId);
          
        case 'info_request':
          return this.generateSubscriptionInfo(chatId);
          
        default:
          return this.generateSubscriptionOffer(chatId, userName);
      }

    } catch (error) {
      logger.error('Subscription inquiry error:', error);
      return this.getSubscriptionErrorResponse(routingResult.chatId);
    }
  }

  async handleConfirmation(routingResult) {
    try {
      const { chatId, userName, confirmationType } = routingResult;
      
      logger.info('✅ Subscription confirmation:', { chatId, type: confirmationType });

      switch(confirmationType) {
        case 'confirm_subscribe':
          return await this.processSubscription(chatId, userName);
          
        case 'confirm_unsubscribe':
          return await this.processUnsubscription(chatId, userName);
          
        case 'request_details':
          return this.generateDetailedInfo(chatId);
          
        case 'time_settings':
          return this.generateTimeSettings(chatId);
          
        case 'cancel_action':
          return this.generateCancelResponse(chatId, userName);
          
        default:
          return this.generateUnknownConfirmation(chatId, confirmationType);
      }

    } catch (error) {
      logger.error('Subscription confirmation error:', error);
      return this.getSubscriptionErrorResponse(routingResult.chatId);
    }
  }

  analyzeSubscriptionIntent(text, keyword) {
    const normalized = text.toLowerCase();
    
    if (keyword.includes('подпис') && !keyword.includes('отпис')) {
      return 'subscribe';
    } else if (keyword.includes('отпис') || keyword.includes('отключ')) {
      return 'unsubscribe';
    } else if (keyword.includes('настройк') || keyword.includes('время')) {
      return 'settings';
    } else if (keyword.includes('получать') || keyword.includes('уведомлен')) {
      return 'info_request';
    }
    
    return 'subscribe';
  }

  generateSubscriptionOffer(chatId, userName) {
    const message = `🔔 **Ежедневные советы по ароматерапии**

📢 **Что вы получите:**
🌅 **Утром (9:00):** Энергичные рекомендации для отличного дня
🌙 **Вечером (20:00):** Расслабляющие советы и музыка  
🎵 **Персональные плейлисты** с подходящими эфирными маслами
📚 **Эксклюзивные материалы** и исследования

⚡ **Особенности:**
- Персонализация под ваше настроение
- Интеграция с музыкальными платформами
- Программа "21 день с маслами"  
- Отписка в любой момент

💡 **Это бесплатно!**

📝 **Для подписки напишите:** "да, подписаться"
📝 **Узнать подробнее:** "расскажи подробнее"
📝 **Настроить время:** "настройки времени"
📝 **Отмена:** "не сейчас"`;

    return {
      action: 'subscription_offer',
      chatId: chatId,
      message: message,
      subscriptionData: {
        intent: 'subscribe',
        nextSteps: ['да, подписаться', 'расскажи подробнее', 'настройки времени', 'не сейчас']
      }
    };
  }

  async processSubscription(chatId, userName) {
    try {
      logger.info('✅ User subscribed:', chatId);

      const message = `🎉 **Отлично, ${userName}! Вы подписались!**

✅ **Теперь вы будете получать:**
🌅 **Утренние советы** каждый день в 9:00 МСК
🌙 **Вечерние рекомендации** каждый день в 20:00 МСК
🎵 **Персональные плейлисты** с эфирными маслами

🚀 **Что дальше?**
- Завтра утром получите первый совет
- Напишите "музыка на сегодня" для пробного плейлиста
- Используйте "настройки" для изменения времени

💡 **Полезные команды:**
📝 "статус подписки" - проверить настройки
📝 "отписаться" - отключить уведомления  
📝 "настройки" - изменить время и предпочтения

🌿 **Добро пожаловать в мир ароматерапии!**`;

      return {
        action: 'subscription_confirmed',
        chatId: chatId,
        message: message,
        subscriptionData: {
          status: 'active',
          subscribedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Subscription process error:', error);
      throw error;
    }
  }

  async processUnsubscription(chatId, userName) {
    try {
      logger.info('❌ User unsubscribed:', chatId);

      const message = `😔 **Подписка отключена**

Вы больше не будете получать ежедневные уведомления.

💙 **Мы будем скучать, ${userName}!** 

🔄 **Вы всегда можете вернуться:**
📝 Напишите "подписаться" в любое время

🌿 **Я всё ещё могу помочь с маслами!**
- Просто спросите про любое масло
- Опишите своё настроение  
- Запросите музыкальные рекомендации

Удачи вам! 🍀`;

      return {
        action: 'unsubscription_confirmed',
        chatId: chatId,
        message: message,
        subscriptionData: {
          status: 'unsubscribed',
          unsubscribedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Unsubscription process error:', error);
      throw error;
    }
  }

  generateTimeSettings(chatId) {
    const message = `⏰ **Настройка времени уведомлений**

🕘 **Текущие настройки:**
🌅 Утренние уведомления: 9:00 МСК
🌙 Вечерние уведомления: 20:00 МСК
🌍 Часовой пояс: Europe/Moscow

🎛️ **Что хотите изменить?**

📝 **Утреннее время:** "утром в 8:00" или "утром в 10:30"
📝 **Вечернее время:** "вечером в 19:00" или "вечером в 21:00"  
📝 **Часовой пояс:** "часовой пояс Екатеринбург"
📝 **Только утром:** "убрать вечерние"
📝 **Только вечером:** "убрать утренние"
📝 **Отложить настройку:** "пока не надо"

💡 **Примеры:**
- "утром в 7:30" - установит утренние уведомления на 7:30
- "вечером в 22:00" - установит вечерние на 22:00
- "убрать утренние" - оставит только вечерние уведомления`;

    return {
      action: 'time_settings_request',
      chatId: chatId,
      message: message,
      subscriptionData: {
        currentSettings: {
          morning_time: '09:00',
          evening_time: '20:00',
          timezone: 'Europe/Moscow'
        },
        settingsMode: 'time_adjustment'
      }
    };
  }

  generateDetailedInfo(chatId) {
    const message = `📚 **Подробная информация о подписке**

🌿 **Что включено в подписку:**

🌅 **Утренние советы (9:00 МСК):**
• Энергичные масла для продуктивного дня
• Рецепты для концентрации и мотивации
• Музыкальные плейлисты для бодрости

🌙 **Вечерние рекомендации (20:00 МСК):**
• Расслабляющие масла для отдыха
• Рецепты для спокойного сна
• Медитативная музыка

🎵 **Персональные плейлисты:**
• Интеграция с Spotify, YouTube Music
• Подборка под ваше настроение
• Рекомендации масел для каждого трека

📚 **Эксклюзивные материалы:**
• Программа "21 день с маслами"
• Гайды по ароматерапии
• Новейшие исследования

⚙️ **Настройки:**
• Выбор времени уведомлений
• Настройка часового пояса
• Выбор типов контента

💡 **Это полностью бесплатно!**`;

    return {
      action: 'detailed_info',
      chatId: chatId,
      message: message,
      keyboard: [
        [{ text: '✅ Подписаться', callback_data: 'subscribe' }],
        [{ text: '⏰ Настройки времени', callback_data: 'time_settings' }],
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
      ]
    };
  }

  generateCancelResponse(chatId, userName) {
    const message = `😊 **Хорошо, ${userName}!**

Подписка не активирована. Вы всегда можете подписаться позже.

🌿 **Я всё ещё готов помочь с ароматерапией:**
• Спросите про любое масло
• Опишите своё настроение
• Запросите музыкальные рекомендации

Просто напишите "подписаться" когда будете готовы! 💚`;

    return {
      action: 'subscription_cancelled',
      chatId: chatId,
      message: message,
      keyboard: [
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
      ]
    };
  }

  generateUnknownConfirmation(chatId, confirmationType) {
    const message = `🤔 **Не понял ваш выбор**

Попробуйте один из вариантов:
• "да, подписаться" - активировать подписку
• "расскажи подробнее" - узнать больше
• "настройки времени" - изменить время
• "не сейчас" - отложить`;

    return {
      action: 'unknown_confirmation',
      chatId: chatId,
      message: message,
      keyboard: [
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
      ]
    };
  }

  getSubscriptionErrorResponse(chatId) {
    return {
      action: 'subscription_error',
      chatId: chatId,
      message: '🔔 Произошла ошибка с подпиской. Попробуйте позже.',
      keyboard: [
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
      ]
    };
  }
}

module.exports = SubscriptionService; 