require('dotenv').config();
const express = require('express');
const app = express();

// Сервисы
const SmartRouter = require('./src/services/SmartRouter');
const TelegramService = require('./src/services/TelegramService');
const OilSearchService = require('./src/services/OilSearchService');
const AIService = require('./src/services/AIService');
const MusicService = require('./src/services/MusicService');
const SubscriptionService = require('./src/services/SubscriptionService');
const AdminService = require('./src/services/AdminService');

// Контроллеры
const TelegramController = require('./src/controllers/TelegramController');

// Middleware
const adminAuth = require('./src/middleware/adminAuth');
const rateLimiter = require('./src/middleware/rateLimiter');

// Инициализация сервисов
const telegramService = new TelegramService();
const smartRouter = new SmartRouter();
const oilSearchService = new OilSearchService();
const aiService = new AIService();
const musicService = new MusicService();
const subscriptionService = new SubscriptionService();
const adminService = new AdminService();

// Контроллер
const telegramController = new TelegramController({
  telegramService,
  smartRouter,
  oilSearchService,
  aiService,
  musicService,
  subscriptionService,
  adminService
});

// Middleware
app.use(express.json());
app.use(rateLimiter);
app.use(adminAuth);

// Routes
app.post('/webhook/telegram', telegramController.handleWebhook.bind(telegramController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск cron jobs
const NotificationScheduler = require('./src/jobs/NotificationScheduler');
const scheduler = new NotificationScheduler(subscriptionService, adminService);
scheduler.start();

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Aromatherapy Bot running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 