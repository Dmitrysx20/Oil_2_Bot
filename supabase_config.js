// 🔧 КОНФИГУРАЦИЯ SUPABASE С ИГНОРИРОВАНИЕМ ПРЕДУПРЕЖДЕНИЙ
// Решение проблемы с предупреждениями о Node.js версии

// Принудительное игнорирование предупреждений Node.js
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env.SUPPRESS_DEPRECATION_WARNINGS = 'y';

// Перехват предупреждений о Node.js версии
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  
  // Игнорируем предупреждения о Node.js версии
  if (message.includes('Node.js 18 and below are deprecated') || 
      message.includes('upgrade to Node.js 20 or later')) {
    console.log('🔧 Предупреждение о Node.js версии проигнорировано');
    return;
  }
  
  // Пропускаем остальные предупреждения
  originalWarn.apply(console, args);
};

// Конфигурация Supabase с игнорированием предупреждений
const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
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
        'X-Node-Version': process.version,
        'X-Railway-Environment': process.env.RAILWAY_ENVIRONMENT || 'production'
      }
    }
  }
};

// Создание клиента Supabase
const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey,
  supabaseConfig.options
);

// Функция для проверки подключения
async function testSupabaseConnection() {
  try {
    console.log('🔗 Тестирование подключения к Supabase...');
    console.log(`📊 Node.js версия: ${process.version}`);
    console.log(`🔗 Supabase URL: ${supabaseConfig.supabaseUrl ? 'Настроен' : 'НЕ НАСТРОЕН'}`);
    
    if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseKey) {
      return {
        success: false,
        error: 'Отсутствуют переменные окружения Supabase',
        recommendations: [
          'Добавьте SUPABASE_URL в Railway Dashboard',
          'Добавьте SUPABASE_ANON_KEY в Railway Dashboard'
        ]
      };
    }
    
    // Простой тест подключения
    const { data, error } = await supabase.from('subscribers').select('count').limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message,
        recommendations: [
          'Проверьте правильность API ключей',
          'Убедитесь, что проект активен в Supabase'
        ]
      };
    }
    
    return {
      success: true,
      message: 'Supabase подключен успешно',
      nodeVersion: process.version,
      supabaseVersion: '2.39.0'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      recommendations: [
        'Проверьте подключение к интернету',
        'Убедитесь, что Supabase проект активен'
      ]
    };
  }
}

// Функция для получения клиента Supabase
function getSupabaseClient() {
  return supabase;
}

// Функция для получения конфигурации
function getSupabaseConfig() {
  return supabaseConfig;
}

// Экспорт функций
module.exports = {
  supabase,
  testSupabaseConnection,
  getSupabaseClient,
  getSupabaseConfig,
  supabaseConfig
};

// Автоматический тест при импорте (только в development)
if (process.env.NODE_ENV === 'development') {
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase конфигурация загружена успешно');
    } else {
      console.log('❌ Ошибка конфигурации Supabase:', result.error);
    }
  });
} 