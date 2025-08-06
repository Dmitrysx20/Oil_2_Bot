#!/bin/bash

# Подавляем предупреждения о устаревших модулях
export NODE_NO_WARNINGS=1
export NODE_OPTIONS="--no-deprecation --no-warnings"

# Запускаем приложение
node app.js 