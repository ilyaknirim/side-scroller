// Генератор уровней - создание уникальных уровней

// Функция для генерации уровня
export function generateLevel(seed = Math.random(), difficulty = 1) {
  const random = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const themes = ['forest', 'desert', 'mountain', 'ocean', 'city', 'space'];
  const obstacles = ['spikes', 'pits', 'walls', 'enemies', 'traps'];

  const level = {
    id: `level_${Math.floor(seed * 10000)}`,
    seed,
    difficulty,
    theme: themes[Math.floor(random(seed) * themes.length)],
    length: Math.floor(100 + difficulty * 50),
    obstacles: []
  };

  // Генерация препятствий
  const obstacleCount = Math.floor(5 + difficulty * 2);
  for (let i = 0; i < obstacleCount; i++) {
    level.obstacles.push({
      type: obstacles[Math.floor(random(seed + i) * obstacles.length)],
      position: Math.floor(random(seed + i * 2) * level.length),
      intensity: Math.floor(random(seed + i * 3) * difficulty) + 1
    });
  }

  return level;
}

// Функция для форматирования описания уровня
export function formatLevelDescription(level) {
  const obstacleTypes = level.obstacles.map(o => o.type).filter((v, i, a) => a.indexOf(v) === i);
  return `Level: ${level.theme} theme, ${level.length}m long, difficulty ${level.difficulty}, obstacles: ${obstacleTypes.join(', ')}`;
}
