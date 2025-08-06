const OilService = require('../src/services/OilService');
const config = require('../config');

console.log('🧪 Тестирование OilService');
console.log('='.repeat(50));

// Инициализация сервиса
const oilService = new OilService();

// Проверка конфигурации
console.log('\n📋 Проверка конфигурации:');
console.log('─'.repeat(30));

if (!config.supabase.url || !config.supabase.key) {
    console.log('⚠️ Supabase credentials not configured - будет использоваться mock режим');
    console.log('💡 Для полного тестирования установите SUPABASE_URL и SUPABASE_ANON_KEY');
} else {
    console.log('✅ Supabase credentials found - будет использоваться реальная база данных');
}

// Тест 1: Получение всех масел
console.log('\n📋 Тест 1: Получение всех масел');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getAllOils();
    if (result.success) {
        console.log(`✅ Получено ${result.data.length} масел`);
        result.data.forEach((oil, index) => {
            console.log(`   ${index + 1}. ${oil.oil_name}`);
        });
    } else {
        console.log(`❌ Ошибка: ${result.error}`);
    }
})();

// Тест 2: Поиск масел
console.log('\n📋 Тест 2: Поиск масел');
console.log('─'.repeat(30));

(async () => {
    const searchQueries = ['мята', 'лаванда', 'эвкалипт', 'сон', 'головная боль'];
    
    for (const query of searchQueries) {
        console.log(`🔍 Поиск: "${query}"`);
        const result = await oilService.searchOils(query);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name} (релевантность: ${oil.relevance_score?.toFixed(2) || 'N/A'})`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 3: Получение случайного масла
console.log('\n📋 Тест 3: Получение случайного масла');
console.log('─'.repeat(30));

(async () => {
    for (let i = 0; i < 3; i++) {
        const result = await oilService.getRandomOil();
        if (result.success) {
            console.log(`✅ Случайное масло ${i + 1}: ${result.data.oil_name}`);
        } else {
            console.log(`❌ Ошибка: ${result.error}`);
        }
    }
})();

// Тест 4: Получение масел по эффекту
console.log('\n📋 Тест 4: Получение масел по эффекту');
console.log('─'.repeat(30));

(async () => {
    const effectTests = [
        { type: 'emotional', query: 'сон' },
        { type: 'emotional', query: 'стресс' },
        { type: 'physical', query: 'головная боль' },
        { type: 'physical', query: 'дыхание' }
    ];
    
    for (const test of effectTests) {
        console.log(`🔍 ${test.type === 'emotional' ? 'Эмоциональный' : 'Физический'} эффект: "${test.query}"`);
        const result = await oilService.getOilsByEffect(test.type, test.query);
        
        if (result.success) {
            console.log(`   ✅ Найдено ${result.data.length} масел`);
            result.data.forEach((oil, index) => {
                console.log(`      ${index + 1}. ${oil.oil_name} (релевантность: ${oil.relevance_score?.toFixed(2) || 'N/A'})`);
            });
        } else {
            console.log(`   ❌ Ошибка: ${result.error}`);
        }
        console.log('');
    }
})();

// Тест 5: Получение масла по названию
console.log('\n📋 Тест 5: Получение масла по названию');
console.log('─'.repeat(30));

(async () => {
    const oilNames = ['Мята перечная', 'Лаванда', 'Несуществующее масло'];
    
    for (const name of oilNames) {
        console.log(`🔍 Поиск масла: "${name}"`);
        const result = await oilService.getOilByName(name);
        
        if (result.success && result.data) {
            console.log(`   ✅ Найдено: ${result.data.oil_name}`);
            console.log(`      Описание: ${result.data.description}`);
            console.log(`      Эмоциональный эффект: ${result.data.emotional_effect}`);
        } else {
            console.log(`   ❌ Масло не найдено`);
        }
        console.log('');
    }
})();

// Тест 6: Добавление нового масла
console.log('\n📋 Тест 6: Добавление нового масла');
console.log('─'.repeat(30));

(async () => {
    const newOil = {
        oil_name: 'Розмарин',
        description: 'Стимулирующее масло с травяным ароматом',
        keywords: 'розмарин, память, концентрация, стимуляция',
        emotional_effect: 'Улучшает память и концентрацию',
        physical_effect: 'Стимулирует кровообращение, снимает мышечную боль',
        applications: 'Ингаляции, массаж, аромалампа',
        safety_warning: 'Не использовать при беременности и эпилепсии',
        joke: 'Розмарин такой умный, что даже растения у него консультируются!'
    };
    
    const result = await oilService.addOil(newOil);
    if (result.success) {
        console.log(`✅ Масло добавлено: ${result.data.oil_name}`);
        console.log(`   ID: ${result.data.id}`);
        console.log(`   Сообщение: ${result.message}`);
    } else {
        console.log(`❌ Ошибка добавления: ${result.error}`);
    }
})();

// Тест 7: Форматирование сообщений
console.log('\n📋 Тест 7: Форматирование сообщений');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getOilByName('Мята перечная');
    if (result.success && result.data) {
        console.log('📝 Полное сообщение:');
        console.log(oilService.formatOilMessage(result.data));
        console.log('\n📋 Краткий предпросмотр:');
        console.log(oilService.formatOilPreview(result.data));
    } else {
        console.log('❌ Не удалось получить масло для форматирования');
    }
})();

// Тест 8: Статистика масел
console.log('\n📋 Тест 8: Статистика масел');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getOilsStats();
    if (result.success) {
        console.log('📊 Статистика масел:');
        console.log(`   Всего масел: ${result.data.total_oils}`);
        console.log(`   Масла с шутками: ${result.data.oils_with_jokes}`);
        console.log(`   Масла с предупреждениями: ${result.data.oils_with_safety_warnings}`);
        console.log(`   Среднее количество ключевых слов: ${result.data.average_keywords_per_oil.toFixed(1)}`);
    } else {
        console.log(`❌ Ошибка получения статистики: ${result.error}`);
    }
})();

// Тест 9: Обновление масла
console.log('\n📋 Тест 9: Обновление масла');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getOilByName('Лаванда');
    if (result.success && result.data) {
        const updateData = {
            joke: 'Обновленная шутка: Лаванда теперь такая спокойная, что даже будильник просит у неё разрешения!'
        };
        
        const updateResult = await oilService.updateOil(result.data.id, updateData);
        if (updateResult.success) {
            console.log('✅ Масло обновлено');
            console.log(`   Сообщение: ${updateResult.message}`);
        } else {
            console.log(`❌ Ошибка обновления: ${updateResult.error}`);
        }
    } else {
        console.log('❌ Не удалось найти масло для обновления');
    }
})();

// Тест 10: Удаление масла
console.log('\n📋 Тест 10: Удаление масла');
console.log('─'.repeat(30));

(async () => {
    const result = await oilService.getOilByName('Розмарин');
    if (result.success && result.data) {
        const deleteResult = await oilService.deleteOil(result.data.id);
        if (deleteResult.success) {
            console.log('✅ Масло удалено');
            console.log(`   Сообщение: ${deleteResult.message}`);
        } else {
            console.log(`❌ Ошибка удаления: ${deleteResult.error}`);
        }
    } else {
        console.log('❌ Не удалось найти масло для удаления');
    }
})();

// Тест 11: Проверка mock данных
console.log('\n📋 Тест 11: Проверка mock данных');
console.log('─'.repeat(30));

const mockOils = oilService.getMockOils();
console.log(`✅ Mock данных: ${mockOils.length} масел`);
mockOils.forEach((oil, index) => {
    console.log(`   ${index + 1}. ${oil.oil_name}`);
    console.log(`      Ключевые слова: ${oil.keywords}`);
    console.log(`      Шутка: ${oil.joke ? '✅' : '❌'}`);
    console.log(`      Предупреждение: ${oil.safety_warning ? '✅' : '❌'}`);
});

// Тест 12: Проверка обработки ошибок
console.log('\n📋 Тест 12: Проверка обработки ошибок');
console.log('─'.repeat(30));

(async () => {
    // Тест с пустым запросом
    const emptyResult = await oilService.searchOils('');
    console.log(`🔍 Пустой поиск: ${emptyResult.success ? '✅' : '❌'}`);
    
    // Тест с несуществующим ID
    const invalidIdResult = await oilService.getOilById('invalid-id');
    console.log(`🔍 Несуществующий ID: ${invalidIdResult.success ? '✅' : '❌'}`);
    
    // Тест с неверным типом эффекта
    const invalidEffectResult = await oilService.getOilsByEffect('invalid', 'test');
    console.log(`🔍 Неверный тип эффекта: ${invalidEffectResult.success ? '✅' : '❌'}`);
})();

console.log('\n🎉 Тестирование OilService завершено!');
console.log('='.repeat(50)); 