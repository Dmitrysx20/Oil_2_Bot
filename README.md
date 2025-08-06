# 🌿 Aroma Helper Bot

Telegram бот для консультаций по ароматерапии с эфирными маслами. Предоставляет научно обоснованные рекомендации, информацию о маслах и музыкальные советы.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл `env.example` в `.env` и заполните необходимые переменные:

```bash
cp env.example .env
```

Заполните следующие переменные в файле `.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Настройка базы данных

Создайте таблицы в Supabase:

#### Таблица `oils`:
```sql
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
```

#### Таблица `subscriptions`:
```sql
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

### 4. Запуск приложения

#### Режим разработки:
```bash
npm run dev
```

#### Продакшн режим:
```bash
npm start
```

## 📁 Структура проекта

```
├── src/
│   ├── index.js              # Главный файл приложения
│   ├── services/             # Сервисы
│   │   ├── smart-router.js   # Умный роутер запросов
│   │   ├── oil-service.js    # Сервис для работы с маслами
│   │   ├── ai-service.js     # Сервис для работы с OpenAI
│   │   └── subscription-service.js # Сервис подписок
│   └── utils/
│       └── logger.js         # Логирование
├── modules/                  # Основные модули
│   ├── smart-router.js       # Логика анализа запросов
│   └── oil-database.js       # Работа с базой данных масел
├── config/                   # Конфигурационные файлы
├── data/                     # Данные
└── workflows/                # Рабочие процессы
```

## 🔧 Функциональность

### Основные возможности:

- 🔍 **Поиск информации о маслах** - подробная информация о любом эфирном масле
- 🤖 **AI-рекомендации** - персональные советы на основе настроения и потребностей
- 🎵 **Музыкальные рекомендации** - подбор музыки для ароматерапии
- 📱 **Система подписок** - ежедневные уведомления с советами
- 💬 **Умный роутер** - автоматическое определение типа запроса

### Команды бота:

- `/start` - приветствие и основная информация
- `/help` - справка по использованию
- `/menu` - главное меню

### Примеры запросов:

- "лаванда" - информация о лаванде
- "нужна энергия" - рекомендации для бодрости
- "музыка для расслабления" - музыкальные советы
- "подписаться" - подписка на уведомления

## 🛠️ Разработка

### Установка зависимостей для разработки:

```bash
npm install
```

### Запуск в режиме разработки:

```bash
npm run dev
```

### Тестирование:

```bash
npm test
```

### Линтинг:

```bash
npm run lint
```

## 📦 Развертывание

### Локальное развертывание:

1. Установите Node.js (версия 18+)
2. Клонируйте репозиторий
3. Установите зависимости: `npm install`
4. Настройте переменные окружения
5. Запустите: `npm start`

### Развертывание на сервере:

#### Используя PM2:

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start src/index.js --name "aroma-bot"

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

#### Используя Docker:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Сборка и запуск
docker build -t aroma-bot .
docker run -p 3000:3000 --env-file .env aroma-bot
```

#### Автоматическое развертывание:
```bash
./deploy.sh
```

#### Развертывание на Railway:
```bash
# Подключите репозиторий к Railway
# См. docs/railway-deployment.md для подробностей
```

## 🔒 Безопасность

- Все API ключи хранятся в переменных окружения
- Используется rate limiting для защиты от спама
- Валидация всех входящих данных
- Логирование всех действий для мониторинга

## 📊 Мониторинг

Приложение включает:

- Health check endpoint: `GET /health`
- Подробное логирование всех действий
- Обработка ошибок с graceful shutdown
- Метрики производительности

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для подробностей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте раздел "Быстрый старт"
2. Убедитесь, что все переменные окружения настроены
3. Проверьте логи приложения
4. Создайте Issue в репозитории

---

**Приятного использования ароматерапии! 🌿✨** 