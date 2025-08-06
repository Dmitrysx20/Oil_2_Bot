require('dotenv').config();
const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (должен быть первым)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Обработка ошибок для health check
app.use((error, req, res, next) => {
  if (req.path === '/health') {
    return res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  next(error);
});

// Основные маршруты (только если все сервисы загружены)
try {
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
  app.use(rateLimiter);
  app.use(adminAuth);

  // Routes
  // Контроль webhook через переменную окружения
  if (process.env.ENABLE_WEBHOOK === 'true') {
    app.post('/webhook/telegram', telegramController.handleWebhook.bind(telegramController));
  } else {
    app.post('/webhook/telegram', (req, res) => {
      res.status(200).json({ 
        status: 'webhook_disabled',
        message: 'Webhook отключен. Установите ENABLE_WEBHOOK=true для активации'
      });
    });
  }

  // Запуск cron jobs (только в продакшене)
  if (process.env.NODE_ENV === 'production') {
    try {
      const NotificationScheduler = require('./src/jobs/NotificationScheduler');
      const scheduler = new NotificationScheduler(subscriptionService, adminService);
      scheduler.start();
    } catch (schedulerError) {
      console.log('Scheduler not started:', schedulerError.message);
    }
  }

  console.log('✅ All services loaded successfully');

} catch (serviceError) {
  console.error('❌ Service loading error:', serviceError.message);
  
  // Fallback route для webhook
  app.post('/webhook/telegram', (req, res) => {
    res.status(200).json({ 
      error: 'Service temporarily unavailable',
      message: 'Бот временно недоступен. Попробуйте позже.'
    });
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Aromatherapy Bot running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 