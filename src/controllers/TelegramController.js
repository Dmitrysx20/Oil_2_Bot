const logger = require('../utils/logger');
const responseFormatter = require('../utils/responseFormatter');

class TelegramController {
  constructor(services) {
    this.telegramService = services.telegramService;
    this.smartRouter = services.smartRouter;
    this.oilSearchService = services.oilSearchService;
    this.aiService = services.aiService;
    this.musicService = services.musicService;
    this.subscriptionService = services.subscriptionService;
    this.adminService = services.adminService;
  }

  async handleWebhook(req, res) {
    try {
      const update = req.body;
      
      // Логируем входящее обновление
      logger.info('📥 Webhook received:', {
        updateId: update.update_id,
        hasMessage: !!update.message,
        hasCallbackQuery: !!update.callback_query,
        chatId: update.message?.chat?.id || update.callback_query?.message?.chat?.id
      });

      // Проверяем валидность обновления
      if (!this.isValidUpdate(update)) {
        logger.warn('Invalid update format:', update);
        return res.status(200).json({ status: 'invalid_update' });
      }

      // Обрабатываем обновление
      const result = await this.processUpdate(update);
      
      // Отправляем ответ пользователю
      if (result && result.chatId) {
        await this.telegramService.sendResponse(result);
      }

      // Отвечаем на callback query если есть
      if (result && result.callbackQueryId) {
        await this.telegramService.answerCallbackQuery(result.callbackQueryId, '✅');
      }

      res.status(200).json({ status: 'ok' });

    } catch (error) {
      logger.error('Webhook processing error:', error);
      
      // Пытаемся отправить сообщение об ошибке пользователю
      try {
        const chatId = this.extractChatId(req.body);
        if (chatId) {
          await this.telegramService.sendMessage(
            chatId, 
            '😔 Произошла ошибка при обработке вашего запроса. Попробуйте позже.'
          );
        }
      } catch (sendError) {
        logger.error('Failed to send error message:', sendError);
      }

      res.status(200).json({ status: 'error', message: error.message });
    }
  }

  isValidUpdate(update) {
    return update && (
      update.message || 
      update.callback_query || 
      update.edited_message ||
      update.channel_post
    );
  }

  extractChatId(update) {
    return update?.message?.chat?.id || 
           update?.callback_query?.message?.chat?.id ||
           update?.edited_message?.chat?.id;
  }

  async processUpdate(update) {
    try {
      // Маршрутизируем сообщение через SmartRouter
      const routeResult = await this.smartRouter.routeMessage(update);
      
      logger.info('🛣️ Route result:', {
        requestType: routeResult.requestType,
        chatId: routeResult.chatId
      });

      // Обрабатываем в зависимости от типа запроса
      switch (routeResult.requestType) {
        case 'start_command':
          return await this.handleStartCommand(routeResult);

        case 'help_command':
          return await this.handleHelpCommand(routeResult);

        case 'direct_search':
          return await this.handleDirectSearch(routeResult);

        case 'keyword_search':
          return await this.handleKeywordSearch(routeResult);

        case 'disambiguation':
          return await this.handleDisambiguation(routeResult);

        case 'music_request':
          return await this.handleMusicRequest(routeResult);

        case 'music_save_preference':
          return await this.handleMusicSavePreference(routeResult);

        case 'help_request':
          return await this.handleHelpRequest(routeResult);

        case 'subscription_inquiry':
          return await this.handleSubscriptionInquiry(routeResult);

        case 'subscription_confirmation':
          return await this.handleSubscriptionConfirmation(routeResult);

        case 'subscription_management':
          return await this.handleSubscriptionManagement(routeResult);

        case 'admin_command':
          return await this.handleAdminCommand(routeResult);

        case 'admin_callback':
          return await this.handleAdminCallback(routeResult);

        case 'greeting':
          return await this.handleGreeting(routeResult);

        case 'unknown':
          return await this.handleUnknownRequest(routeResult);

        case 'empty_message':
          return await this.handleEmptyMessage(routeResult);

        default:
          logger.warn('Unknown request type:', routeResult.requestType);
          return await this.handleUnknownRequest(routeResult);
      }

    } catch (error) {
      logger.error('Process update error:', error);
      return {
        chatId: this.extractChatId(update),
        message: '😔 Произошла ошибка при обработке вашего запроса. Попробуйте позже.',
        keyboard: this.getMainMenuKeyboard()
      };
    }
  }

