require('dotenv').config();
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ==== ENV ====
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ENABLE_WEBHOOK = String(process.env.ENABLE_WEBHOOK).toLowerCase() === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL; // например, https://oil2bot-production.up.railway.app
const PORT = process.env.PORT || 8080;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан. Добавь переменную в Railway → Variables.');
  process.exit(1);
}

// Инициализируем бота в "безопасном" режиме; включим polling ниже, если нужно
const bot = new TelegramBot(TOKEN, { polling: false });

// ==== Универсальная логика ответа ====
async function handleTextMessage(chatId, text, user) {
  const lower = (text || '').toLowerCase();

  if (lower === '/start') {
    const welcome =
`👋 Привет, ${user?.first_name || 'друг'}!

Я бот-ассистент по ароматерапии. Помогу подобрать масла и дам быстрые подсказки.

Попробуй:
• "Лаванда"
• "Нужна энергия"
• "Хочу расслабиться"`;
    await bot.sendMessage(chatId, welcome);
    return;
  }

  const oils = ['лаванда','мята','лимон','апельсин','розмарин','эвкалипт','чайное дерево','ромашка','бергамот','иланг-иланг'];
  const isOil = oils.some(k => lower.includes(k));

  if (isOil) {
    await bot.sendMessage(chatId, `🌿 Инфо по маслу "${text}" пока краткая. Скоро подключим базу.`);
    return;
  }

  if (lower.includes('энергия') || lower.includes('бодр')) {
    await bot.sendMessage(chatId,
`⚡ Масла для энергии:
1) Апельсин
2) Лимон
3) Мята
4) Розмарин
5) Грейпфрут

Совет: 2 капли лимона + 2 капли мяты по утрам.`);
    return;
  }

  if (lower.includes('расслаб') || lower.includes('спокой')) {
    await bot.sendMessage(chatId,
`😌 Для расслабления:
1) Лаванда
2) Ромашка
3) Иланг-иланг
4) Ветивер
5) Бергамот`);
    return;
  }

  await bot.sendMessage(chatId,
`🤔 Не совсем понял запрос: "${text}"

Попробуй:
• "Лаванда"
• "Нужна энергия"
• "Хочу расслабиться"`);
}

// ==== Webhook endpoint ====
app.post('/webhook/telegram', async (req, res) => {
  try {
    // Передаём апдейт в библиотеку, чтобы сработали все on('message') и т.п.
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e?.response?.data || e.message);
    res.status(200).json({ status: 'error', message: e.message });
  }
});

// ==== Health & тест ====
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    mode: ENABLE_WEBHOOK ? 'webhook' : 'polling',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    node: process.version,
  });
});

app.get('/test', (_req, res) => {
  res.json({
    ok: true,
    webhook_enabled: ENABLE_WEBHOOK,
    webhook_url: WEBHOOK_URL || null,
  });
});

// ==== Подписки на события Telegram ====
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    await handleTextMessage(chatId, text, msg.from);
  } catch (e) {
    console.error('Message handler error:', e);
  }
});

// ==== Запуск сервера + настройка режима ====
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server on :${PORT}`);
  console.log(`🔧 Mode: ${ENABLE_WEBHOOK ? 'WEBHOOK' : 'POLLING'}`);

  try {
    // Всегда чистим старые вебхуки, чтобы не было конфликтов
    await axios.get(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`);

    if (ENABLE_WEBHOOK) {
      if (!WEBHOOK_URL) {
        throw new Error('WEBHOOK_URL не задан, а ENABLE_WEBHOOK=true');
      }
      const hook = `${WEBHOOK_URL}/webhook/telegram`;
      // Регистрируем вебхук
      await axios.get(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
        params: { url: hook },
      });
      const info = await axios.get(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
      console.log('🔗 Webhook set:', info.data?.result?.url || hook);
    } else {
      // Включаем polling
      await bot.startPolling({ polling: true, interval: 300, params: { timeout: 10 } });
      console.log('📡 Polling started');
    }
  } catch (e) {
    console.error('Startup error:', e?.response?.data || e.message);
  }
});

// ==== 404 и глобальная ошибка ====
app.use('*', (_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
Что поставить в Railway → Variables
Обязательные

TELEGRAM_BOT_TOKEN — токен бота

Выбор режима

ENABLE_WEBHOOK=true и WEBHOOK_URL=https://<твой-subdomain>.up.railway.app — тогда вебхук

или ENABLE_WEBHOOK=false — тогда polling (публичный URL не нужен)

Больше ничего не надо.

package.json (минимум)
Если чего-то не хватает — добавь:

json
Копировать
Редактировать
{
  "name": "aromatherapy-telegram-bot",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "app.js",
  "scripts": {
    "start": "node --no-deprecation app.js"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "node-telegram-bot-api": "^0.66.0"
  }
}
