// 🔗 ТЕСТ ПОДКЛЮЧЕНИЯ К SUPABASE
// Проверяем, работает ли подключение к базе данных

console.log('🔗 Тестирование подключения к Supabase...\n');

// Проверяем переменные окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('📋 Проверка переменных окружения:');
console.log('=====================================');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Настроен' : '❌ НЕ НАСТРОЕН'}`);
console.log(`SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Настроен' : '❌ НЕ НАСТРОЕН'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Переменные окружения не настроены!');
  console.log('🔧 Для локальной разработки:');
  console.log('1. Скопируйте переменные из Railway Dashboard');
  console.log('2. Добавьте их в файл .env');
  console.log('3. Или используйте Railway CLI: railway variables');
  process.exit(1);
}

// Тестируем подключение к Supabase
async function testSupabaseConnection() {
  try {
    console.log('\n🔗 Подключение к Supabase...');
    
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    
    // Тестируем простой запрос
    console.log('📊 Тестирование запроса к базе данных...');
    
    const { data, error } = await supabase
      .from('oils')
      .select('oil_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Ошибка подключения к Supabase:');
      console.log('   Ошибка:', error.message);
      console.log('   Код:', error.code);
      console.log('   Детали:', error.details);
      return false;
    }
    
    console.log('✅ Подключение к Supabase успешно!');
    console.log(`📊 Найдено записей: ${data ? data.length : 0}`);
    
    if (data && data.length > 0) {
      console.log('📝 Пример данных:', data[0]);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка при тестировании:');
    console.log('   Ошибка:', error.message);
    return false;
  }
}

// Запускаем тест
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase подключен и работает!');
    console.log('✅ Бот готов к работе с базой данных');
  } else {
    console.log('\n❌ Проблемы с подключением к Supabase');
    console.log('🔧 Проверьте:');
    console.log('   - Правильность URL и ключа');
    console.log('   - Доступность Supabase проекта');
    console.log('   - Настройки безопасности в Supabase');
  }
});
