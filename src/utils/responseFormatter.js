const logger = require('./logger');

class ResponseFormatter {
  static formatOilResponse(oilData) {
    if (!oilData) {
      return {
        message: '❌ Масло не найдено',
        keyboard: [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]]
      };
    }

    let message = `🌿 **${oilData.oil_name}**\n\n`;
    
    if (oilData.description) {
      message += `${oilData.description}\n\n`;
    }
    
    if (oilData.emotional_effect) {
      message += `🧠 **Эмоциональный эффект:**\n${oilData.emotional_effect}\n\n`;
    }
    
    if (oilData.physical_effect) {
      message += `💪 **Физический эффект:**\n${oilData.physical_effect}\n\n`;
    }
    
    if (oilData.applications) {
      message += `🧴 **Применение:**\n${oilData.applications}\n\n`;
    }
    
    if (oilData.safety_warning) {
      message += `⚠️ **Осторожно:**\n${oilData.safety_warning}\n\n`;
    }
    
    if (oilData.joke) {
      message += `😄 **Кстати:**\n${oilData.joke}`;
    }

    const keyboard = [
      [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
    ];

    return { message, keyboard };
  }

  static formatAIResponse(aiData) {
    if (!aiData || !aiData.message) {
      return {
        message: '🤖 Извините, не могу дать рекомендацию прямо сейчас.',
        keyboard: [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]]
      };
    }

    const keyboard = [
      [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
    ];

    return { message: aiData.message, keyboard };
  }

  static formatMusicResponse(musicData) {
    if (!musicData || !musicData.track) {
      return {
        message: '🎵 Музыка не найдена. Попробуйте другой запрос.',
        keyboard: [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]]
      };
    }

    const { track, mood } = musicData;
    
    let message = `🎵 **Идеальное сочетание для вас!**\n\n`;
    message += `🎧 **"${track.title}"**\n`;
    message += `👨‍🎤 *${track.artist}*\n\n`;
    
    if (track.recommended_oils && track.recommended_oils.length > 0) {
      message += `🌿 **Рекомендуемые масла:**\n${track.recommended_oils.join(', ')}\n\n`;
    }
    
    message += `💡 **Как использовать:**\n`;
    message += `1. 🎵 Включите музыку\n`;
    message += `2. 💧 Добавьте 2-3 капли масла в диффузор\n`;
    message += `3. 🧘‍♀️ Наслаждайтесь гармонией\n\n`;
    message += `⭐ Идеально для настроения "${mood}"!`;

    const keyboard = [
      [
        { text: '🔄 Другой трек', callback_data: `music_${mood}_next` },
        { text: '❤️ Нравится', callback_data: `music_${track.id}_like` }
      ],
      [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
    ];

    return { message, keyboard };
  }

  static formatSubscriptionResponse(subscriptionData) {
    const { action, status } = subscriptionData;
    
    let message = '';
    let keyboard = [];

    switch (action) {
      case 'subscription_offer':
        message = `🔔 **Ежедневные советы по ароматерапии**\n\n`;
        message += `📢 **Что вы получите:**\n`;
        message += `🌅 **Утром (9:00):** Энергичные рекомендации\n`;
        message += `🌙 **Вечером (20:00):** Расслабляющие советы\n`;
        message += `🎵 **Персональные плейлисты** с маслами\n\n`;
        message += `💡 **Это бесплатно!**\n\n`;
        message += `📝 **Для подписки:** "да, подписаться"`;
        
        keyboard = [
          [{ text: '✅ Подписаться', callback_data: 'subscribe' }],
          [{ text: '❌ Не сейчас', callback_data: 'main_menu' }]
        ];
        break;

      case 'subscription_confirmed':
        message = `🎉 **Отлично! Вы подписались!**\n\n`;
        message += `✅ **Теперь вы будете получать:**\n`;
        message += `🌅 Утренние советы каждый день в 9:00\n`;
        message += `🌙 Вечерние рекомендации в 20:00\n`;
        message += `🎵 Персональные плейлисты\n\n`;
        message += `🌿 **Добро пожаловать в мир ароматерапии!**`;
        
        keyboard = [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]];
        break;

      case 'unsubscription_confirmed':
        message = `😔 **Подписка отключена**\n\n`;
        message += `Вы больше не будете получать уведомления.\n\n`;
        message += `🔄 **Вы всегда можете вернуться:**\n`;
        message += `Напишите "подписаться" в любое время`;
        
        keyboard = [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]];
        break;

      default:
        message = '🔔 Произошла ошибка с подпиской. Попробуйте позже.';
        keyboard = [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]];
    }

    return { message, keyboard };
  }

  static formatErrorResponse(error, chatId) {
    logger.error('Error response:', { error, chatId });

    const message = '❌ Произошла ошибка. Попробуйте позже или напишите /start';
    const keyboard = [[{ text: '🏠 Главное меню', callback_data: 'main_menu' }]];

    return { message, keyboard };
  }

  static formatMainMenu() {
    const message = `🏠 **Главное меню**\n\n`;
    message += `Выберите действие:`;

    const keyboard = [
      [
        { text: '⚡ ЭНЕРГИЯ', callback_data: 'need_energy' },
        { text: '🧘 РЕЛАКС', callback_data: 'want_relax' }
      ],
      [
        { text: '🏥 ЗДОРОВЬЕ', callback_data: 'health_issues' },
        { text: '🎵 МУЗЫКА', callback_data: 'music_menu' }
      ],
      [
        { text: '🔔 Подписка', callback_data: 'subscribe' },
        { text: '💡 ПОМОЩЬ', callback_data: 'help_menu' }
      ]
    ];

    return { message, keyboard };
  }

  static formatHelpMenu() {
    const message = `💡 **Как пользоваться ботом**\n\n`;
    message += `🌿 **Поиск масел:**\n`;
    message += `• Напиши название: "лаванда", "мята"\n`;
    message += `• С вопросом: "расскажи про лимон"\n\n`;
    message += `🎯 **Рекомендации:**\n`;
    message += `• По настроению: "стресс", "хочу энергии"\n`;
    message += `• По симптому: "болит голова"\n\n`;
    message += `🎵 **Музыка:**\n`;
    message += `• "музыка для расслабления"\n\n`;
    message += `🔔 **Подписка:**\n`;
    message += `• "подписаться" - ежедневные советы`;

    const keyboard = [
      [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
    ];

    return { message, keyboard };
  }

  static createInlineKeyboard(buttons) {
    return buttons.map(row => 
      row.map(button => ({
        text: button.text,
        callback_data: button.callback_data,
        url: button.url
      }))
    );
  }

  static truncateMessage(message, maxLength = 4096) {
    if (message.length <= maxLength) {
      return message;
    }
    
    const truncated = message.substring(0, maxLength - 3) + '...';
    logger.warn('Message truncated:', { originalLength: message.length, truncatedLength: truncated.length });
    
    return truncated;
  }
}

module.exports = ResponseFormatter; 