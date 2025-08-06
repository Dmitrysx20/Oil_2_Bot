# 🌿 Aroma Helper Bot

[![Node.js CI](https://github.com/YOUR_USERNAME/aroma-helper-bot/workflows/Test%20and%20Deploy/badge.svg)](https://github.com/YOUR_USERNAME/aroma-helper-bot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue.svg)](https://t.me/your_bot_username)

> Telegram бот для консультаций по ароматерапии с эфирными маслами. Предоставляет научно обоснованные рекомендации, информацию о маслах и музыкальные советы.

## ✨ Особенности

- 🔍 **Умный поиск масел** - находит информацию о любом эфирном масле
- 🤖 **AI-рекомендации** - персональные советы на основе настроения
- 🎵 **Музыкальные рекомендации** - подбор музыки для ароматерапии
- 📱 **Система подписок** - ежедневные уведомления с советами
- 💬 **Умный роутер** - автоматическое определение типа запроса
- 🔒 **Безопасность** - rate limiting, валидация данных
- 📊 **Мониторинг** - health checks и подробное логирование

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Telegram Bot Token
- OpenAI API Key
- Supabase проект

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/YOUR_USERNAME/aroma-helper-bot.git
cd aroma-helper-bot

# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл

# Запуск в режиме разработки
npm run dev
```

### Настройка переменных окружения

Создайте файл `.env` со следующими переменными:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_key_here

# Server
PORT=3000
NODE_ENV=development
```

## 📁 Структура проекта

```
aroma-helper-bot/
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
├── docs/                     # Документация
├── workflows/                # Рабочие процессы
└── data/                     # Данные
```

## 🔧 Использование

### Команды бота

- `/start` - приветствие и основная информация
- `/help` - справка по использованию
- `/menu` - главное меню

### Примеры запросов

- `лаванда` - информация о лаванде
- `нужна энергия` - рекомендации для бодрости
- `музыка для расслабления` - музыкальные советы
- `подписаться` - подписка на уведомления

## 🛠️ Разработка

### Установка зависимостей для разработки

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Тестирование

```bash
npm test
```

### Линтинг

```bash
npm run lint
```

## 📦 Развертывание

### Локальное развертывание

```bash
npm start
```

### Docker развертывание

```bash
# Сборка образа
docker build -t aroma-bot .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env aroma-bot
```

### Docker Compose

```bash
docker-compose up -d
```

### PM2 для продакшена

```bash
npm install -g pm2
pm2 start src/index.js --name "aroma-bot"
pm2 save
pm2 startup
```

### Автоматическое развертывание

```bash
./deploy.sh
```

## 🧪 Тестирование

### Запуск тестов

```bash
npm test
```

### Тестирование модулей

```bash
node test.js
```

### Проверка health check

```bash
curl http://localhost:3000/health
```

## 📊 API Endpoints

### Health Check
```
GET /health
```

### Telegram Webhook
```
POST /webhook
```

## 🔒 Безопасность

- Все API ключи хранятся в переменных окружения
- Rate limiting для защиты от спама
- Валидация всех входящих данных
- Логирование всех действий для мониторинга

## 📈 Мониторинг

Приложение включает:

- Health check endpoint: `GET /health`
- Подробное логирование всех действий
- Обработка ошибок с graceful shutdown
- Метрики производительности

## 🤝 Вклад в проект

Мы приветствуем вклады! Пожалуйста, ознакомьтесь с нашим руководством по вкладам:

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

### Соглашения по коммитам

Мы используем [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## 🙏 Благодарности

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API
- [OpenAI](https://openai.com/) - AI модели
- [Supabase](https://supabase.com/) - База данных
- [Express.js](https://expressjs.com/) - Веб-фреймворк

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [документацию](docs/)
2. Создайте [Issue](https://github.com/YOUR_USERNAME/aroma-helper-bot/issues)
3. Обратитесь к [руководству по миграции](docs/migration-guide.md)

## 🌟 Звезды

Если этот проект вам помог, поставьте звезду! ⭐

---

**Приятного использования ароматерапии! 🌿✨** 