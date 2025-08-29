// 🚂 EXPRESS СЕРВЕР С TELEGRAM БОТОМ ДЛЯ RAILWAY
// Основной сервер с ботом и health check

const express = require('express');

// Импортируем Supabase только если переменные настроены
let testSupabaseConnection;
try {
  const supabaseModule = require('./supabase_config.js');
  testSupabaseConnection = supabaseModule.testSupabaseConnection;
} catch (error) {
  console.log('⚠️ Supabase не настроен:', error.message);
  testSupabaseConnection = async () => ({
    success: false,
    error: 'Supabase not configured',
    recommendations: ['Configure SUPABASE_URL and SUPABASE_ANON_KEY']
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint для Railway
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    service: 'essential-oils-bot'
  });
});

// Health check endpoint (альтернативный)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Essential Oils Bot API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      healthz: '/healthz',
      supabase: '/api/supabase-test'
    }
  });
});

// Supabase test endpoint
app.get('/api/supabase-test', async (req, res) => {
  try {
    const result = await testSupabaseConnection();
    res.status(200).json({
      success: true,
      supabase: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Express сервер запущен');
  console.log(`📊 Информация о системе:`);
  console.log(`   Node.js версия: ${process.version}`);
  console.log(`   Платформа: ${process.platform}`);
  console.log(`   Архитектура: ${process.arch}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
  console.log(`   Порт: ${PORT}`);
  console.log(`   URL: http://0.0.0.0:${PORT}`);
  
  // Test Supabase connection
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase подключен успешно');
    } else {
      console.log('❌ Проблема с Supabase:', result.error);
    }
  });
});

// Запускаем основной бот в отдельном процессе
console.log('🤖 Запуск Telegram бота...');

// Проверяем наличие токена бота
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.log('⚠️ TELEGRAM_BOT_TOKEN не настроен');
  console.log('🔧 Бот не будет запущен. Настройте переменную в Railway.');
} else {
  try {
    // Импортируем и запускаем основной бот
    const botApp = require('./src/index.js');
    console.log('✅ Telegram бот запущен');
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error.message);
    console.log('🔧 Проверьте настройки и зависимости');
  }
} 