  async handleStartCommand(routeResult) {
    const { chatId, userName, isFirstTime } = routeResult;
    
    const welcomeMessage = isFirstTime 
      ? `👋 Привет, ${userName || 'друг'}! 

Я ваш персональный помощник по ароматерапии. Я помогу вам найти идеальное эфирное масло для любых целей.

🔍 **Что я умею:**
• Искать информацию о конкретных маслах
• Рекомендовать масла по симптомам и настроению
• Предлагать музыкальные плейлисты
• Настраивать уведомления о новых маслах

💡 **Попробуйте спросить:**
• "Лаванда" - информация о масле
• "Нужна энергия" - масла для бодрости
• "Хочу расслабиться" - масла для релакса
• "Музыка для сна" - плейлист для сна

Начните с любого вопроса! 🌿`
      : `🏠 **Главное меню**

Выберите, что вас интересует:`;

    return {
      chatId,
      message: welcomeMessage,
      keyboard: this.getMainMenuKeyboard()
    };
  }

  async handleHelpCommand(routeResult) {
    const { chatId } = routeResult;
    
    const helpMessage = `📚 **Справка по использованию бота**

🔍 **Поиск масел:**
• Название масла: "Лаванда", "Мята"
• По симптомам: "Головная боль", "Стресс"
• По настроению: "Нужна энергия", "Хочу расслабиться"

🎵 **Музыка:**
• "Музыка для сна"
• "Плейлист для релакса"
• "Энергичная музыка"

🔔 **Подписки:**
• "Подписаться на новые масла"
• "Настройки уведомлений"

⚙️ **Команды:**
• /start - главное меню
• /help - эта справка

💡 **Примеры запросов:**
• "Какое масло помогает от головной боли?"
• "Масла для концентрации"
• "Музыка для медитации"

Есть вопросы? Просто спросите! 😊`;

    return {
      chatId,
      message: helpMessage,
      keyboard: this.getMainMenuKeyboard()
    };
  }

  async handleHelpRequest(routeResult) {
    const { chatId, callbackQueryId } = routeResult;
    
    const helpMessage = `💡 **Как пользоваться ботом**

🌿 **Поиск масел:**
• Напиши название: "лаванда", "мята"
• С вопросом: "расскажи про лимон"
• По настроению: "стресс", "хочу энергии"

🎯 **Рекомендации:**
• По симптому: "болит голова"
• По цели: "концентрация", "сон"

🎵 **Музыка:**
• "музыка для расслабления"
• "плейлист для сна"

🔔 **Подписка:**
• "подписаться" - ежедневные советы

💡 **Примеры:**
• "Какое масло от головной боли?"
• "Масла для концентрации"
• "Музыка для медитации"`;

    return {
      chatId,
      message: helpMessage,
      keyboard: this.getMainMenuKeyboard(),
      callbackQueryId
    };
  }

