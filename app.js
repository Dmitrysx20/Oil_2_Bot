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

// Test endpoint для отладки
app.get('/test', (req, res) => {
  res.json({
    message: 'Приложение работает!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    webhook_enabled: process.env.ENABLE_WEBHOOK === 'true',
    webhook_url: process.env.WEBHOOK_URL || 'не настроен',
    telegram_token: process.env.TELEGRAM_BOT_TOKEN ? 'настроен' : 'не настроен'
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
    app.post('/webhook/telegram', async (req, res) => {
      try {
        console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
        
        // Простая обработка команды /start
        if (req.body?.message?.text === '/start') {
          const chatId = req.body.message.chat.id;
          const userName = req.body.message.from.first_name;
          
          const welcomeMessage = `👋 Привет, ${userName || 'друг'}! 

Я ваш персональный помощник по ароматерапии. Я помогу вам найти идеальное эфирное масло для любых целей.

🔍 **Что я умею:**
• Искать информацию о конкретных маслах
• Рекомендовать масла по симптомам и настроению
• Предлагать музыкальные плейлисты
• Настраивать уведомления о новых маслах

💡 **Попробуйте спросить:**
• "Лаванда" - информация о масле
• "Нужна энергия" - масла для бодрости
• "Хочу расслабиться" - масла для релакса
• "Музыка для сна" - плейлист для сна

Начните с любого вопроса! 🌿`;

          // Отправляем сообщение через Telegram API
          try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
              await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: welcomeMessage,
                parse_mode: 'Markdown'
              });
            }
          } catch (error) {
            console.error('Error sending message:', error.message);
          }

          res.status(200).json({ 
            status: 'ok',
            message: 'Команда /start обработана и сообщение отправлено',
            response: {
              chatId: chatId,
              message: welcomeMessage
            }
          });
        } else if (req.body?.message?.text) {
          // Обработка других сообщений
          const chatId = req.body.message.chat.id;
          const text = req.body.message.text;
          
          let responseMessage = '';
          
          if (text.toLowerCase().includes('лаванда')) {
            responseMessage = `🌿 **Лаванда** - одно из самых популярных эфирных масел!

**Свойства:**
• Успокаивающее и расслабляющее
• Помогает при бессоннице
• Снимает стресс и тревогу
• Обладает антисептическими свойствами

**Применение:**
• Ароматерапия: 2-3 капли в аромалампу
• Ванна: 5-10 капель с морской солью
• Массаж: 2-3 капли с базовым маслом

💡 **Совет:** Лаванда отлично сочетается с ромашкой для усиления успокаивающего эффекта.`;
          } else if (text.toLowerCase().includes('энергия') || text.toLowerCase().includes('бодрость')) {
            responseMessage = `⚡ **Масла для энергии и бодрости:**

**1. Апельсин** - освежающий и бодрящий
**2. Лимон** - повышает концентрацию
**3. Мята перечная** - стимулирует умственную активность
**4. Розмарин** - улучшает память и внимание
**5. Грейпфрут** - поднимает настроение

💡 **Совет:** Смешайте 2 капли лимона + 2 капли мяты для утреннего заряда энергии!`;
          } else if (text.toLowerCase().includes('расслаб') || text.toLowerCase().includes('спокойствие')) {
            responseMessage = `😌 **Масла для расслабления:**

**1. Лаванда** - классическое успокаивающее масло
**2. Ромашка** - мягкое расслабляющее действие
**3. Иланг-иланг** - снимает напряжение
**4. Ветивер** - глубокое расслабление
**5. Бергамот** - снимает стресс

💡 **Совет:** Создайте смесь для вечернего релакса: лаванда + ромашка + иланг-иланг`;
          } else {
            responseMessage = `🤔 Я не совсем понял ваш запрос: "${text}"

💡 **Попробуйте спросить:**
• "Лаванда" - информация о масле
• "Нужна энергия" - масла для бодрости
• "Хочу расслабиться" - масла для релакса
• "Музыка для сна" - плейлист для сна

Или используйте команду /start для справки.`;
          }

          // Отправляем ответ через Telegram API
          try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
              await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: responseMessage,
                parse_mode: 'Markdown'
              });
            }
          } catch (error) {
            console.error('Error sending message:', error.message);
          }

          res.status(200).json({ 
            status: 'ok',
            message: 'Сообщение обработано и ответ отправлен',
            response: {
              chatId: chatId,
              message: responseMessage
            }
          });
        } else {
          res.status(200).json({ 
            status: 'ok',
            message: 'Webhook работает! Ожидается полная функциональность',
            received_data: req.body
          });
        }
      } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ 
          status: 'error',
          message: error.message
        });
      }
    });
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