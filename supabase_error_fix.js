// 🔧 ДИАГНОСТИКА И ИСПРАВЛЕНИЕ ОШИБКИ SUPABASE КЛИЕНТА
// Ошибка: "at new SupabaseClient"

console.log('🔧 Диагностика ошибки Supabase клиента...\n');

// Проверка переменных окружения
const requiredEnvVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'NODE_ENV': process.env.NODE_ENV,
  'RAILWAY_ENVIRONMENT': process.env.RAILWAY_ENVIRONMENT
};

console.log('📋 Проверка переменных окружения:');
console.log('=====================================');

let missingVars = [];
let validVars = [];

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') ? '***' + value.slice(-4) : value}`);
    validVars.push(key);
  } else {
    console.log(`❌ ${key}: НЕ НАСТРОЕН`);
    missingVars.push(key);
  }
});

console.log('\n📊 Результаты проверки:');
console.log('========================');
console.log(`✅ Настроено переменных: ${validVars.length}/${Object.keys(requiredEnvVars).length}`);
console.log(`❌ Отсутствует переменных: ${missingVars.length}`);

// Диагностика ошибки SupabaseClient
console.log('\n🔍 Диагностика ошибки SupabaseClient:');
console.log('=====================================');

if (missingVars.includes('SUPABASE_URL') || missingVars.includes('SUPABASE_ANON_KEY')) {
  console.log('❌ ОШИБКА: Отсутствуют обязательные переменные Supabase');
  console.log('   Это вызывает ошибку "at new SupabaseClient"');
  
  console.log('\n🔧 РЕШЕНИЕ:');
  console.log('============');
  console.log('1. Добавьте переменные в Railway Dashboard:');
  console.log('   - SUPABASE_URL=https://your-project.supabase.co');
  console.log('   - SUPABASE_ANON_KEY=your-anon-key');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  
  console.log('\n2. Получите ключи из Supabase Dashboard:');
  console.log('   - Откройте https://supabase.com/dashboard');
  console.log('   - Выберите ваш проект');
  console.log('   - Settings → API');
  console.log('   - Скопируйте Project URL и anon public key');
  
  console.log('\n3. Перезапустите деплой после добавления переменных');
} else {
  console.log('✅ Все переменные Supabase настроены');
  console.log('🔍 Проверяем подключение...');
  
  // Тест подключения к Supabase
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    
    console.log('✅ Supabase клиент создан успешно');
    console.log(`📊 URL: ${process.env.SUPABASE_URL}`);
    console.log(`🔑 Key: ***${process.env.SUPABASE_ANON_KEY.slice(-4)}`);
    
  } catch (error) {
    console.log('❌ Ошибка создания Supabase клиента:', error.message);
    console.log('\n🔧 Возможные причины:');
    console.log('1. Неправильный формат URL или ключа');
    console.log('2. Проект Supabase неактивен');
    console.log('3. Проблемы с сетью');
  }
}

// Проверка формата переменных
console.log('\n🔍 Проверка формата переменных:');
console.log('=====================================');

if (process.env.SUPABASE_URL) {
  if (!process.env.SUPABASE_URL.includes('supabase.co')) {
    console.log('⚠️  SUPABASE_URL не похож на валидный URL Supabase');
  } else {
    console.log('✅ SUPABASE_URL формат корректен');
  }
}

if (process.env.SUPABASE_ANON_KEY) {
  if (!process.env.SUPABASE_ANON_KEY.startsWith('eyJ')) {
    console.log('⚠️  SUPABASE_ANON_KEY не похож на валидный JWT токен');
  } else {
    console.log('✅ SUPABASE_ANON_KEY формат корректен');
  }
}

// Рекомендации
console.log('\n📝 РЕКОМЕНДАЦИИ:');
console.log('==================');

if (missingVars.length > 0) {
  console.log('🔧 Необходимые действия:');
  console.log('1. Добавьте отсутствующие переменные в Railway Dashboard');
  console.log('2. Убедитесь, что Supabase проект активен');
  console.log('3. Проверьте правильность API ключей');
  console.log('4. Перезапустите деплой после настройки');
} else {
  console.log('✅ Все переменные настроены');
  console.log('🔍 Проверьте логи Railway на другие ошибки');
}

// Экспорт для использования в других скриптах
module.exports = {
  requiredEnvVars,
  missingVars,
  validVars,
  hasAllRequiredVars: missingVars.length === 0
};

console.log('\n🎯 Статус: ' + (missingVars.length === 0 ? '✅ ГОТОВ' : '❌ ТРЕБУЕТ НАСТРОЙКИ')); 