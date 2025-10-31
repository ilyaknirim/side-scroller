// Интеграция систем - генерация наборов персонаж + объект мира

// Функция для генерации набора персонаж + объект мира
export function generateWorldSet(seed) {
  const pseudoRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const characters = [
    'Воин Света',
    'Теневой Странник',
    'Кристаллический Маг',
    'Лесной Дух',
    'Огненный Феникс',
    'Ледяной Страж',
    'Громовой Титан',
    'Ветреный Кочевник',
  ];

  const worldObjects = [
    'Кристалл Вечности',
    'Дерево Жизни',
    'Огненный Алтарь',
    'Ледяной Трон',
    'Громовой Молот',
    'Ветреный Кристалл',
    'Земляной Тотем',
    'Водяной Источник',
  ];

  const charIndex = Math.floor(pseudoRandom(seed) * characters.length);
  const objIndex = Math.floor(pseudoRandom(seed + 1) * worldObjects.length);

  return {
    character: characters[charIndex],
    worldObject: worldObjects[objIndex],
    seed: seed,
  };
}

// Функция для форматирования описания набора
export function formatWorldSetDescription(worldSet) {
  return `Персонаж: ${worldSet.character}\nОбъект мира: ${worldSet.worldObject}`;
}
