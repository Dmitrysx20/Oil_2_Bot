// Универсальная шина обработки сообщений
const SmartRouter = require('../services/SmartRouter');

module.exports = async function handleUpdate(bot, msg, services) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const lower = text.toLowerCase();

  // Инициализируем SmartRouter
  const smartRouter = new SmartRouter();

  // Обработка callback запросов (кнопки)
  if (msg.callback_query) {
    const callbackData = msg.callback_query.data;
    
    if (callbackData.startsWith('select_oil:')) {
      const selectedOil = callbackData.replace('select_oil:', '');
      try {
        const oilResp = await services.oilSearch.searchDirectOil({
          normalizedOilName: selectedOil.toLowerCase(),
          chatId: chatId
        });
        
        if (oilResp && oilResp.message) {
          await bot.sendMessage(
            chatId, 
            oilResp.message, 
            { 
              parse_mode: 'Markdown',
              reply_markup: oilResp.keyboard ? {
                inline_keyboard: oilResp.keyboard
              } : undefined
            }
          );
          
          // Отвечаем на callback
          await bot.answerCallbackQuery(msg.callback_query.id);
          return;
        }
      } catch (e) {
        console.error('OilSearch callback error:', e.message);
      }
    }
  }

  // 1) /start — быстрый ответ
  if (lower === '/start') {
    await bot.sendMessage(
      chatId,
      `👋 Привет, ${msg.from?.first_name || 'друг'}!
Я бот-ассистент по ароматерапии. Попробуй:
• "Лаванда"
• "Мята" (покажу варианты)
• "Нужна энергия"
• "Хочу расслабиться"`
    );
    return;
  }

  // 2) Проверяем, не является ли это вопросом о возможностях
  if (lower.includes('что ты можешь') || lower.includes('что умеешь') || lower.includes('помощь') || lower.includes('help')) {
    await bot.sendMessage(
      chatId,
      `🤖 **Что я умею:**

🌿 **Поиск масел** - расскажу о любом эфирном масле
• "Лаванда", "Мята", "Лимон", "Розмарин"

⚡ **Рекомендации по эффектам** - подберу масла под ваши потребности
• "Нужна энергия", "Хочу расслабиться", "Для сна"

🎵 **Музыкальные плейлисты** - подберу музыку под настроение
• "Музыка для сна", "Для медитации"

💡 **AI рекомендации** - дам персональные советы
• "Болит голова", "Стресс на работе"

🔔 **Уведомления** - настрою напоминания о новых маслах

**Попробуйте:** "Лаванда", "Нужна энергия", "Помощь"`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // 3) Масла — используем SmartRouter для умного поиска
  const oilResult = smartRouter.findOil(lower);
  
  if (oilResult.result || oilResult.isAmbiguous) {
    if (oilResult.isAmbiguous) {
      // Неоднозначный случай - показываем варианты
      const ambiguousResp = await services.oilSearch.handleAmbiguousOil({
        ambiguousKey: oilResult.key,
        options: oilResult.options,
        defaultChoice: oilResult.defaultChoice,
        originalQuery: text,
        chatId: chatId
      });
      
      await bot.sendMessage(
        chatId, 
        ambiguousResp.message, 
        { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: ambiguousResp.keyboard
          }
        }
      );
      return;
    } else {
      // Конкретное масло - показываем информацию
      try {
        const oilResp = await services.oilSearch.searchDirectOil({
          normalizedOilName: oilResult.result.toLowerCase(),
          chatId: chatId
        });
        
        if (oilResp && oilResp.message) {
          await bot.sendMessage(
            chatId, 
            oilResp.message, 
            { 
              parse_mode: 'Markdown',
              reply_markup: oilResp.keyboard ? {
                inline_keyboard: oilResp.keyboard
              } : undefined
            }
          );
          return;
        }
      } catch (e) {
        console.error('OilSearch error:', e.message);
      }
    }
  }

  // 4) AI — рекомендации по симптомам/запросам
  if (services?.ai) {
    try {
      const aiResp = await services.ai.tryRecommend({ chatId, text });
      if (aiResp?.ok) {
        await bot.sendMessage(chatId, aiResp.message, { parse_mode: 'Markdown' });
        return;
      }
    } catch (e) {
      console.error('AI error:', e.message);
    }
  }

  // 5) Фолбэк
  await bot.sendMessage(
    chatId, 
    `🤔 Не понял: "${text}". 

💡 **Попробуйте:**
• "Лаванда" - информация о масле
• "Нужна энергия" - масла для бодрости  
• "Что ты можешь" - мои возможности
• "Помощь" - справка

Или напишите /start для начала работы.`
  );
};
