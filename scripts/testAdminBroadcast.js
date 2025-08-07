const AdminService = require('../src/services/AdminService');
const AdminSettingsService = require('../src/services/AdminSettingsService');
const logger = require('../src/utils/logger');

async function testAdminBroadcast() {
  console.log('🛡️ Тестирование админских рассылок\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const adminSettingsService = new AdminSettingsService();
  const adminService = new AdminService();
  
  // ID админа (замените на реальный)
  const adminChatId = 802895688;
  
  // Тест 1: Проверка доступа к админским функциям
  console.log('📋 ТЕСТ 1: Проверка админских прав');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const accessCheck = await adminService.checkAdminAccess(adminChatId);
    console.log(`👤 Chat ID: ${adminChatId}`);
    console.log(`🛡️ Админ: ${accessCheck.isAdmin ? '✅ ДА' : '❌ НЕТ'}`);
    console.log(`🔐 Права: ${accessCheck.hasPermission ? '✅ ЕСТЬ' : '❌ НЕТ'}`);
    
    if (accessCheck.permissions) {
      console.log(`📋 Разрешения: ${accessCheck.permissions.join(', ')}`);
    }
    
    if (!accessCheck.isAdmin) {
      console.log('⚠️ Пользователь не является админом. Добавьте его в список админов.');
      return;
    }
  } catch (error) {
    console.log(`❌ Ошибка проверки прав: ${error.message}`);
    return;
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 2: Проверка настроек рассылок
  console.log('📋 ТЕСТ 2: Настройки рассылок');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const broadcastEnabled = await adminSettingsService.isBroadcastEnabled(adminChatId);
    console.log(`📢 Рассылки включены: ${broadcastEnabled ? '✅ ДА' : '❌ НЕТ'}`);
    
    if (!broadcastEnabled) {
      console.log('⚠️ Рассылки отключены. Включите их в настройках.');
    }
  } catch (error) {
    console.log(`❌ Ошибка проверки настроек: ${error.message}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 3: Создание меню рассылки
  console.log('📋 ТЕСТ 3: Меню создания рассылки');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const broadcastMenu = adminService.generateBroadcastCreator(adminChatId);
    
    console.log('📋 Сообщение:');
    console.log(broadcastMenu.message);
    
    console.log('\n🔘 Кнопки:');
    if (broadcastMenu.keyboard && broadcastMenu.keyboard.length > 0) {
      broadcastMenu.keyboard.forEach((row, i) => {
        console.log(`   Ряд ${i + 1}: ${row.map(b => b.text).join(' | ')}`);
      });
    }
    
    console.log(`\n📊 Данные: action=${broadcastMenu.action}, step=${broadcastMenu.broadcastStep}`);
    
  } catch (error) {
    console.log(`❌ Ошибка создания меню: ${error.message}`);
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 4: Симуляция создания рассылки
  console.log('📋 ТЕСТ 4: Симуляция создания рассылки');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testMessage = `👋 Привет сообществу любителей эфирных масел! 🌿

🌺 **Новости недели:**
• Добавлены новые масла в базу данных
• Улучшена система рекомендаций
• Исправлены грамматические ошибки

💡 **Совет дня:**
Попробуйте смесь лаванды и мяты для вечернего релакса!

🎵 **Музыкальная рекомендация:**
Слушайте расслабляющие плейлисты для ароматерапии

Спасибо, что вы с нами! 🙏

#ароматерапия #эфирныемасла #здоровье`;
  
  console.log('📝 Тестовое сообщение для рассылки:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(testMessage);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log(`\n📊 Статистика сообщения:`);
  console.log(`   • Символов: ${testMessage.length}`);
  console.log(`   • Строк: ${testMessage.split('\n').length}`);
  console.log(`   • Эмодзи: ${(testMessage.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length}`);
  
  if (testMessage.length > 4096) {
    console.log('⚠️ Сообщение слишком длинное для Telegram (>4096 символов)');
  } else {
    console.log('✅ Сообщение подходит для отправки');
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Тест 5: Проверка обработки callback
  console.log('📋 ТЕСТ 5: Обработка админских callback');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testCallbacks = [
    'admin_broadcast',
    'broadcast_templates',
    'admin_panel'
  ];
  
  for (const callback of testCallbacks) {
    try {
      console.log(`\n🔘 Тестируем callback: ${callback}`);
      const result = await adminService.handleCallbackAction(callback, adminChatId);
      
      if (result) {
        console.log(`   ✅ Обработан успешно`);
        console.log(`   📋 Action: ${result.action}`);
        console.log(`   📝 Сообщение: ${result.message.substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Не обработан`);
      }
    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`);
    }
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Рекомендации
  console.log('💡 РЕКОМЕНДАЦИИ ПО РАССЫЛКАМ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('📢 **Лучшие практики:**');
  console.log('   • Используйте эмодзи для привлечения внимания');
  console.log('   • Добавляйте полезную информацию');
  console.log('   • Включайте призывы к действию');
  console.log('   • Не спамьте - отправляйте 1-2 раза в неделю');
  
  console.log('\n🎯 **Идеи для рассылок:**');
  console.log('   • "Масло недели" - подробный обзор одного масла');
  console.log('   • "Рецепт дня" - смеси масел для разных целей');
  console.log('   • "Совет эксперта" - профессиональные рекомендации');
  console.log('   • "Новости ароматерапии" - интересные факты');
  
  console.log('\n⚠️ **Важные моменты:**');
  console.log('   • Всегда тестируйте сообщения перед отправкой');
  console.log('   • Соблюдайте лимит в 4096 символов');
  console.log('   • Используйте Markdown для форматирования');
  console.log('   • Уважайте время пользователей');
  
  console.log('\n✅ Тестирование админских рассылок завершено!');
}

// Запускаем тест
if (require.main === module) {
  testAdminBroadcast().catch(console.error);
}

module.exports = { testAdminBroadcast }; 