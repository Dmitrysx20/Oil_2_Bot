#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../src/utils/logger');
const fs = require('fs');
const path = require('path');

async function testAdminSettingsMigrations() {
  console.log('🗄️ Тестирование миграций админских настроек...\n');

  // Проверка конфигурации
  console.log('📋 Проверка конфигурации');
  console.log('─'.repeat(50));
  
  const hasSupabase = config.supabase.url && config.supabase.key;
  
  if (!hasSupabase) {
    console.log('⚠️ Supabase credentials not configured');
    console.log('💡 Установите SUPABASE_URL и SUPABASE_ANON_KEY для полного тестирования');
    console.log('📝 Будет выполнена проверка файлов и структуры');
  } else {
    console.log('✅ Supabase credentials found');
    console.log(`🔗 URL: ${config.supabase.url}`);
    console.log(`🔑 Key: ${config.supabase.key.substring(0, 20)}...`);
  }

  // Тест 1: Проверка файлов миграций
  console.log('\n📋 Тест 1: Проверка файлов миграций');
  console.log('─'.repeat(50));
  
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = [
    '001_create_subscribers_table.sql',
    '002_update_subscribers_schema.sql',
    '003_create_admin_settings_table.sql'
  ];
  
  let allFilesExist = true;
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} существует`);
      
      // Проверяем содержимое файла миграции админских настроек
      if (file === '003_create_admin_settings_table.sql') {
        const content = fs.readFileSync(filePath, 'utf8');
        const checks = [
          { name: 'CREATE TABLE admin_settings', found: content.includes('CREATE TABLE public.admin_settings') },
          { name: 'admin_chat_id bigint', found: content.includes('admin_chat_id bigint') },
          { name: 'bot_settings jsonb', found: content.includes('bot_settings jsonb') },
          { name: 'daily_stats jsonb', found: content.includes('daily_stats jsonb') },
          { name: 'created_at timestamp', found: content.includes('created_at timestamp') },
          { name: 'updated_at timestamp', found: content.includes('updated_at timestamp') },
          { name: 'PRIMARY KEY', found: content.includes('PRIMARY KEY') },
          { name: 'Индекс admin_chat_id', found: content.includes('idx_admin_settings_chat_id') },
          { name: 'Триггер updated_at', found: content.includes('update_admin_settings_updated_at') },
          { name: 'Функция update_updated_at_column', found: content.includes('update_updated_at_column') },
          { name: 'Комментарии к таблице', found: content.includes('COMMENT ON TABLE') }
        ];
        
        console.log('📋 Проверка содержимого миграции:');
        checks.forEach(check => {
          console.log(`   ${check.name}: ${check.found ? '✅' : '❌'}`);
        });
        
        // Проверяем размер файла
        const stats = fs.statSync(filePath);
        console.log(`📏 Размер файла: ${stats.size} байт`);
        
        if (stats.size < 1000) {
          console.log('⚠️ Файл слишком маленький, возможно неполный');
        }
      }
    } else {
      console.log(`❌ ${file} не найден`);
      allFilesExist = false;
    }
  }

  // Тест 2: Проверка скрипта запуска миграций
  console.log('\n📋 Тест 2: Проверка скрипта запуска миграций');
  console.log('─'.repeat(50));
  
  const runMigrationsPath = path.join(migrationsDir, 'run.js');
  if (fs.existsSync(runMigrationsPath)) {
    console.log('✅ Скрипт run.js существует');
    
    const content = fs.readFileSync(runMigrationsPath, 'utf8');
    const checks = [
      { name: 'Подключение к Supabase', found: content.includes('createClient') },
      { name: 'Чтение файлов миграций', found: content.includes('readFileSync') },
      { name: 'Обработка ошибок', found: content.includes('try') && content.includes('catch') },
      { name: 'Логирование', found: content.includes('console.log') || content.includes('logger') },
      { name: 'Асинхронные функции', found: content.includes('async') }
    ];
    
    console.log('📋 Проверка содержимого скрипта:');
    checks.forEach(check => {
      console.log(`   ${check.name}: ${check.found ? '✅' : '❌'}`);
    });
    
    // Проверяем размер файла
    const stats = fs.statSync(runMigrationsPath);
    console.log(`📏 Размер файла: ${stats.size} байт`);
  } else {
    console.log('❌ Скрипт run.js не найден');
  }

  // Тест 3: Проверка структуры папки migrations
  console.log('\n📋 Тест 3: Проверка структуры папки migrations');
  console.log('─'.repeat(50));
  
  if (fs.existsSync(migrationsDir)) {
    console.log('✅ Папка migrations существует');
    
    const files = fs.readdirSync(migrationsDir);
    console.log(`📁 Файлов в папке: ${files.length}`);
    
    files.forEach(file => {
      const filePath = path.join(migrationsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   📄 ${file} (${stats.size} байт)`);
    });
  } else {
    console.log('❌ Папка migrations не найдена');
  }

  // Тест 4: Проверка конфигурации
  console.log('\n📋 Тест 4: Проверка конфигурации');
  console.log('─'.repeat(50));
  
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'не установлен'}`);
  console.log(`🔧 PORT: ${process.env.PORT || 'не установлен'}`);
  console.log(`🔧 SUPABASE_URL: ${config.supabase.url ? 'установлен' : 'не установлен'}`);
  console.log(`🔧 SUPABASE_ANON_KEY: ${config.supabase.key ? 'установлен' : 'не установлен'}`);
  console.log(`🔧 ADMIN_CHAT_IDS: ${config.admin.chatIds ? config.admin.chatIds.join(', ') : 'не установлены'}`);

  // Тест 5: Проверка подключения к базе данных (если настроен Supabase)
  if (hasSupabase) {
    console.log('\n📋 Тест 5: Проверка подключения к базе данных');
    console.log('─'.repeat(50));
    
    try {
      const supabase = createClient(config.supabase.url, config.supabase.key);
      
      const { data, error } = await supabase.from('admin_settings').select('count').limit(1);
      
      if (error) {
        console.log('❌ Ошибка подключения к базе данных:', error.message);
        console.log('💡 Убедитесь, что:');
        console.log('   1. Таблица admin_settings существует');
        console.log('   2. Миграции выполнены');
        console.log('   3. Права доступа настроены');
      } else {
        console.log('✅ Подключение к базе данных успешно');
        
        // Дополнительные тесты с базой данных
        console.log('\n📋 Тест 6: Проверка структуры таблицы');
        console.log('─'.repeat(50));
        
        try {
          const { data: tableData, error: tableError } = await supabase
            .from('admin_settings')
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log('❌ Ошибка при проверке структуры:', tableError.message);
          } else {
            console.log('✅ Структура таблицы доступна');
            
            if (tableData && tableData.length > 0) {
              const record = tableData[0];
              console.log('📋 Поля записи:');
              console.log(`   id: ${record.id ? '✅' : '❌'}`);
              console.log(`   admin_chat_id: ${record.admin_chat_id ? '✅' : '❌'}`);
              console.log(`   bot_settings: ${record.bot_settings ? '✅' : '❌'}`);
              console.log(`   daily_stats: ${record.daily_stats ? '✅' : '❌'}`);
              console.log(`   created_at: ${record.created_at ? '✅' : '❌'}`);
              console.log(`   updated_at: ${record.updated_at ? '✅' : '❌'}`);
            } else {
              console.log('⚠️ Таблица пуста - это нормально для новой установки');
            }
          }
        } catch (error) {
          console.log('❌ Ошибка при проверке структуры:', error.message);
        }
      }
    } catch (error) {
      console.log('❌ Критическая ошибка подключения:', error.message);
    }
  } else {
    console.log('\n📋 Тест 5: Пропущен (требует настройки Supabase)');
    console.log('─'.repeat(50));
    console.log('⚠️ Для тестирования подключения к базе данных настройте Supabase');
  }

  // Тест 6: Проверка синтаксиса SQL файлов
  console.log('\n📋 Тест 6: Проверка синтаксиса SQL файлов');
  console.log('─'.repeat(50));
  
  const adminSettingsMigrationPath = path.join(migrationsDir, '003_create_admin_settings_table.sql');
  if (fs.existsSync(adminSettingsMigrationPath)) {
    const content = fs.readFileSync(adminSettingsMigrationPath, 'utf8');
    
    const sqlChecks = [
      { name: 'CREATE TABLE', found: content.includes('CREATE TABLE') },
      { name: 'PRIMARY KEY', found: content.includes('PRIMARY KEY') },
      { name: 'CREATE INDEX', found: content.includes('CREATE INDEX') },
      { name: 'CREATE TRIGGER', found: content.includes('CREATE TRIGGER') },
      { name: 'CREATE OR REPLACE FUNCTION', found: content.includes('CREATE OR REPLACE FUNCTION') },
      { name: 'COMMENT ON', found: content.includes('COMMENT ON') },
      { name: 'Точка с запятой в конце', found: content.trim().endsWith(';') }
    ];
    
    console.log('📋 Проверка синтаксиса SQL:');
    sqlChecks.forEach(check => {
      console.log(`   ${check.name}: ${check.found ? '✅' : '❌'}`);
    });
    
    // Проверяем баланс скобок
    const openBrackets = (content.match(/\(/g) || []).length;
    const closeBrackets = (content.match(/\)/g) || []).length;
    console.log(`   Баланс скобок: ${openBrackets === closeBrackets ? '✅' : '❌'} (${openBrackets}/${closeBrackets})`);
  }

  console.log('\n✅ Тестирование миграций админских настроек завершено!');
  
  console.log('\n💡 Рекомендации по миграциям:');
  console.log('   1. Убедитесь, что все файлы миграций существуют');
  console.log('   2. Выполните миграции в Supabase Dashboard');
  console.log('   3. Проверьте права доступа к таблице admin_settings');
  console.log('   4. Настройте RLS политики если необходимо');
  console.log('   5. Проверьте работу функции initialize_admin_settings');
  console.log('   6. Убедитесь, что триггер updated_at работает');
  console.log('   7. Проверьте индексы для оптимизации запросов');
  
  if (!hasSupabase) {
    console.log('\n🔧 Для полного тестирования:');
    console.log('   1. Настройте SUPABASE_URL и SUPABASE_ANON_KEY');
    console.log('   2. Запустите тест повторно');
    console.log('   3. Проверьте подключение к базе данных');
  }
}

// Запуск теста
testAdminSettingsMigrations().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 