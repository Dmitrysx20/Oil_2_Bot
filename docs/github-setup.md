# 🚀 Настройка GitHub репозитория

## Создание репозитория на GitHub

### Шаг 1: Создайте новый репозиторий

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите кнопку "New" или "+" в правом верхнем углу
3. Выберите "New repository"
4. Заполните форму:
   - **Repository name**: `aroma-helper-bot`
   - **Description**: `Telegram bot for aromatherapy consultations with essential oils`
   - **Visibility**: Public или Private (по вашему выбору)
   - **Initialize with**: НЕ ставьте галочки (у нас уже есть файлы)
5. Нажмите "Create repository"

### Шаг 2: Подключите локальный репозиторий

После создания репозитория GitHub покажет инструкции. Выполните следующие команды:

```bash
# Добавьте удаленный репозиторий
git remote add origin https://github.com/Dmitrysx20/Oil_Bot.git

# Переименуйте основную ветку в main (если нужно)
git branch -M main

# Отправьте код в GitHub
git push -u origin main
```

### Шаг 3: Настройка GitHub Pages (опционально)

Если хотите создать сайт документации:

1. Перейдите в Settings репозитория
2. Прокрутите до раздела "Pages"
3. В "Source" выберите "Deploy from a branch"
4. Выберите ветку "main" и папку "/docs"
5. Нажмите "Save"

### Шаг 4: Настройка Actions (опционально)

Создайте файл `.github/workflows/deploy.yml` для автоматического развертывания:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to server
      run: |
        # Здесь команды для развертывания на ваш сервер
        echo "Deploying to server..."
```

## Полезные команды Git

```bash
# Проверить статус
git status

# Посмотреть изменения
git diff

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Отправить изменения
git push

# Получить изменения
git pull

# Создать новую ветку
git checkout -b feature-name

# Переключиться на ветку
git checkout branch-name

# Посмотреть историю коммитов
git log --oneline
```

## Настройка SSH ключей (рекомендуется)

### Генерация SSH ключа:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### Добавление ключа в GitHub:

1. Скопируйте публичный ключ:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Перейдите в GitHub Settings → SSH and GPG keys
3. Нажмите "New SSH key"
4. Вставьте ключ и сохраните

### Использование SSH вместо HTTPS:

```bash
git remote set-url origin git@github.com:Dmitrysx20/Oil_Bot.git
```

## Настройка GitHub Secrets

Для безопасного хранения переменных окружения:

1. Перейдите в Settings репозитория → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Добавьте секреты:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## Полезные GitHub функции

### Issues
- Создавайте issues для багов и новых функций
- Используйте labels для категоризации
- Назначайте assignees

### Projects
- Создайте проект для управления задачами
- Используйте Kanban доску для отслеживания прогресса

### Wiki
- Создайте wiki для дополнительной документации
- Добавьте инструкции по установке и использованию

### Releases
- Создавайте releases для новых версий
- Добавляйте changelog и бинарные файлы

## Примеры коммитов

```bash
git commit -m "feat: add oil search functionality"
git commit -m "fix: resolve webhook parsing issue"
git commit -m "docs: update README with deployment instructions"
git commit -m "refactor: improve error handling in AI service"
git commit -m "test: add unit tests for smart router"
```

## Соглашения по именованию

- **feat**: новая функция
- **fix**: исправление бага
- **docs**: изменения в документации
- **style**: форматирование кода
- **refactor**: рефакторинг кода
- **test**: добавление тестов
- **chore**: обновление зависимостей, конфигурации

---

**Удачи с настройкой GitHub! 🚀** 