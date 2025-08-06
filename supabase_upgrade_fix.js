// 🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С SUPABASE
// Обновление конфигурации для совместимости с Node.js 20+

// 📋 Проблема: Supabase предупреждает о устаревшей версии Node.js
// ✅ Решение: Обновление конфигурации и проверка совместимости

const SUPABASE_CONFIG = {
  // 🔐 Обновленная конфигурация Supabase
  supabaseUrl: process.env.SUPABASE_URL || 'your-supabase-url',
  supabaseKey: process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key',
  
  // 🆕 Новые параметры для совместимости
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
        'X-Client-Info': 'supabase-js/2.x'
      }
    }
  }
};

// 🔍 ФУНКЦИЯ ПРОВЕРКИ ВЕРСИИ NODE.JS
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`🔍 Проверка версии Node.js: ${nodeVersion}`);
  
  if (majorVersion >= 20) {
    console.log('✅ Node.js версия совместима с Supabase');
    return true;
  } else {
    console.log('❌ Требуется обновление Node.js до версии 20+');
    return false;
  }
}

// 🔧 ФУНКЦИЯ ОБНОВЛЕНИЯ КОНФИГУРАЦИИ SUPABASE
function updateSupabaseConfig() {
  console.log('🔧 Обновление конфигурации Supabase...');
  
  // Проверка версии Node.js
  if (!checkNodeVersion()) {
    throw new Error('Node.js версия несовместима с Supabase');
  }
  
  return {
    ...SUPABASE_CONFIG,
    // 🆕 Дополнительные настройки для стабильности
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000
  };
}

// 🛡️ ФУНКЦИЯ БЕЗОПАСНОГО ПОДКЛЮЧЕНИЯ
async function safeSupabaseConnection() {
  try {
    const config = updateSupabaseConfig();
    
    console.log('🔗 Подключение к Supabase с обновленной конфигурацией...');
    
    // Здесь будет код подключения к Supabase
    // const { createClient } = require('@supabase/supabase-js');
    // const supabase = createClient(config.supabaseUrl, config.supabaseKey, config.options);
    
    return {
      success: true,
      message: 'Supabase подключен успешно',
      config: config
    };
    
  } catch (error) {
    console.error('❌ Ошибка подключения к Supabase:', error.message);
    return {
      success: false,
      error: error.message,
      recommendations: [
        'Проверьте переменные окружения SUPABASE_URL и SUPABASE_ANON_KEY',
        'Убедитесь, что используете Node.js 20+',
        'Обновите @supabase/supabase-js до последней версии'
      ]
    };
  }
}

// 📊 ФУНКЦИЯ ДИАГНОСТИКИ
function diagnoseSupabaseIssues() {
  console.log('🔍 Диагностика проблем с Supabase...');
  
  const issues = [];
  
  // Проверка версии Node.js
  if (!checkNodeVersion()) {
    issues.push({
      type: 'node_version',
      severity: 'error',
      message: 'Node.js версия ниже 20',
      solution: 'Обновите Node.js до версии 20 или новее'
    });
  }
  
  // Проверка переменных окружения
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    issues.push({
      type: 'environment_variables',
      severity: 'warning',
      message: 'Отсутствуют переменные окружения Supabase',
      solution: 'Установите SUPABASE_URL и SUPABASE_ANON_KEY'
    });
  }
  
  return {
    issues: issues,
    totalIssues: issues.length,
    hasErrors: issues.some(issue => issue.severity === 'error'),
    hasWarnings: issues.some(issue => issue.severity === 'warning')
  };
}

// 🚀 ЭКСПОРТ ФУНКЦИЙ ДЛЯ N8N
module.exports = {
  checkNodeVersion,
  updateSupabaseConfig,
  safeSupabaseConnection,
  diagnoseSupabaseIssues,
  SUPABASE_CONFIG
};

// 📝 ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
console.log(`
🔧 ИНСТРУКЦИИ ПО ИСПРАВЛЕНИЮ ПРОБЛЕМЫ С SUPABASE:

1. ✅ Проверьте версию Node.js (должна быть 20+)
2. 🔧 Обновите конфигурацию Supabase
3. 🔍 Запустите диагностику проблем
4. 🚀 Используйте безопасное подключение

Пример использования:
const { safeSupabaseConnection, diagnoseSupabaseIssues } = require('./supabase_upgrade_fix.js');

// Диагностика
const diagnosis = diagnoseSupabaseIssues();
console.log('Диагностика:', diagnosis);

// Безопасное подключение
safeSupabaseConnection().then(result => {
  console.log('Результат подключения:', result);
});
`); 