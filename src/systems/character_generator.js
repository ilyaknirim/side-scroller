// Генератор персонажей - создание уникальных героев

// Функция для генерации ID персонажа
export function generateCharacterId(seed = Math.random()) {
  const adjectives = ['Brave', 'Wise', 'Swift', 'Mighty', 'Clever', 'Bold', 'Gentle', 'Fierce'];
  const nouns = [
    'Warrior',
    'Scholar',
    'Explorer',
    'Guardian',
    'Artist',
    'Healer',
    'Hunter',
    'Sage',
  ];

  const adjIndex = Math.floor(seed * adjectives.length);
  const nounIndex = Math.floor((seed * 1000) % nouns.length);

  return `${adjectives[adjIndex]}${nounIndex}`;
}

// Функция для генерации персонажа
export function generateCharacter(seed = Math.random()) {
  const id = generateCharacterId(seed);

  const traits = ['Strength', 'Intelligence', 'Agility', 'Charisma', 'Wisdom', 'Luck'];
  const primaryTrait = traits[Math.floor(seed * traits.length)];
  const secondaryTrait = traits[Math.floor((seed * 100) % traits.length)];

  return {
    id,
    name: id,
    seed,
    primaryTrait,
    secondaryTrait,
    level: Math.floor(seed * 10) + 1,
    experience: Math.floor(seed * 1000),
  };
}

// Функция для форматирования описания персонажа
export function formatCharacterDescription(character) {
  return `${character.name} (Level ${character.level}) - ${character.primaryTrait}/${character.secondaryTrait}, ${character.experience} XP`;
}
