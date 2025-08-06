// 🏥 HEALTH CHECK ENDPOINT FOR RAILWAY
// Проверка здоровья системы для Railway

const express = require('express');
const app = express();

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Основной health check endpoint
app.get('/healthz', async (req, res) => {
  try {
    const { checkNodeVersion, diagnoseSupabaseIssues } = require('./supabase_upgrade_fix.js');
    
    const nodeVersionOk = checkNodeVersion();
    const diagnosis = diagnoseSupabaseIssues();
    
    if (nodeVersionOk && !diagnosis.hasErrors) {
      res.status(200).json({
        status: 'healthy',
        nodeVersion: process.version,
        supabaseStatus: 'connected',
        environment: process.env.RAILWAY_ENVIRONMENT || 'production',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        errors: diagnosis.issues,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Дополнительный endpoint для детальной информации
app.get('/health/detailed', async (req, res) => {
  try {
    const { checkNodeVersion, diagnoseSupabaseIssues, safeSupabaseConnection } = require('./supabase_upgrade_fix.js');
    
    const nodeVersionOk = checkNodeVersion();
    const diagnosis = diagnoseSupabaseIssues();
    const supabaseConnection = await safeSupabaseConnection();
    
    res.status(200).json({
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      environment: {
        railway: process.env.RAILWAY_ENVIRONMENT || 'production',
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
      },
      supabase: {
        status: supabaseConnection.success ? 'connected' : 'disconnected',
        details: supabaseConnection,
        diagnosis: diagnosis
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint для метрик
app.get('/metrics', (req, res) => {
  const metrics = {
    requests: global.requestCount || 0,
    errors: global.errorCount || 0,
    supabaseCalls: global.supabaseCallCount || 0,
    startTime: global.startTime || new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(metrics);
});

// Инициализация глобальных счетчиков
global.requestCount = 0;
global.errorCount = 0;
global.supabaseCallCount = 0;
global.startTime = new Date().toISOString();

// Middleware для подсчета запросов
app.use((req, res, next) => {
  global.requestCount++;
  next();
});

// Обработка ошибок
app.use((error, req, res, next) => {
  global.errorCount++;
  console.error('Health check error:', error);
  res.status(500).json({
    status: 'error',
    error: error.message,
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚂 Railway health check running on port ${PORT}`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/healthz`);
  console.log(`📊 Detailed health at: http://localhost:${PORT}/health/detailed`);
  console.log(`📈 Metrics at: http://localhost:${PORT}/metrics`);
});

module.exports = app; 