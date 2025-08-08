const fs = require('fs');
const path = require('path');

console.log('🌿 Генерирую полную базу данных со всеми 120 маслами doTERRA...');

// Читаем JSON с названиями масел
const oilsList = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/essential_oils.json'), 'utf8'));

// База знаний о маслах (основные свойства)
const oilProperties = {
  'Лаванда': {
    description: 'Универсальное эфирное масло с успокаивающими и заживляющими свойствами.',
    keywords: 'лаванда,lavender,успокоение,сон,релакс,заживление,стресс',
    emotional_effect: 'Снимает стресс, успокаивает нервную систему, улучшает сон, снижает тревожность.',
    physical_effect: 'Обладает антисептическими, противовоспалительными и заживляющими свойствами. Помогает при ожогах, порезах и кожных раздражениях.',
    applications: 'Ароматерапия, массаж, ингаляции, добавление в косметику, компрессы.',
    safety_warning: 'Не использовать при беременности. Тест на аллергию обязателен. Избегать попадания в глаза.',
    joke: 'Лаванда - как лучший друг: всегда рядом и всегда помогает! 😊'
  },
  'Мята перечная': {
    description: 'Охлаждающее и освежающее масло с сильными стимулирующими свойствами.',
    keywords: 'мята перечная,peppermint,энергия,бодрость,головная боль,тошнота,концентрация',
    emotional_effect: 'Повышает концентрацию, улучшает настроение, снимает умственную усталость.',
    physical_effect: 'Облегчает головную боль, тошноту, проблемы с пищеварением. Охлаждает и освежает.',
    applications: 'Массаж висков, ингаляции, добавление в напитки, ароматерапия.',
    safety_warning: 'Не использовать при беременности. Избегать попадания в глаза. Разбавлять базовым маслом.',
    joke: 'Мята - как утренний кофе для души! ⚡'
  },
  'Лимон': {
    description: 'Очищающее и освежающее цитрусовое масло с антибактериальными свойствами.',
    keywords: 'лимон,lemon,очищение,энергия,иммунитет,детоксикация,настроение',
    emotional_effect: 'Поднимает настроение, повышает энергию, улучшает концентрацию.',
    physical_effect: 'Укрепляет иммунитет, очищает организм, улучшает пищеварение, отбеливает кожу.',
    applications: 'Ароматерапия, добавление в воду, очищение поверхностей, массаж.',
    safety_warning: 'Фототоксично - избегать солнца после применения. Разбавлять базовым маслом.',
    joke: 'Лимон - природный антидепрессант в каплях! 🍋'
  },
  'Эвкалипт': {
    description: 'Дыхательное масло с сильными антибактериальными и противовирусными свойствами.',
    keywords: 'эвкалипт,eucalyptus,дыхание,простуда,кашель,очищение,концентрация',
    emotional_effect: 'Проясняет мысли, улучшает концентрацию, снимает умственную усталость.',
    physical_effect: 'Облегчает дыхание, помогает при простуде и кашле, очищает воздух.',
    applications: 'Ингаляции, массаж груди, ароматерапия, добавление в диффузор.',
    safety_warning: 'Не использовать при астме. Избегать попадания в глаза. Не применять детям до 3 лет.',
    joke: 'Эвкалипт - как природный ингалятор! 🌿'
  },
  'Чайное дерево': {
    description: 'Мощное антибактериальное и противогрибковое масло.',
    keywords: 'чайное дерево,tea tree,антибактериальное,акне,грибок,иммунитет,заживление',
    emotional_effect: 'Укрепляет дух, повышает уверенность, помогает преодолевать трудности.',
    physical_effect: 'Лечит акне, грибковые инфекции, укрепляет иммунитет, заживляет раны.',
    applications: 'Точечное нанесение, добавление в косметику, ароматерапия, компрессы.',
    safety_warning: 'Не принимать внутрь. Разбавлять базовым маслом. Тест на аллергию обязателен.',
    joke: 'Чайное дерево - природный антибиотик! 🛡️'
  },
  'Розмарин': {
    description: 'Стимулирующее масло для улучшения памяти и концентрации.',
    keywords: 'розмарин,rosemary,память,концентрация,волосы,стимуляция,кровообращение',
    emotional_effect: 'Улучшает память, повышает концентрацию, стимулирует умственную активность.',
    physical_effect: 'Улучшает кровообращение, стимулирует рост волос, облегчает мышечные боли.',
    applications: 'Массаж, ароматерапия, добавление в шампуни, ингаляции.',
    safety_warning: 'Не использовать при беременности и эпилепсии. Повышает давление.',
    joke: 'Розмарин - как витаминка для мозга! 🧠'
  },
  'Апельсин сладкий': {
    description: 'Поднимающее настроение цитрусовое масло с антидепрессивными свойствами.',
    keywords: 'апельсин,orange,настроение,радость,энергия,антидепрессант,иммунитет',
    emotional_effect: 'Поднимает настроение, снимает депрессию, создает ощущение радости и тепла.',
    physical_effect: 'Улучшает пищеварение, укрепляет иммунитет, очищает организм.',
    applications: 'Ароматерапия, добавление в воду, массаж, диффузор.',
    safety_warning: 'Фототоксично - избегать солнца. Разбавлять базовым маслом.',
    joke: 'Апельсин - как солнечный свет в бутылочке! ☀️'
  },
  'Бергамот': {
    description: 'Успокаивающее цитрусовое масло с антидепрессивными свойствами.',
    keywords: 'бергамот,bergamot,антидепрессант,успокоение,настроение,стресс,пищеварение',
    emotional_effect: 'Снимает депрессию, тревогу и стресс, поднимает настроение.',
    physical_effect: 'Антибактериальное, противовирусное, улучшает пищеварение.',
    applications: 'Ароматерапия, массаж, добавление в ванну, диффузор.',
    safety_warning: 'Фототоксично - избегать солнца. Не использовать при беременности.',
    joke: 'Бергамот - как психолог в каплях! 🧘'
  },
  'Ромашка римская': {
    description: 'Успокаивающее масло для сна и релаксации.',
    keywords: 'ромашка,chamomile,сон,успокоение,релакс,бессонница,пищеварение',
    emotional_effect: 'Снимает стресс, помогает заснуть, успокаивает нервную систему.',
    physical_effect: 'Противовоспалительное, спазмолитическое, помогает при проблемах с пищеварением.',
    applications: 'Ароматерапия перед сном, массаж, добавление в ванну, компрессы.',
    safety_warning: 'Не использовать при беременности. Может вызывать аллергию у чувствительных людей.',
    joke: 'Ромашка - как колыбельная для взрослых! 🌙'
  },
  'Иланг-иланг': {
    description: 'Романтическое масло с афродизиакальными свойствами.',
    keywords: 'иланг-иланг,ylang ylang,романтика,афродизиак,успокоение,отношения,давление',
    emotional_effect: 'Создает романтическое настроение, снимает стресс, повышает уверенность.',
    physical_effect: 'Регулирует давление, улучшает кровообращение, успокаивает сердцебиение.',
    applications: 'Романтический массаж, ароматерапия, добавление в ванну, диффузор.',
    safety_warning: 'Может вызывать головную боль при передозировке. Разбавлять базовым маслом.',
    joke: 'Иланг-иланг - как любовное зелье в каплях! 💕'
  }
};

