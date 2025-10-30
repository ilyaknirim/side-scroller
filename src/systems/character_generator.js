
// Система генерации случайных персонажей для игры

export function pseudoRandom(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Наборы характеристик персонажей
const characterTypes = [
  'Воин', 'Маг', 'Разведчик', 'Целитель', 'Техник', 'Мутант', 'Киборг', 'Призрак'
];

const abilities = [
  'Сверхскорость', 'Телепортация', 'Регенерация', 'Невидимость', 
  'Пирокинез', 'Телекинез', 'Предвидение', 'Клонирование', 
  'Фазовый сдвиг', 'Щит энергии', 'Замедление времени', 'Гравитационный контроль'
];

const appearances = [
  'Высокий и худощавый', 'Низкий и коренастый', 'Среднего роста, мускулистый',
  'Хрупкое телосложение', 'Атлетическое телосложение', 'Необычно пропорциональный',
  'Андрогинный', 'Массивный', 'Изящный'
];

const colors = [
  'Красный', 'Синий', 'Зеленый', 'Желтый', 'Фиолетовый', 'Оранжевый', 
  'Черный', 'Белый', 'Серебряный', 'Золотой', 'Бирюзовый', 'Розовый'
];

const traits = [
  'Храбрый', 'Осторожный', 'Импульсивный', 'Аналитичный', 'Творческий', 'Прагматичный',
  'Альтруистичный', 'Эгоистичный', 'Оптимистичный', 'Пессимистичный', 'Экстраверт', 'Интроверт'
];

const backstories = [
  'Последний выживший из своего клана',
  'Бывший наемник, ищущий искупления',
  'Ученый, случайно получивший сверхспособности',
  'Изгнанный из своего измерения',
  'Бывший чемпион арены',
  'Охотник за артефактами',
  'Бывший член тайного общества',
  'Результат неудачного эксперимента',
  'Последний защитник древнего знания',
  'Искатель приключений'
];

// Генерация случайного персонажа
export function generateCharacter(seed) {
  const rnd = pseudoRandom(seed || Date.now());

  // Выбираем случайные характеристики
  const type = characterTypes[Math.floor(rnd() * characterTypes.length)];
  const ability1 = abilities[Math.floor(rnd() * abilities.length)];
  let ability2 = abilities[Math.floor(rnd() * abilities.length)];
  // Убедимся, что способности не повторяются
  while (ability2 === ability1) {
    ability2 = abilities[Math.floor(rnd() * abilities.length)];
  }
  const appearance = appearances[Math.floor(rnd() * appearances.length)];
  const primaryColor = colors[Math.floor(rnd() * colors.length)];
  const secondaryColor = colors[Math.floor(rnd() * colors.length)];
  const trait1 = traits[Math.floor(rnd() * traits.length)];
  let trait2 = traits[Math.floor(rnd() * traits.length)];
  // Убедимся, что черты характера не повторяются
  while (trait2 === trait1) {
    trait2 = traits[Math.floor(rnd() * traits.length)];
  }
  const backstory = backstories[Math.floor(rnd() * backstories.length)];

  // Генерируем имя на основе типа персонажа
  const names = {
    'Воин': ['Арес', 'Тор', 'Беллерофонт', 'Гектор', 'Аякс', 'Персей', 'Орион', 'Кастор'],
    'Маг': ['Мерлин', 'Гэндальф', 'Дамблдор', 'Волан-де-Морт', 'Саруман', 'Радагаст', 'Эльрик', 'Просперо'],
    'Разведчик': ['Леголас', 'Арагорн', 'Робин Гуд', 'Зоро', 'Ассасин', 'Ниндзя', 'Слейд', 'Страйдер'],
    'Целитель': ['Аполлон', 'Эскулап', 'Панакея', 'Гигея', 'Хирон', 'Махаон', 'Подалирий', 'Асклепий'],
    'Техник': ['Тони Старк', 'Бэтмен', 'Гаджет', 'Киборг', 'Железный человек', 'Бэтмен', 'Робокоп', 'Терминатор'],
    'Мутант': 'Людей Икс', 'Росомаха', 'Циклоп', 'Шторм', 'Джин Грей', 'Ночной Змей', 'Колосс', 'Зверь'],
    'Киборг': ['Киборг', 'Робокоп', 'Терминатор', 'Бионик', 'Кибер-мен', 'Борг', 'Дарт Вейдер', 'Генерал Гривус'],
    'Призрак': ['Каспер', 'Банши', 'Фантом', 'Призрак', 'Дух', 'Тень', 'Спектр', 'Ульрик']
  };

  const nameList = names[type] || names['Воин'];
  const name = nameList[Math.floor(rnd() * nameList.length)];

  // Генерируем статистику
  const stats = {
    strength: Math.floor(5 + rnd() * 15),      // 5-20
    agility: Math.floor(5 + rnd() * 15),       // 5-20
    intelligence: Math.floor(5 + rnd() * 15),  // 5-20
    endurance: Math.floor(5 + rnd() * 15),     // 5-20
    charisma: Math.floor(5 + rnd() * 15),      // 5-20
    luck: Math.floor(5 + rnd() * 15)           // 5-20
  };

  // Создаем объект персонажа
  return {
    name,
    type,
    abilities: [ability1, ability2],
    appearance: `${appearance}, основной цвет: ${primaryColor}, дополнительный цвет: ${secondaryColor}`,
    traits: [trait1, trait2],
    backstory,
    stats,
    seed: seed || Date.now()
  };
}

// Форматирование описания персонажа для отображения
export function formatCharacterDescription(character) {
  return `
${character.name} - ${character.type}

Внешность: ${character.appearance}

Способности: 
• ${character.abilities[0]}
• ${character.abilities[1]}

Черты характера: ${character.traits.join(', ')}

Предыстория: ${character.backstory}

Характеристики:
• Сила: ${character.stats.strength}/20
• Ловкость: ${character.stats.agility}/20
• Интеллект: ${character.stats.intelligence}/20
• Выносливость: ${character.stats.endurance}/20
• Харизма: ${character.stats.charisma}/20
• Удача: ${character.stats.luck}/20
  `.trim();
}
