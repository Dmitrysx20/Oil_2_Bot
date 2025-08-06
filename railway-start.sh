#!/bin/bash

# Устанавливаем переменные окружения для подавления предупреждений
export NODE_NO_WARNINGS=1
export NODE_OPTIONS="--no-deprecation --no-warnings"

# Запускаем приложение
exec node --no-deprecation app.js 