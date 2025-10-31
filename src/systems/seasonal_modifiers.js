// Сезонные модификаторы - циклы сознания

// Класс для системы сезонных модификаторов
export class SeasonalModifiersSystem {
  constructor() {
    this.seasons = [
      { name: 'spring', mood: 'renewal', modifier: { speed: 1.1, creativity: 1.2 } },
      { name: 'summer', mood: 'energy', modifier: { speed: 1.2, difficulty: 1.1 } },
      { name: 'autumn', mood: 'reflection', modifier: { focus: 1.2, complexity: 1.1 } },
      { name: 'winter', mood: 'introspection', modifier: { patience: 1.2, challenge: 1.1 } }
    ];

    this.currentSeasonIndex = 0;
    this.seasonDuration = 300000; // 5 минут на сезон
    this.seasonStartTime = Date.now();
  }

  // Получение текущего сезона
  getCurrentSeason() {
    const elapsed = Date.now() - this.seasonStartTime;
    const seasonIndex = Math.floor(elapsed / this.seasonDuration) % this.seasons.length;
    this.currentSeasonIndex = seasonIndex;
    return this.seasons[seasonIndex];
  }

  // Получение модификаторов для текущего сезона
  getCurrentModifiers() {
    return this.getCurrentSeason().modifier;
  }

  // Применение сезонных модификаторов
  applySeasonalModifiers(baseStats) {
    const modifiers = this.getCurrentModifiers();
    const modifiedStats = { ...baseStats };

    Object.keys(modifiers).forEach(key => {
      if (modifiedStats[key]) {
        modifiedStats[key] *= modifiers[key];
      }
    });

    return modifiedStats;
  }

  // Получение информации о сезоне
  getSeasonInfo() {
    const season = this.getCurrentSeason();
    const elapsed = Date.now() - this.seasonStartTime;
    const progress = (elapsed % this.seasonDuration) / this.seasonDuration;

    return {
      name: season.name,
      mood: season.mood,
      progress: Math.round(progress * 100),
      modifiers: season.modifier
    };
  }
}

// Функция для создания системы сезонных модификаторов
export function createSeasonalModifiersSystem() {
  return new SeasonalModifiersSystem();
}

// Функция для форматирования информации о сезоне
export function formatSeasonInfo(seasonInfo) {
  return `Season: ${seasonInfo.name} (${seasonInfo.mood}), Progress: ${seasonInfo.progress}%, Modifiers: ${Object.entries(seasonInfo.modifiers).map(([k, v]) => `${k}:${v}`).join(', ')}`;
}
