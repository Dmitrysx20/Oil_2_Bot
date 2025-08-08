// Универсальный обработчик входящих сообщений
module.exports = async function handleUpdate(bot, msg, services) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const lower = text.toLowerCase();

  // 1) /start — быстрый ответ (оставим как есть)
  if (lower === '/start') {
    await bot.sendMessage(chatId,
`👋 Привет, ${msg.from?.first_name || 'друг'}!
Я бот-ассистент по ароматерапии. Попробуй:
• "Лаванда"
• "Нужна энергия"
• "Хочу расслабиться"`);
    return;
  }

  // 2) OilSearchService (если есть)
  if (services?.oilSearch) {
    const oilResp = await services.oilSearch.tryAnswer(text, chatId).catch(() => null);
    if (oilResp?.ok) {
      await bot.sendMessage(chatId, oilResp.message, { parse_mode: 'Markdown' });
      return;
    }
  }

  // 3) AIService (если есть)
  if (services?.ai) {
    const aiResp = await services.ai.tryRecommend({ chatId, text }).catch(() => null);
    if (aiResp?.ok) {
      await bot.sendMessage(chatId, aiResp.message, { parse_mode: 'Markdown' });
      return;
    }
  }

  // 4) Фолбэк
  await bot.sendMessage(chatId, `🤔 Не понял: "${text}". Напиши /start.`);
};
