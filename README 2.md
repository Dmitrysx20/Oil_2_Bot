# 🌿 Essential Oils Bot

Telegram бот для рекомендаций эфирных масел с системой уведомлений и административной панелью.

## 🚀 Особенности

- ✅ Утренние и вечерние уведомления
- ✅ Рекомендации эфирных масел по дням недели
- ✅ Административная панель с безопасностью
- ✅ Интеграция с Supabase
- ✅ Музыкальная система
- ✅ Система рассылок
- ✅ Статистика и аналитика

## 🛠️ Технологии

- **Node.js**: v22.17.1
- **n8n**: Автоматизация рабочих процессов
- **Supabase**: База данных и аутентификация
- **Telegram Bot API**: Интерфейс бота
- **Railway**: Хостинг и деплой

## 📋 Требования

- Node.js 20+
- Supabase проект
- Telegram Bot Token
- Railway аккаунт

## 🔧 Установка

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-username/essential-oils-bot.git
cd essential-oils-bot
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env`:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram Bot
BOT_TOKEN=your-bot-token
ADMIN_CHAT_ID=802895688

# Environment
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

### 4. Запуск тестов
```bash
npm test
```

## 🚂 Деплой на Railway

### Автоматический деплой
1. Подключите репозиторий к Railway
2. Настройте переменные окружения в Railway Dashboard
3. При каждом push в main/master происходит автоматический деплой

### Ручной деплой
```bash
# Установка Railway CLI
npm install -g @railway/cli

# Вход в Railway
railway login

# Подключение к проекту
railway link

# Деплой
railway up
```

## 📊 Мониторинг

### Health Check
```
https://your-app.railway.app/healthz
```

### Детальная диагностика
```
https://your-app.railway.app/health/detailed
```

### Метрики
```
https://your-app.railway.app/metrics
```

## 🔍 Диагностика

### Проверка API ключей
```bash
node check_api_keys.js
```

### Тест Supabase
```bash
node test_supabase_diagnosis.js
```

### Railway тест
```bash
node railway_test.js
```

## 📁 Структура проекта

```
essential-oils-bot/
├── .github/workflows/     # GitHub Actions
├── .n8n/                  # n8n конфигурация
├── admin_security_enhanced_updated.js
├── morning_notification_generator.js
├── evening_notification_generator.js
├── supabase_upgrade_fix.js
├── check_api_keys.js
├── health_check.js
├── railway_startup.js
├── package.json
├── railway.json
└── README.md
```

## 🔐 Безопасность

- ✅ Проверка версии Node.js
- ✅ Валидация API ключей
- ✅ Логирование административных действий
- ✅ Система разрешений
- ✅ Безопасное подключение к Supabase

## 📈 Функции бота

### Утренние уведомления
- Рекомендации масел по дням недели
- Мотивационные сообщения
- Советы по использованию

### Вечерние уведомления
- Релаксационные масла
- Музыкальные рекомендации
- Ритуалы для вечера

### Административная панель
- Статистика пользователей
- Система рассылок
- Управление музыкой
- Экспорт данных

## 🛠️ Разработка

### Локальный запуск
```bash
npm run dev
```

### Тестирование
```bash
npm test
```

### Проверка кода
```bash
node check_api_keys.js
node test_supabase_diagnosis.js
```

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи в Railway Dashboard
2. Запустите диагностику: `node test_supabase_diagnosis.js`
3. Проверьте health check: `/healthz`
4. Убедитесь, что все API ключи настроены

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в branch: `git push origin feature/amazing-feature`
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [n8n](https://n8n.io/) - платформа автоматизации
- [Supabase](https://supabase.com/) - база данных
- [Railway](https://railway.app/) - хостинг
- [Telegram Bot API](https://core.telegram.org/bots/api) - API ботов

---

**Статус**: ✅ Активно разрабатывается
**Версия**: 1.0.0
**Node.js**: v22.17.1 