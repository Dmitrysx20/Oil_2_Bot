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

  // 2) Масла — сначала пробуем твою базу
  if (services?.oilSearch) {
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

  // 3) AI — рекомендации по симптомам/запросам
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

  // 4) Фолбэк
  await bot.sendMessage(chatId, `🤔 Не понял: "${text}". Напиши /start.`);
};
