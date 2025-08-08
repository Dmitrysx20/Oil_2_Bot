// Универсальная шина обработки сообщений
module.exports = async function handleUpdate(bot, msg, services) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const lower = text.toLowerCase();

  // 1) /start — быстрый ответ
  if (lower === '/start') {
    await bot.sendMessage(
      chatId,
      `👋 Привет, ${msg.from?.first_name || 'друг'}!
Я бот-ассистент по ароматерапии. Попробуй:
• "Лаванда"
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

  // 3) Масла — проверяем конкретные названия масел
  const oilKeywords = ['лаванда', 'мята', 'лимон', 'апельсин', 'розмарин', 'эвкалипт', 'чайное дерево', 'ромашка', 'бергамот', 'иланг-иланг'];
  const isOilRequest = oilKeywords.some(keyword => lower.includes(keyword));
  
  if (isOilRequest && services?.oilSearch) {
    try {
      const oilResp = await services.oilSearch.tryAnswer(text, chatId);
      if (oilResp?.ok) {
        await bot.sendMessage(chatId, oilResp.message, { parse_mode: 'Markdown' });
        return;
      }
    } catch (e) {
      console.error('OilSearch error:', e.message);
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
