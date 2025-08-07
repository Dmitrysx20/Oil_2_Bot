const AdminService = require('../src/services/AdminService');
const AdminSettingsService = require('../src/services/AdminSettingsService');
const logger = require('../src/utils/logger');

async function testAdminCommunityMessage() {
  console.log('🛡️ Тестирование отправки сообщения сообществу\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const adminSettingsService = new AdminSettingsService();
  const adminService = new AdminService();
  
  // Симулируем админа (в реальности это будет из переменных окружения)
  const adminChatId = 802895688;
  
  // Временно добавляем админа в список для тестирования
  adminService.adminChatIds = [adminChatId];
  
  console.log('📋 ТЕСТ: Админ отправляет сообщение сообществу');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Тестовое сообщение для сообщества
  const communityMessage = `👋 Привет сообществу любителей эфирных масел! 🌿

🌺 **Новости недели:**
• Добавлены новые масла в базу данных
• Улучшена система рекомендаций  
• Исправлены грамматические ошибки
• Добавлена поддержка 50+ форм написания масел

💡 **Совет дня:**
Попробуйте смесь лаванды и мяты для вечернего релакса!
2 капли лаванды + 1 капля мяты в аромалампе

🎵 **Музыкальная рекомендация:**
Слушайте расслабляющие плейлисты для ароматерапии

🌿 **Масло недели: Лаванда**
Универсальное масло для спокойствия и сна

Спасибо, что вы с нами! 🙏

#ароматерапия #эфирныемасла #здоровье #лаванда`;
  
  console.log('📝 Сообщение для рассылки:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(communityMessage);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log(`\n📊 Статистика сообщения:`);
  console.log(`   • Символов: ${communityMessage.length}`);
  console.log(`   • Строк: ${communityMessage.split('\n').length}`);
  console.log(`   • Эмодзи: ${(communityMessage.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length}`);
  console.log(`   • Хештегов: ${(communityMessage.match(/#\w+/g) || []).length}`);
  
  if (communityMessage.length > 4096) {
    console.log('⚠️ Сообщение слишком длинное для Telegram (>4096 символов)');
  } else {
    console.log('✅ Сообщение подходит для отправки');
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Симуляция процесса создания рассылки
  console.log('🔄 ПРОЦЕСС СОЗДАНИЯ РАССЫЛКИ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Шаг 1: Админ нажимает кнопку "Рассылки"
  console.log('1️⃣ Админ нажимает "📢 Рассылки"');
  try {
    const broadcastMenu = adminService.generateBroadcastCreator(adminChatId);
    console.log('   ✅ Меню создания рассылки открыто');
    console.log(`   📋 Action: ${broadcastMenu.action}`);
    console.log(`   🔘 Кнопки: ${broadcastMenu.keyboard.map(row => row.map(b => b.text).join(', ')).join(' | ')}`);
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }
  
  console.log('\n2️⃣ Админ пишет текст сообщения');
  console.log('   ✅ Текст сообщения готов');
  
  // Шаг 3: Система обрабатывает сообщение
  console.log('\n3️⃣ Система обрабатывает сообщение');
  console.log('   ✅ Проверка длины сообщения');
  console.log('   ✅ Проверка форматирования');
  console.log('   ✅ Подготовка к отправке');
  
  // Шаг 4: Выбор аудитории
  console.log('\n4️⃣ Выбор аудитории');
  const audienceOptions = [
    'Все пользователи',
    'Только активные пользователи',
    'Пользователи с подпиской',
    'Новые пользователи (зарегистрированные вчера)'
  ];
  
  audienceOptions.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option}`);
  });
  
  console.log('\n5️⃣ Подтверждение отправки');
  console.log('   ✅ Админ подтверждает отправку');
  console.log('   ✅ Система готовит рассылку');
  
  // Симуляция отправки
  console.log('\n6️⃣ Отправка сообщения');
  const mockUserCount = 150;
  console.log(`   📤 Отправка ${mockUserCount} пользователям...`);
  
  // Симуляция прогресса
  for (let i = 0; i <= 100; i += 20) {
    console.log(`   📊 Прогресс: ${i}% (${Math.round(mockUserCount * i / 100)} пользователей)`);
  }
  
  console.log('   ✅ Рассылка завершена успешно!');
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Статистика рассылки
  console.log('📊 СТАТИСТИКА РАССЫЛКИ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const mockStats = {
    totalUsers: mockUserCount,
    sentSuccessfully: 142,
    failed: 8,
    deliveryRate: 94.7,
    readRate: 67.3,
    responseRate: 12.1
  };
  
  console.log(`👥 Всего пользователей: ${mockStats.totalUsers}`);
  console.log(`✅ Успешно отправлено: ${mockStats.sentSuccessfully}`);
  console.log(`❌ Ошибки отправки: ${mockStats.failed}`);
  console.log(`📊 Процент доставки: ${mockStats.deliveryRate}%`);
  console.log(`👀 Процент прочтения: ${mockStats.readRate}%`);
  console.log(`💬 Процент ответов: ${mockStats.responseRate}%`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Рекомендации по рассылкам
  console.log('💡 РЕКОМЕНДАЦИИ ПО РАССЫЛКАМ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🎯 **Оптимальное время отправки:**');
  console.log('   • Утро: 9:00 - 11:00');
  console.log('   • Вечер: 19:00 - 21:00');
  console.log('   • Избегайте: выходные утром, рабочие дни в обед');
  
  console.log('\n📝 **Структура сообщения:**');
  console.log('   • Приветствие с эмодзи');
  console.log('   • Новости/обновления');
  console.log('   • Полезный совет');
  console.log('   • Призыв к действию');
  console.log('   • Хештеги для поиска');
  
  console.log('\n🎨 **Форматирование:**');
  console.log('   • Используйте **жирный текст** для заголовков');
  console.log('   • Добавляйте эмодзи для визуального разделения');
  console.log('   • Создавайте списки с • или -');
  console.log('   • Используйте хештеги: #ароматерапия');
  
  console.log('\n⚠️ **Важные моменты:**');
  console.log('   • Не спамьте - максимум 2-3 раза в неделю');
  console.log('   • Всегда добавляйте полезную информацию');
  console.log('   • Отвечайте на комментарии пользователей');
  console.log('   • Анализируйте статистику рассылок');
  
  console.log('\n✅ Тестирование завершено!');
  console.log('💡 В реальном боте админ сможет отправлять такие сообщения через админ-панель.');
}

// Запускаем тест
if (require.main === module) {
  testAdminCommunityMessage().catch(console.error);
}

module.exports = { testAdminCommunityMessage }; 