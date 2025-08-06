# 🐙 НАСТРОЙКА GITHUB РЕПОЗИТОРИЯ

## 📋 Что нужно сделать

### 1. Создайте репозиторий на GitHub
1. Перейдите на [GitHub](https://github.com)
2. Нажмите **New repository**
3. Название: `essential-oils-bot`
4. Описание: `Telegram bot for essential oils recommendations`
5. Выберите **Public** или **Private**
6. **НЕ** ставьте галочки на README, .gitignore, license (мы уже создали)

### 2. Инициализируйте локальный репозиторий
```bash
# В папке вашего проекта
git init
git add .
git commit -m "Initial commit: Essential Oils Bot with Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/essential-oils-bot.git
git push -u origin main
```

### 3. Настройте GitHub Secrets для Railway

В вашем GitHub репозитории:
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Добавьте следующие secrets:

#### 🔑 Railway Secrets
```
RAILWAY_TOKEN=your-railway-token
RAILWAY_SERVICE_ID=7fdadcef-a299-4b5c-9bd9-4fcb3494cfd2
RAILWAY_URL=https://your-app.railway.app
```

### 4. Получите Railway Token
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в Railway
railway login

# Получите токен
railway whoami
```

## 🚀 Автоматический деплой

После настройки GitHub Actions:
- При каждом push в `main` или `master` происходит автоматический деплой
- Тесты запускаются перед деплоем
- Health check выполняется после деплоя

## 📊 GitHub Features

### 1. Issues
Создавайте issues для:
- 🐛 Баги и ошибки
- 💡 Новые функции
- 📚 Документация
- 🔧 Улучшения

### 2. Pull Requests
Для внесения изменений:
1. Создайте новую ветку
2. Внесите изменения
3. Создайте Pull Request
4. Дождитесь review и merge

### 3. Actions
GitHub Actions автоматически:
- ✅ Запускают тесты
- 🚀 Деплоят на Railway
- 🔍 Проверяют health
- 📊 Показывают статус

## 🔧 Настройка Railway с GitHub

### 1. Подключите GitHub к Railway
1. Откройте [Railway Dashboard](https://railway.com/project/db239086-d307-47e7-9c39-871df85a6403)
2. Перейдите в **Settings** → **GitHub**
3. Подключите ваш GitHub аккаунт
4. Выберите репозиторий `essential-oils-bot`

### 2. Настройте переменные окружения
В Railway Dashboard добавьте:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BOT_TOKEN=your-bot-token
ADMIN_CHAT_ID=802895688
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

## 📈 Мониторинг

### GitHub
- **Actions**: Статус деплоев
- **Issues**: Проблемы и задачи
- **Pull Requests**: Изменения кода
- **Insights**: Статистика репозитория

### Railway
- **Deployments**: История деплоев
- **Logs**: Логи приложения
- **Metrics**: Производительность
- **Variables**: Переменные окружения

## 🔍 Проверка настройки

### 1. Тест GitHub Actions
```bash
# Сделайте небольшое изменение
echo "# Test" >> README.md
git add README.md
git commit -m "Test GitHub Actions"
git push
```

### 2. Проверьте Actions
1. Перейдите в **Actions** в GitHub
2. Убедитесь, что workflow запустился
3. Проверьте, что деплой прошел успешно

### 3. Проверьте Railway
1. Откройте Railway Dashboard
2. Убедитесь, что новый деплой появился
3. Проверьте логи на ошибки

## 🛠️ Устранение проблем

### GitHub Actions не запускаются
1. Проверьте права доступа к репозиторию
2. Убедитесь, что workflow файл в `.github/workflows/`
3. Проверьте синтаксис YAML

### Railway деплой не работает
1. Проверьте Railway Token в GitHub Secrets
2. Убедитесь, что Service ID правильный
3. Проверьте переменные окружения в Railway

### Тесты не проходят
1. Запустите тесты локально: `npm test`
2. Проверьте зависимости в `package.json`
3. Убедитесь, что Node.js версия 20+

## 📝 Полезные команды

```bash
# Проверка статуса
git status

# Добавление файлов
git add .

# Commit изменений
git commit -m "Описание изменений"

# Push в GitHub
git push

# Создание новой ветки
git checkout -b feature/new-feature

# Переключение на main
git checkout main

# Обновление с GitHub
git pull origin main
```

## 🎯 Итоговая проверка

После настройки у вас должно быть:

✅ **GitHub репозиторий** с кодом
✅ **GitHub Actions** для автоматического деплоя
✅ **Railway проект** с переменными окружения
✅ **Автоматический деплой** при push в main
✅ **Health check** после деплоя
✅ **Мониторинг** в GitHub и Railway

---

**Статус**: ⏳ Ожидает настройки GitHub репозитория
**Следующий шаг**: Создание репозитория на GitHub и настройка Actions 