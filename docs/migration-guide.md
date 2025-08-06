# 🔄 Руководство по миграции с n8n

Это руководство поможет вам перенести Aroma Helper Bot с платформы n8n на обычное Node.js приложение.

## 📋 Что изменилось

### ✅ Преимущества новой архитектуры:

- **Производительность**: Прямое выполнение кода без промежуточного слоя
- **Масштабируемость**: Легкое горизонтальное масштабирование
- **Отладка**: Прямой доступ к логам и отладке
- **Развертывание**: Простое развертывание на любых платформах
- **Стоимость**: Снижение затрат на инфраструктуру

### 🔧 Основные изменения:

1. **Архитектура**: Монолитное приложение вместо workflow
2. **База данных**: Прямое подключение к Supabase
3. **AI интеграция**: Прямые вызовы OpenAI API
4. **Логирование**: Встроенная система логирования
5. **Мониторинг**: Health checks и метрики

## 🚀 Пошаговая миграция

### Шаг 1: Подготовка окружения

```bash
# Клонирование репозитория
git clone <your-repo-url>
cd aroma-helper-bot

# Установка зависимостей
npm install
```

### Шаг 2: Настройка переменных окружения

Скопируйте переменные из n8n в новый `.env` файл:

```bash
cp env.example .env
```

Заполните переменные:

```env
# Telegram Bot (из n8n)
TELEGRAM_BOT_TOKEN=your_bot_token

# OpenAI (из n8n)
OPENAI_API_KEY=your_openai_key

# Supabase (из n8n)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Сервер
PORT=3000
NODE_ENV=production
```

### Шаг 3: Настройка базы данных

Создайте таблицы в Supabase (если еще не созданы):

```sql
-- Таблица масел
CREATE TABLE oils (
  id SERIAL PRIMARY KEY,
  oil_name VARCHAR(255) NOT NULL,
  description TEXT,
  emotional_effect TEXT,
  physical_effect TEXT,
  applications TEXT,
  safety_warning TEXT,
  joke TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица подписок
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  username VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Шаг 4: Перенос данных

Если у вас есть данные в n8n, экспортируйте их:

```bash
# Экспорт данных масел (если есть)
# Скопируйте данные из n8n в таблицу oils

# Экспорт подписок (если есть)
# Скопируйте данные из n8n в таблицу subscriptions
```

### Шаг 5: Тестирование

```bash
# Запуск в режиме разработки
npm run dev

# Проверка health check
curl http://localhost:3000/health
```

### Шаг 6: Развертывание

Выберите один из способов развертывания:

#### Локальное развертывание:
```bash
npm start
```

#### С PM2:
```bash
npm install -g pm2
pm2 start src/index.js --name "aroma-bot"
pm2 save
pm2 startup
```

#### С Docker:
```bash
docker-compose up -d
```

#### Автоматическое развертывание:
```bash
./deploy.sh
```

## 🔄 Сопоставление функций

### n8n Workflow → Node.js Сервисы

| n8n Node | Node.js Сервис | Функция |
|----------|----------------|---------|
| Telegram Trigger | `src/index.js` | Обработка webhook |
| Smart Router | `src/services/smart-router.js` | Анализ запросов |
| Oil Database | `src/services/oil-service.js` | Работа с маслами |
| OpenAI | `src/services/ai-service.js` | AI рекомендации |
| Subscription | `src/services/subscription-service.js` | Управление подписками |

### Обработка запросов

**n8n:**
```
Telegram → Smart Router → Oil Search → Response
```

**Node.js:**
```javascript
// src/index.js
app.post('/webhook', async (req, res) => {
  const request = smartRouter.analyzeRequest(req.body);
  const result = await oilService.searchOil(request.oilName);
  // Отправка ответа
});
```

## 🧪 Тестирование миграции

### 1. Функциональное тестирование

```bash
# Тест поиска масла
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"лаванда","chat":{"id":123},"from":{"id":456,"first_name":"Test"}}}'
```

### 2. Проверка логов

```bash
# Просмотр логов
tail -f logs/app.log

# Docker логи
docker-compose logs -f aroma-bot

# PM2 логи
pm2 logs aroma-bot
```

### 3. Мониторинг

```bash
# Health check
curl http://localhost:3000/health

# Статистика PM2
pm2 status
pm2 monit
```

## 🔧 Настройка webhook

### Обновление webhook в Telegram:

```bash
# Установка нового webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/webhook"}'
```

### Проверка webhook:

```bash
# Получение информации о webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 🚨 Устранение проблем

### Частые проблемы:

1. **Ошибка подключения к базе данных**
   - Проверьте переменные SUPABASE_URL и SUPABASE_ANON_KEY
   - Убедитесь, что таблицы созданы

2. **Ошибка Telegram webhook**
   - Проверьте TELEGRAM_BOT_TOKEN
   - Убедитесь, что webhook URL доступен из интернета

3. **Ошибка OpenAI API**
   - Проверьте OPENAI_API_KEY
   - Убедитесь, что у вас есть кредиты в OpenAI

4. **Проблемы с портами**
   - Проверьте, что порт 3000 свободен
   - Измените PORT в .env если нужно

### Логи и отладка:

```bash
# Включение подробного логирования
export LOG_LEVEL=debug
npm run dev

# Просмотр ошибок
grep ERROR logs/app.log
```

## 📊 Мониторинг после миграции

### Метрики для отслеживания:

- Количество запросов в минуту
- Время ответа API
- Ошибки и их типы
- Использование памяти и CPU
- Статус подключений к внешним сервисам

### Настройка алертов:

```bash
# Мониторинг с PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## ✅ Чек-лист миграции

- [ ] Установлены зависимости
- [ ] Настроены переменные окружения
- [ ] Созданы таблицы в базе данных
- [ ] Перенесены данные (если есть)
- [ ] Протестировано локально
- [ ] Развернуто на сервере
- [ ] Обновлен webhook в Telegram
- [ ] Проверена функциональность
- [ ] Настроен мониторинг
- [ ] Остановлен старый n8n workflow

## 🎉 Завершение миграции

После успешной миграции:

1. **Остановите n8n workflow**
2. **Удалите старые webhook**
3. **Обновите документацию**
4. **Уведомите команду о завершении**

### Команды для остановки n8n:

```bash
# Остановка n8n (если запущен локально)
pm2 stop n8n

# Или через Docker
docker-compose down
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи приложения
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к внешним сервисам
4. Создайте Issue в репозитории с подробным описанием проблемы

---

**Удачи с миграцией! 🌿✨** 