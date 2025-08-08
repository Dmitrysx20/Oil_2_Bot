// app.js — минимальный рабочий бот для Railway (webhook/polling по ENV)
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// === ENV ===
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ENABLE_WEBHOOK = String(process.env.ENABLE_WEBHOOK).toLowerCase() === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL; // например: https://oil2bot-production.up.railway.app
const PORT = process.env.PORT || 8080;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан');
  process.exit(1);
}

// Инициализируем бота (polling включим ниже при старте, если нужно)
const bot = new TelegramBot(TOKEN, { polling: false });

// === Простая логика ответа ===
async function handleTextMessage(chatId, text, user) {
  const lower = (text || '').toLowerCase();

  if (lower === '/start') {
    await bot.sendMessage(
      chatId,
      `👋 Привет, ${user?.first_name || 'друг'}!
Я бот-ассистент по ароматерапии. Попробуй:
• "Лаванда"
• "Нужна энергия"
• "Хочу расслабиться"`
    );
    return;
  }

  const oils = ['лаванда','мята','лимон','апельсин','розмарин','эвкалипт','чайное дерево','ромашка','бергамот','иланг-иланг'];
  const isOil = oils.some(k => lower.includes(k));

  if (isOil) {
    await bot.sendMessage(chatId, `🌿 Инфо по "${text}" — база подключится позже.`);
    return;
  }

  if (lower.includes('энергия') || lower.includes('бодр')) {
    await bot.sendMessage(chatId, `⚡ Энергия: апельсин, лимон, мята, розмарин, грейпфрут.`);
    return;
  }

  if (lower.includes('расслаб') || lower.includes('спокой')) {
    await bot.sendMessage(chatId, `😌 Расслабление: лаванда, ромашка, иланг-иланг, ветивер, бергамот.`);
    return;
  }

  await bot.sendMessage(chatId, `🤔 Не понял: "${text}". Напиши /start.`);
}

// === Webhook endpoint ===
app.post('/webhook/telegram', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e?.response?.data || e.message);
    res.status(200).json({ status: 'error', message: e.message });
  }
});

// === Health & Test ===
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    mode: ENABLE_WEBHOOK ? 'webhook' : 'polling',
    timestamp: new Date().toISOString(),
    node: process.version,
  });
});

app.get('/test', (_req, res) => {
  res.json({ ok: true, webhook_enabled: ENABLE_WEBHOOK, webhook_url: WEBHOOK_URL || null });
});

// === Telegram events ===
bot.on('message', async (msg) => {
  try {
    await handleTextMessage(msg.chat.id, msg.text || '', msg.from);
  } catch (e) {
    console.error('Message handler error:', e);
  }
});

// === Start server & setup mode ===
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server on :${PORT}`);
  console.log(`🔧 Mode: ${ENABLE_WEBHOOK ? 'WEBHOOK' : 'POLLING'}`);

  try {
    // Всегда чистим старый вебхук, чтобы не конфликтовал с polling
    await axios.get(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`);

    if (ENABLE_WEBHOOK) {
      if (!WEBHOOK_URL) throw new Error('WEBHOOK_URL не задан, а ENABLE_WEBHOOK=true');
      const hook = `${WEBHOOK_URL}/webhook/telegram`;
      await axios.get(`https://api.telegram.org/bot${TOKEN}/setWebhook`, { params: { url: hook } });
      console.log('🔗 Webhook set:', hook);
    } else {
      await bot.startPolling({ polling: true, interval: 300, params: { timeout: 10 } });
      console.log('📡 Polling started');
    }
  } catch (e) {
    console.error('Startup error:', e?.response?.data || e.message);
  }
});

// === 404 & errors ===
app.use('*', (_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

