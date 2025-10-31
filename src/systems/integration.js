// Система интеграции - генерация наборов миров

// Функция для генерации набора миров
export function generateWorldSet(seed = Math.random()) {
  const random = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const worlds = [];
  for (let i = 0; i < 5; i++) {
    worlds.push({
      id: `world_${i}`,
      name: `World ${i + 1}`,
      seed: seed + i,
      difficulty: Math.floor(random(seed + i) * 10) + 1,
      theme: ['forest', 'desert', 'mountain', 'ocean'][Math.floor(random(seed + i * 2) * 4)]
    });
  }

  return worlds;
}

// Функция для форматирования описания набора миров
export function formatWorldSetDescription(worldSet) {
  if (!Array.isArray(worldSet) || worldSet.length === 0) {
    return 'Empty world set';
  }

  const themes = worldSet.map(w => w.theme).filter((v, i, a) => a.indexOf(v) === i);
  const avgDifficulty = worldSet.reduce((sum, w) => sum + w.difficulty, 0) / worldSet.length;

  return `World Set: ${worldSet.length} worlds, themes: ${themes.join(', ')}, avg difficulty: ${avgDifficulty.toFixed(1)}`;
}