  async handleDirectSearch(routeResult) {
    const { chatId, oilName, normalizedOilName, callbackQueryId } = routeResult;
    
    try {
      const oilInfo = await this.oilSearchService.searchDirectOil(routeResult);
      
      if (oilInfo && oilInfo.action === 'oil_found') {
        return {
          chatId,
          message: oilInfo.message,
          keyboard: { inline_keyboard: oilInfo.keyboard },
          callbackQueryId
        };
      } else {
        return {
          chatId,
          message: `🤔 Масло "${normalizedOilName}" не найдено в базе данных. Попробуйте другое название или опишите, что вы ищете.`,
          keyboard: this.getMainMenuKeyboard(),
          callbackQueryId
        };
      }
    } catch (error) {
      logger.error('Direct search error:', error);
      return {
        chatId,
        message: '😔 Ошибка при поиске масла. Попробуйте позже.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleKeywordSearch(routeResult) {
    const { chatId, keywords, userQuery, medicalInfo, callbackQueryId } = routeResult;
    
    try {
      let searchQuery = userQuery;
      let context = '';

      if (medicalInfo) {
        context = `Медицинский запрос: ${medicalInfo.category}`;
      }

      const aiResponse = await this.aiService.getBasicRecommendation(routeResult);

      if (aiResponse && aiResponse.message) {
        return {
          chatId,
          message: aiResponse.message,
          keyboard: { inline_keyboard: aiResponse.keyboard },
          callbackQueryId
        };
      } else {
        return {
          chatId,
          message: `🤔 К сожалению, не удалось найти подходящие масла для "${keywords.join(', ')}". Попробуйте переформулировать запрос.`,
          keyboard: this.getMainMenuKeyboard(),
          callbackQueryId
        };
      }
    } catch (error) {
      logger.error('Keyword search error:', error);
      return {
        chatId,
        message: '😔 Ошибка при поиске рекомендаций. Попробуйте позже.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleDisambiguation(routeResult) {
    const { chatId, originalQuery, options, callbackQueryId } = routeResult;
    
    const message = `🤔 Я нашел несколько вариантов для "${originalQuery}":\n\nВыберите нужное масло:`;
    
    const keyboard = options.map(option => [{
      text: option,
      callback_data: `select_oil:${option}`
    }]);

    return {
      chatId,
      message,
      keyboard: { inline_keyboard: keyboard },
      callbackQueryId
    };
  }

  async handleMusicRequest(routeResult) {
    const { chatId, musicKeyword, requestedMood, timeOfDay, callbackQueryId } = routeResult;
    
    try {
      const musicRecommendation = await this.musicService.getMusicRecommendation(
        requestedMood || musicKeyword,
        timeOfDay
      );

      if (musicRecommendation) {
        const formattedResponse = responseFormatter.formatMusicRecommendation(musicRecommendation);
        return {
          chatId,
          message: formattedResponse,
          keyboard: this.getMusicActionsKeyboard(musicRecommendation),
          callbackQueryId
        };
      } else {
        return {
          chatId,
          message: '🎵 К сожалению, не удалось найти подходящую музыку. Попробуйте позже.',
          keyboard: this.getMainMenuKeyboard(),
          callbackQueryId
        };
      }
    } catch (error) {
      logger.error('Music request error:', error);
      return {
        chatId,
        message: '😔 Ошибка при поиске музыки. Попробуйте позже.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleMusicSavePreference(routeResult) {
    const { chatId, mood, callbackQueryId } = routeResult;
    try {
      const result = await this.musicService.savePreferredMood(chatId, mood);
      return {
        chatId,
        message: result.saved ? `❤️ Сохранил предпочтение: ${mood}` : '⚠️ Не удалось сохранить предпочтение.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    } catch (error) {
      logger.error('Music save preference error:', error);
      return {
        chatId,
        message: '⚠️ Не удалось сохранить предпочтение.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleSubscriptionInquiry(routeResult) {
    const { chatId, userName, keyword, callbackQueryId } = routeResult;
    
    const message = `🔔 **Подписка на уведомления**

${userName || 'Дорогой пользователь'}, вы можете подписаться на уведомления о новых эфирных маслах и полезных статьях по ароматерапии.

📅 **Что вы получите:**
• Новые масла в базе данных
• Статьи о применении ароматерапии
• Сезонные рекомендации
• Специальные предложения

⏰ **Частота уведомлений:**
• 1-2 раза в неделю
• Только в удобное время

Хотите подписаться?`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Да, подписаться', callback_data: 'subscribe' },
          { text: '❌ Не сейчас', callback_data: 'unsubscribe' }
        ],
        [
          { text: '📋 Расскажи подробнее', callback_data: 'subscription_details' }
        ]
      ]
    };

    return {
      chatId,
      message,
      keyboard,
      callbackQueryId
    };
  }

  async handleSubscriptionConfirmation(routeResult) {
    const { chatId, userName, confirmationType, callbackQueryId } = routeResult;
    
    try {
      switch (confirmationType) {
        case 'confirm_subscribe':
          await this.subscriptionService.subscribeUser(chatId, userName);
          return {
            chatId,
            message: '✅ Вы успешно подписались на уведомления! Теперь вы будете получать информацию о новых маслах и полезные статьи по ароматерапии.',
            keyboard: this.getMainMenuKeyboard(),
            callbackQueryId
          };

        case 'confirm_unsubscribe':
          await this.subscriptionService.unsubscribeUser(chatId);
          return {
            chatId,
            message: '❌ Вы отписались от уведомлений. Если передумаете, просто напишите "подписаться".',
            keyboard: this.getMainMenuKeyboard(),
            callbackQueryId
          };

        case 'request_details':
          return {
            chatId,
            message: `📋 **Подробности о подписке**

🔔 **Что включено:**
• Новые эфирные масла в базе данных
• Статьи о применении ароматерапии
• Сезонные рекомендации
• Специальные предложения

⏰ **Расписание:**
• Понедельник и четверг в 10:00
• Только если есть новые материалы

⚙️ **Настройки:**
• Можно отписаться в любой момент
• Настройка времени уведомлений
• Фильтрация по интересам

Хотите подписаться?`,
            keyboard: {
              inline_keyboard: [
                [
                  { text: '✅ Подписаться', callback_data: 'subscribe' },
                  { text: '❌ Отмена', callback_data: 'main_menu' }
                ]
              ]
            },
            callbackQueryId
          };

        default:
          return {
            chatId,
            message: 'Понял! Если у вас есть другие вопросы, я готов помочь.',
            keyboard: this.getMainMenuKeyboard(),
            callbackQueryId
          };
      }
    } catch (error) {
      logger.error('Subscription confirmation error:', error);
      return {
        chatId,
        message: '😔 Ошибка при обработке подписки. Попробуйте позже.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleSubscriptionManagement(routeResult) {
    const { chatId, userName, subscriptionAction, callbackQueryId } = routeResult;
    
    try {
      if (subscriptionAction === 'subscribe') {
        await this.subscriptionService.subscribeUser(chatId, userName);
        return {
          chatId,
          message: '✅ Вы успешно подписались на уведомления!',
          keyboard: this.getMainMenuKeyboard(),
          callbackQueryId
        };
      } else if (subscriptionAction === 'unsubscribe') {
        await this.subscriptionService.unsubscribeUser(chatId);
        return {
          chatId,
          message: '❌ Вы отписались от уведомлений.',
          keyboard: this.getMainMenuKeyboard(),
          callbackQueryId
        };
      }
    } catch (error) {
      logger.error('Subscription management error:', error);
      return {
        chatId,
        message: '😔 Ошибка при управлении подпиской.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleAdminCommand(routeResult) {
    const { chatId, command } = routeResult;
    
    try {
      const adminResult = await this.adminService.handleCommand(command, chatId);
      return {
        chatId,
        message: adminResult.message,
        keyboard: adminResult.keyboard || this.getMainMenuKeyboard()
      };
    } catch (error) {
      logger.error('Admin command error:', error);
      return {
        chatId,
        message: '😔 Ошибка при выполнении административной команды.',
        keyboard: this.getMainMenuKeyboard()
      };
    }
  }

  async handleAdminCallback(routeResult) {
    const { chatId, adminAction, callbackQueryId } = routeResult;
    
    try {
      const adminResult = await this.adminService.handleCallback(adminAction, chatId);
      return {
        chatId,
        message: adminResult.message,
        keyboard: adminResult.keyboard || this.getMainMenuKeyboard(),
        callbackQueryId
      };
    } catch (error) {
      logger.error('Admin callback error:', error);
      return {
        chatId,
        message: '😔 Ошибка при выполнении административного действия.',
        keyboard: this.getMainMenuKeyboard(),
        callbackQueryId
      };
    }
  }

  async handleGreeting(routeResult) {
    const { chatId, greetingType } = routeResult;
    
    const greetings = {
      thanks: '🙏 Пожалуйста! Рад быть полезным. Есть еще вопросы по ароматерапии?',
      hello: '👋 Привет! Как дела? Чем могу помочь с эфирными маслами?',
      general: '👋 Здравствуйте! Готов помочь вам с выбором эфирных масел.'
    };

    return {
      chatId,
      message: greetings[greetingType] || greetings.general,
      keyboard: this.getMainMenuKeyboard()
    };
  }

  async handleUnknownRequest(routeResult) {
    const { chatId, originalText, callbackQueryId } = routeResult;
    
    const message = `🤔 Я не совсем понял ваш запрос: "${originalText}"

💡 **Попробуйте:**
• Название масла: "Лаванда", "Мята"
• Описание проблемы: "Головная боль", "Стресс"
• Настроение: "Нужна энергия", "Хочу расслабиться"
• Музыку: "Музыка для сна"

Или используйте команду /help для справки.`;

    return {
      chatId,
      message,
      keyboard: this.getMainMenuKeyboard(),
      callbackQueryId
    };
  }

  async handleEmptyMessage(routeResult) {
    const { chatId } = routeResult;
    
    return {
      chatId,
      message: '👋 Напишите что-нибудь, и я помогу вам с ароматерапией!',
      keyboard: this.getMainMenuKeyboard()
    };
  }

  // Вспомогательные методы для клавиатур
  getMainMenuKeyboard() {
    return {
      inline_keyboard: [
        [
          { text: '⚡ Нужна энергия', callback_data: 'need_energy' },
          { text: '😌 Хочу расслабиться', callback_data: 'want_relax' }
        ],
        [
          { text: '🔍 Поиск масла', callback_data: 'search_oil' },
          { text: '🎵 Музыка', callback_data: 'music_menu' }
        ],
        [
          { text: '🔔 Подписка', callback_data: 'subscription_menu' },
          { text: '❓ Помощь', callback_data: 'help_menu' }
        ]
      ]
    };
  }

  getOilActionsKeyboard(oilName) {
    return {
      inline_keyboard: [
        [
          { text: '🔍 Подробнее', callback_data: `oil_details:${oilName}` },
          { text: '🎵 Музыка для этого масла', callback_data: `oil_music:${oilName}` }
        ],
        [
          { text: '🏠 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  getRecommendationsKeyboard(recommendations) {
    const buttons = recommendations.slice(0, 3).map(oil => ({
      text: oil.name,
      callback_data: `select_oil:${oil.name}`
    }));

    return {
      inline_keyboard: [
        buttons,
        [
          { text: '🏠 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
  }

  getMusicActionsKeyboard(musicRecommendation) {
    return {
      inline_keyboard: [
        [
          { text: '🎵 Открыть плейлист', url: musicRecommendation.url },
          { text: '📱 Поделиться', callback_data: 'share_music' }
        ],
        [
          { text: '🏠 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
  }
}

module.exports = TelegramController; 