// Генерируем полную базу данных
const fullDatabase = oilsList.map((oil, index) => {
  const oilName = oil.oil_name_ru;
  const properties = oilProperties[oilName];
  
  if (properties) {
    // Если есть детальная информация
    return {
      id: (index + 1).toString(),
      oil_name: oilName,
      description: properties.description,
      keywords: properties.keywords,
      emotional_effect: properties.emotional_effect,
      physical_effect: properties.physical_effect,
      applications: properties.applications,
      safety_warning: properties.safety_warning,
      joke: properties.joke
    };
  } else {
    // Генерируем базовую информацию для остальных масел
    const basicKeywords = `${oilName.toLowerCase()},${oil.oil_name_en.toLowerCase()}`;
    
    return {
      id: (index + 1).toString(),
      oil_name: oilName,
      description: `Эфирное масло ${oilName.toLowerCase()} с уникальными свойствами для ароматерапии.`,
      keywords: basicKeywords,
      emotional_effect: 'Помогает улучшить эмоциональное состояние и настроение.',
      physical_effect: 'Обладает полезными свойствами для физического здоровья.',
      applications: 'Ароматерапия, массаж, ингаляции, добавление в косметику.',
      safety_warning: 'Разбавлять базовым маслом. Тест на аллергию обязателен. Не использовать при беременности.',
      joke: `${oilName} - природный помощник для здоровья! 🌿`
    };
  }
});

// Сохраняем полную базу данных
const outputPath = path.join(__dirname, '../src/data/full_oils_database.js');
const fileContent = `// Полная база данных со всеми 120 маслами doTERRA
const fullOilsDatabase = ${JSON.stringify(fullDatabase, null, 2)};

// Функция поиска масла по названию
function findOilByName(name) {
  const normalizedName = name.toLowerCase().trim();
  return fullOilsDatabase.find(oil => 
    oil.oil_name.toLowerCase().includes(normalizedName) ||
    oil.keywords.toLowerCase().includes(normalizedName)
  );
}

// Функция поиска масел по ключевым словам
function findOilsByKeywords(keywords) {
  const normalizedKeywords = keywords.toLowerCase().trim();
  return fullOilsDatabase.filter(oil => 
    oil.keywords.toLowerCase().includes(normalizedKeywords) ||
    oil.emotional_effect.toLowerCase().includes(normalizedKeywords) ||
    oil.physical_effect.toLowerCase().includes(normalizedKeywords)
  );
}

// Функция получения всех масел
function getAllOils() {
  return fullOilsDatabase;
}

module.exports = {
  fullOilsDatabase,
  findOilByName,
  findOilsByKeywords,
  getAllOils
};`;

fs.writeFileSync(outputPath, fileContent);

console.log(`✅ Полная база данных создана!`);
console.log(`📊 Всего масел: ${fullDatabase.length}`);
console.log(`📁 Файл сохранен: ${outputPath}`);
console.log(`📏 Размер файла: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// Показываем статистику
const detailedOils = fullDatabase.filter(oil => oilProperties[oil.oil_name]).length;
const basicOils = fullDatabase.length - detailedOils;

console.log(`\n📈 Статистика:`);
console.log(`🌿 Масла с детальной информацией: ${detailedOils}`);
console.log(`🌱 Масла с базовой информацией: ${basicOils}`);
console.log(`\n🎯 Детальная информация доступна для:`);
Object.keys(oilProperties).forEach(oil => {
  console.log(`   • ${oil}`);
});
