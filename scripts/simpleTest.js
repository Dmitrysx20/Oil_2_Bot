const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test webhook endpoint
app.post('/webhook/telegram', (req, res) => {
  res.status(200).json({ 
    status: 'webhook_disabled',
    message: 'Webhook отключен. Установите ENABLE_WEBHOOK=true для активации',
    received_data: req.body
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Приложение работает!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      webhook: '/webhook/telegram',
      test: '/test'
    }
  });
});

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
  console.log(`🤖 Тестовое приложение запущено на порту ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/telegram`);
  console.log('\n💡 Для тестирования используйте:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl http://localhost:${PORT}/test`);
  console.log(`   curl -X POST http://localhost:${PORT}/webhook/telegram -H "Content-Type: application/json" -d '{"test": "data"}'`);
}); 