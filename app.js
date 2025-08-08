// app.js — сервер + webhook/polling + шина обработчика
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const handleUpdate = require('./src/bot/handler');
const OilSearchAdapter = require('./src/services/adapters/OilSearchAdapter');
const AIAdapter = require('./src/services/adapters/AIAdapter');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ENABLE_WEBHOOK = String(process.env.ENABLE_WEBHOOK).toLowerCase() === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 8080;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан'); process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: false });

// === Сервисы (тонкие адаптеры к твоим классам)
const services = {
  oilSearch: new OilSearchAdapter(), // использует твой src/services/OilSearchService.js
  ai: new AIAdapter(),               // использует твой src/services/AIService.js
};

// === Webhook endpoint (Telegram -> наш бот)
app.post('/webhook/telegram', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e?.response?.data || e.message);
    res.status(200).json({ status: 'error', message: e.message });
  }
});

// === Health
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', mode: ENABLE_WEBHOOK ? 'webhook' : 'polling', ts: new Date().toISOString() });
});

// === Telegram events -> единый обработчик
bot.on('message', async (msg) => {
  try {
    await handleUpdate(bot, msg, services);
  } catch (e) {
    console.error('Message handler error:', e);
  }
});

// === Start server & set mode
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server :${PORT} | mode=${ENABLE_WEBHOOK ? 'WEBHOOK' : 'POLLING'}`);

  try {
    await axios.get(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`);
    if (ENABLE_WEBHOOK) {
      if (!WEBHOOK_URL) throw new Error('WEBHOOK_URL не задан при ENABLE_WEBHOOK=true');
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

// 404 + errors
app.use('*', (_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
