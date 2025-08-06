# 🚂 РУКОВОДСТВО ПО НАСТРОЙКЕ НА RAILWAY

## 📋 Обзор
Ваш бот эфирных масел размещен на Railway с исправленной конфигурацией Supabase.

## 🔧 Настройка переменных окружения в Railway

### 1. Откройте проект в Railway Dashboard
- Перейдите на [railway.app](https://railway.app)
- Выберите ваш проект с ботом эфирных масел

### 2. Добавьте переменные окружения
В разделе **Variables** добавьте:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Bot Configuration
BOT_TOKEN=your-telegram-bot-token
ADMIN_CHAT_ID=802895688

# Database Configuration (если используете)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Node.js Configuration
NODE_ENV=production
NODE_VERSION=22.17.1
```

### 3. Настройка Railway для n8n

#### Создайте файл `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "n8n start",
    "healthcheckPath": "/healthz",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Создайте файл `package.json` (если его нет):
```json
{
  "name": "essential-oils-bot",
  "version": "1.0.0",
  "description": "Telegram bot for essential oils recommendations",
  "main": "index.js",
  "scripts": {
    "start": "n8n start",
    "dev": "n8n start --tunnel",
    "test": "node test_supabase_diagnosis.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "n8n": "^1.28.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "keywords": ["telegram", "bot", "essential-oils", "n8n"],
  "author": "Your Name",
  "license": "MIT"
}
```

## 🚀 Обновление кода для Railway

### 1. Создайте файл `railway_startup.js`:
```javascript
// 🚂 RAILWAY STARTUP SCRIPT
// Инициализация для Railway с проверкой Supabase

const { checkNodeVersion, diagnoseSupabaseIssues, safeSupabaseConnection } = require('./supabase_upgrade_fix.js');

console.log('🚂 Railway startup initiated...');

// Проверка версии Node.js
console.log('🔍 Checking Node.js version...');
const nodeVersionOk = checkNodeVersion();

if (!nodeVersionOk) {
  console.error('❌ Node.js version incompatible with Railway');
  process.exit(1);
}

// Диагностика Supabase
console.log('🔍 Running Supabase diagnosis...');
const diagnosis = diagnoseSupabaseIssues();

if (diagnosis.hasErrors) {
  console.error('❌ Critical Supabase issues found:');
  diagnosis.issues.forEach(issue => {
    if (issue.severity === 'error') {
      console.error(`- ${issue.message}`);
    }
  });
  process.exit(1);
}

// Проверка подключения к Supabase
console.log('🔗 Testing Supabase connection...');
safeSupabaseConnection().then(result => {
  if (result.success) {
    console.log('✅ Railway startup completed successfully');
    console.log('🚀 Bot is ready to run on Railway');
  } else {
    console.error('❌ Supabase connection failed:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Railway startup failed:', error);
  process.exit(1);
});
```

### 2. Обновите n8n конфигурацию для Railway

Создайте файл `.n8n/config.json`:
```json
{
  "database": {
    "type": "postgresdb",
    "postgresdb": {
      "host": "localhost",
      "port": 5432,
      "database": "n8n",
      "user": "postgres",
      "password": "password"
    }
  },
  "executions": {
    "process": "main",
    "mode": "regular"
  },
  "generic": {
    "timezone": "Europe/Moscow"
  },
  "nodes": {
    "include": [
      "n8n-nodes-base.*"
    ]
  },
  "security": {
    "oauth2": {
      "enabled": false
    }
  },
  "webhookUrl": "https://your-railway-app.railway.app"
}
```

## 🔧 Railway-specific обновления

### 1. Обновите `admin_security_enhanced_updated.js` для Railway:

```javascript
// Добавьте в начало файла:
const RAILWAY_ENV = process.env.RAILWAY_ENVIRONMENT || 'production';

// Обновите конфигурацию Supabase:
const SUPABASE_CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.x',
        'X-Railway-Environment': RAILWAY_ENV
      }
    }
  }
};
```

### 2. Создайте Railway health check endpoint:

```javascript
// health_check.js
const express = require('express');
const app = express();

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
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        errors: diagnosis.issues,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚂 Railway health check running on port ${PORT}`);
});
```

## 📊 Мониторинг на Railway

### 1. Логи Railway
```bash
# Просмотр логов в Railway Dashboard
# Или через CLI:
railway logs
```

### 2. Статус деплоя
```bash
# Проверка статуса
railway status

# Перезапуск сервиса
railway service restart
```

### 3. Переменные окружения
```bash
# Просмотр переменных
railway variables

# Добавление переменной
railway variables set SUPABASE_URL=https://your-project.supabase.co
```

## 🔍 Тестирование на Railway

### 1. Создайте тестовый скрипт для Railway:
```javascript
// railway_test.js
const { diagnoseSupabaseIssues, safeSupabaseConnection } = require('./supabase_upgrade_fix.js');

console.log('🧪 Railway environment test...');
console.log(`Environment: ${process.env.RAILWAY_ENVIRONMENT || 'production'}`);
console.log(`Node version: ${process.version}`);

// Диагностика
const diagnosis = diagnoseSupabaseIssues();
console.log('Diagnosis:', diagnosis);

// Тест подключения
safeSupabaseConnection().then(result => {
  console.log('Connection test:', result);
  
  if (result.success) {
    console.log('✅ Railway deployment is working correctly');
  } else {
    console.log('❌ Railway deployment has issues');
  }
});
```

### 2. Запустите тест:
```bash
# В Railway Dashboard или через CLI
railway run node railway_test.js
```

## 🚀 Деплой на Railway

### 1. Подключите репозиторий:
```bash
# Инициализация Railway проекта
railway init

# Подключение к существующему проекту
railway link
```

### 2. Деплой:
```bash
# Автоматический деплой при push
git push railway main

# Или ручной деплой
railway up
```

### 3. Проверка деплоя:
```bash
# Открыть приложение
railway open

# Проверить статус
railway status
```

## 📈 Мониторинг и аналитика

### 1. Railway Metrics
- CPU Usage
- Memory Usage
- Network I/O
- Response Time

### 2. Custom Metrics
```javascript
// Добавьте в ваш код:
const metrics = {
  requests: 0,
  errors: 0,
  supabaseCalls: 0,
  startTime: new Date()
};

// Логирование метрик
setInterval(() => {
  console.log('📊 Metrics:', {
    uptime: Date.now() - metrics.startTime.getTime(),
    requests: metrics.requests,
    errors: metrics.errors,
    supabaseCalls: metrics.supabaseCalls
  });
}, 60000); // Каждую минуту
```

## 🎯 Итоговая конфигурация

### Файлы для Railway:
1. `railway.json` - конфигурация Railway
2. `package.json` - зависимости и скрипты
3. `railway_startup.js` - инициализация
4. `health_check.js` - проверка здоровья
5. `railway_test.js` - тестирование
6. Обновленные файлы с исправленной конфигурацией Supabase

### Переменные окружения:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `BOT_TOKEN`
- `ADMIN_CHAT_ID`
- `NODE_ENV=production`

---

**Статус**: ✅ Готово для Railway
**Следующий шаг**: Настройка переменных окружения в Railway Dashboard 