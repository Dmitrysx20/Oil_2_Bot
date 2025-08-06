const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const SmartRouter = require('./services/smart-router');
const TestOilService = require('../test-oil-service');
const TestAIService = require('../test-ai-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize services with test versions
const smartRouter = new SmartRouter();
const oilService = new TestOilService();
const aiService = new TestAIService();

// Initialize Telegram bot (only if token is provided)
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here') {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('🤖 Telegram bot initialized');
} else {
  console.log('⚠️ Telegram bot token not configured, running in test mode');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'test',
    services: {
      smartRouter: 'active',
      oilService: 'active',
      aiService: 'active',
      telegramBot: bot ? 'active' : 'disabled'
    }
  });
});

// Webhook endpoint for Telegram
app.post('/webhook', express.json(), async (req, res) => {
  if (!bot) {
    return res.status(400).json({ error: 'Telegram bot not configured' });
  }
  
  try {
    const update = req.body;
    await handleTelegramUpdate(update);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Test endpoints
app.post('/test/oil-search', async (req, res) => {
  try {
    const { oilName } = req.body;
    
    if (!oilName) {
      return res.status(400).json({ error: 'Oil name is required' });
    }

    const oil = await oilService.searchOil(oilName);
    
    if (oil) {
      const formattedInfo = oilService.formatOilInfo(oil);
      res.json({
        success: true,
        oil: oil,
        formattedInfo: formattedInfo
      });
    } else {
      const suggestions = oilService.getSuggestions(oilName);
      const notFoundMessage = oilService.formatNotFoundMessage(oilName, suggestions);
      res.json({
        success: false,
        message: notFoundMessage,
        suggestions: suggestions
      });
    }
  } catch (error) {
    console.error('Error in oil search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/test/ai-recommendation', async (req, res) => {
  try {
    const { mood, keywords } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const oils = await oilService.getAllOils();
    const recommendation = await aiService.getMoodRecommendation(mood, oils, keywords);

    res.json({
      success: true,
      mood: mood,
      keywords: keywords || [],
      recommendation: recommendation
    });
  } catch (error) {
    console.error('Error in AI recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main bot logic
async function handleTelegramUpdate(update) {
  try {
    if (!update.message && !update.callback_query) {
      return;
    }

    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const user = update.message?.from || update.callback_query?.from;

    logger.info(`Received update from user ${user?.id} in chat ${chatId}`);

    // Handle callback queries
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return;
    }

    // Handle text messages
    if (update.message?.text) {
      await handleTextMessage(update.message);
    }

  } catch (error) {
    logger.error('Error handling Telegram update:', error);
  }
}

async function handleTextMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;
  const user = message.from;

  try {
    // Analyze request using Smart Router
    const request = smartRouter.analyzeRequest({
      json: { message: { text, chat: { id: chatId }, from: user } }
    });

    logger.info(`Request type: ${request.requestType} from user ${user.id}`);

    // Route to appropriate handler
    switch (request.requestType) {
      case 'start_command':
        await handleStartCommand(chatId, user);
        break;
      
      case 'help_command':
        await handleHelpCommand(chatId);
        break;
      
      case 'oil_search':
        await handleOilSearch(chatId, request.oilName);
        break;
      
      case 'mood_request':
        await handleMoodRequest(chatId, request.mood, request.keywords);
        break;
      
      case 'music_request':
        await handleMusicRequest(chatId, request);
        break;
      
      case 'greeting':
        await handleGreeting(chatId, user);
        break;
      
      default:
        await handleUnknownRequest(chatId, text);
    }

  } catch (error) {
    logger.error('Error handling text message:', error);
    await sendErrorMessage(chatId);
  }
}

async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const user = callbackQuery.from;

  try {
    logger.info(`Callback query: ${data} from user ${user.id}`);

    if (data === 'main_menu') {
      await sendMainMenu(chatId);
    } else if (data.startsWith('select_oil:')) {
      const oilName = data.replace('select_oil:', '');
      await handleOilSearch(chatId, oilName);
    } else {
      await handleUnknownCallback(chatId, data);
    }

    // Answer callback query
    if (bot) {
      await bot.answerCallbackQuery(callbackQuery.id);
    }

  } catch (error) {
    logger.error('Error handling callback query:', error);
    await sendErrorMessage(chatId);
  }
}

// Command handlers
async function handleStartCommand(chatId, user) {
  const welcomeMessage = `🌿 **Привет, ${user.first_name}! Я твой Арома-помощник!** 🌿

✨ **Что я умею:**

🔍 **Рассказать про любое масло:**
- Просто напиши: "мята", "лаванда", "лимон"
- Или: "расскажи про эвкалипт"

🤖 **Дать научные рекомендации:**
- "нужна энергия" → рекомендации с исследованиями
- "хочу расслабиться" → советы экспертов
- "простуда" → актуальные данные о лечении

Просто напиши что тебя интересует! 😊`;

  if (bot) {
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    });
  }
}

async function handleHelpCommand(chatId) {
  const helpMessage = `🌿 **Помощь по использованию бота**

🔍 **Поиск масел:**
• Название масла: "лаванда", "мята", "лимон"
• Описание эффекта: "нужна энергия", "хочу расслабиться"
• Симптомы: "головная боль", "простуда", "стресс"

🎵 **Музыкальные рекомендации:**
• "музыка для расслабления"
• "что послушать с лавандой"

💡 **Примеры запросов:**
• "расскажи про эвкалипт"
• "нужна энергия"
• "музыка на сегодня"`;

  if (bot) {
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }
}

async function handleOilSearch(chatId, oilName) {
  try {
    const oil = await oilService.searchOil(oilName);
    
    if (oil) {
      const message = oilService.formatOilInfo(oil);
      if (bot) {
        await bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        });
      }
    } else {
      const suggestions = oilService.getSuggestions(oilName);
      const notFoundMessage = oilService.formatNotFoundMessage(oilName, suggestions);
      if (bot) {
        await bot.sendMessage(chatId, notFoundMessage, { parse_mode: 'Markdown' });
      }
    }
  } catch (error) {
    logger.error('Error in oil search:', error);
    await sendErrorMessage(chatId);
  }
}

async function handleMoodRequest(chatId, mood, keywords) {
  try {
    const oils = await oilService.getAllOils();
    const recommendation = await aiService.getMoodRecommendation(mood, oils, keywords);
    
    if (bot) {
      await bot.sendMessage(chatId, recommendation, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    logger.error('Error in mood request:', error);
    await sendErrorMessage(chatId);
  }
}

async function handleMusicRequest(chatId, request) {
  try {
    const musicRecommendation = await aiService.getMusicRecommendation(request);
    if (bot) {
      await bot.sendMessage(chatId, musicRecommendation, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    logger.error('Error in music request:', error);
    await sendErrorMessage(chatId);
  }
}

async function handleGreeting(chatId, user) {
  const greetingMessage = `Привет, ${user.first_name}! 😊

Я твой Арома-помощник! Просто напиши мне, что тебя интересует:
• Название масла: "лаванда", "мята"
• Твое настроение: "нужна энергия", "хочу расслабиться"
• Или просто спроси: "что ты умеешь?"`;

  if (bot) {
    await bot.sendMessage(chatId, greetingMessage);
  }
}

async function handleUnknownRequest(chatId, text) {
  const unknownMessage = `🤔 Не совсем понял ваш запрос: "${text}"

💡 **Попробуйте:**
• Название масла: "лаванда", "мята", "лимон"
• Описание проблемы: "нужна энергия", "стресс"
• Команду: /help - для получения справки

Или просто напишите "помощь" для получения подробной информации! 😊`;

  if (bot) {
    await bot.sendMessage(chatId, unknownMessage);
  }
}

async function handleUnknownCallback(chatId, data) {
  const unknownCallbackMessage = `🤔 Неизвестная команда: ${data}

Попробуйте использовать кнопки меню или напишите "помощь" для получения справки.`;

  if (bot) {
    await bot.sendMessage(chatId, unknownCallbackMessage);
  }
}

async function sendMainMenu(chatId) {
  const mainMenuMessage = `🏠 **Главное меню**

Выберите, что вас интересует:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🌿 Поиск масла', callback_data: 'search_oil' },
        { text: '🎵 Музыка', callback_data: 'music' }
      ],
      [
        { text: '❓ Помощь', callback_data: 'help' }
      ]
    ]
  };

  if (bot) {
    await bot.sendMessage(chatId, mainMenuMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

async function sendErrorMessage(chatId) {
  const errorMessage = `❌ **Произошла ошибка**

Попробуйте еще раз или напишите "помощь" для получения справки.`;

  if (bot) {
    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
  }
}

// Error handling
if (bot) {
  bot.on('error', (error) => {
    logger.error('Telegram bot error:', error);
  });

  bot.on('polling_error', (error) => {
    logger.error('Telegram polling error:', error);
  });
}

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Aroma Helper Bot started on port ${PORT}`);
  if (bot) {
    logger.info(`📱 Bot username: @${bot.options.username}`);
  }
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`🧪 Test mode: ${!bot ? 'enabled' : 'disabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (bot) {
    bot.stopPolling();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (bot) {
    bot.stopPolling();
  }
  process.exit(0);
}); 