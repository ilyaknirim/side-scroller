// Система сезонных модификаторов, представляющая циклы сознания

import { pseudoRandom } from './proc_gen.js';

// Сезоны сознания и их характеристики
const CONSCIOUSNESS_SEASONS = [
  {
    name: 'Пробуждение',
    color: '#ffcc66',
    description: 'Начало нового цикла, повышенная чувствительность',
    modifiers: ['усиленное восприятие', 'быстрая адаптация', 'повышенная чувствительность'],
    gameplayEffects: {
      speed: 1.1,
      jumpHeight: 1.15,
      visibility: 1.2,
      damage: 0.9
    },
    visualEffects: ['яркие цвета', 'мягкое свечение', 'легкая дымка'],
    duration: 30000, // 30 секунд в миллисекундах
    transitionSeason: 'Концентрация'
  },
  {
    name: 'Концентрация',
    color: '#66ccff',
    description: 'Период фокусировки и ясности мышления',
    modifiers: ['улучшенная концентрация', 'точность действий', 'замедление времени'],
    gameplayEffects: {
      speed: 0.9,
      jumpHeight: 1.0,
      visibility: 1.5,
      damage: 1.1,
      timeScale: 0.8
    },
    visualEffects: ['четкие контуры', 'синий оттенок', 'фокусировка'],
    duration: 45000, // 45 секунд
    transitionSeason: 'Размышление'
  },
  {
    name: 'Размышление',
    color: '#9966ff',
    description: 'Глубокий анализ и внутренний диалог',
    modifiers: ['аналитическое мышление', 'предвидение', 'интуитивные подсказки'],
    gameplayEffects: {
      speed: 0.8,
      jumpHeight: 0.9,
      visibility: 0.7,
      damage: 0.8,
      hintFrequency: 2.0
    },
    visualEffects: ['фиолетовый оттенок', 'появление символов', 'мыслительные пузыри'],
    duration: 40000, // 40 секунд
    transitionSeason: 'Воображение'
  },
  {
    name: 'Воображение',
    color: '#ff66cc',
    description: 'Творческий взрыв и нестандартное мышление',
    modifiers: ['творческое мышление', 'неожиданные решения', 'преобразование реальности'],
    gameplayEffects: {
      speed: 1.2,
      jumpHeight: 1.3,
      visibility: 1.0,
      damage: 1.0,
      transformationChance: 0.2
    },
    visualEffects: ['изменение форм', 'появление фантазмов', 'радужные цвета'],
    duration: 35000, // 35 секунд
    transitionSeason: 'Интуиция'
  },
  {
    name: 'Интуиция',
    color: '#66ff99',
    description: 'Подсознательное понимание и предчувствия',
    modifiers: ['интуитивные озарения', 'скрытые пути', 'предсказание'],
    gameplayEffects: {
      speed: 1.0,
      jumpHeight: 1.1,
      visibility: 0.8,
      damage: 0.9,
      revealHiddenPaths: true
    },
    visualEffects: ['пульсирующие ауры', 'подсветка скрытых объектов', 'мерцание'],
    duration: 30000, // 30 секунд
    transitionSeason: 'Пробуждение'
  }
];

// Класс для управления сезонными модификаторами
export class SeasonalModifiersSystem {
  constructor(seed) {
    this.seed = seed;
    this.rnd = pseudoRandom(seed);

    // Текущий сезон
    this.currentSeasonIndex = 0;
    this.currentSeason = CONSCIOUSNESS_SEASONS[0];

    // Время в текущем сезоне
    this.seasonStartTime = Date.now();
    this.seasonProgress = 0;

    // Переход между сезонами
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = 5000; // 5 секунд

    // Слушатели событий
    this.eventListeners = [];

    // Запускаем цикл сезонов
    this.startSeasonCycle();
  }

  // Запуск цикла сезонов
  startSeasonCycle() {
    this.seasonInterval = setInterval(() => this.update(), 100); // Обновляем 10 раз в секунду
  }

  // Остановка цикла сезонов
  stopSeasonCycle() {
    if (this.seasonInterval) {
      clearInterval(this.seasonInterval);
      this.seasonInterval = null;
    }
  }

  // Обновление состояния системы
  update() {
    const now = Date.now();
    const seasonElapsed = now - this.seasonStartTime;
    const seasonDuration = this.currentSeason.duration;

    // Обновляем прогресс текущего сезона
    this.seasonProgress = Math.min(1, seasonElapsed / seasonDuration);

    // Проверяем, нужно ли перейти к следующему сезону
    if (this.seasonProgress >= 1 && !this.isTransitioning) {
      this.startTransition();
    }

    // Обновляем переход между сезонами
    if (this.isTransitioning) {
      this.updateTransition(now);
    }
  }

  // Начало перехода к следующему сезону
  startTransition() {
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    this.transitionProgress = 0;

    // Уведомляем слушателей о начале перехода
    this.notifyEventListeners('seasonTransitionStart', {
      from: this.currentSeason,
      to: CONSCIOUSNESS_SEASONS[(this.currentSeasonIndex + 1) % CONSCIOUSNESS_SEASONS.length]
    });
  }

  // Обновление перехода между сезонами
  updateTransition(now) {
    const transitionElapsed = now - this.transitionStartTime;
    this.transitionProgress = Math.min(1, transitionElapsed / this.transitionDuration);

    // Завершаем переход
    if (this.transitionProgress >= 1) {
      this.completeTransition();
    }
  }

  // Завершение перехода к следующему сезону
  completeTransition() {
    // Переходим к следующему сезону
    this.currentSeasonIndex = (this.currentSeasonIndex + 1) % CONSCIOUSNESS_SEASONS.length;
    this.currentSeason = CONSCIOUSNESS_SEASONS[this.currentSeasonIndex];

    // Сбрасываем параметры
    this.isTransitioning = false;
    this.seasonStartTime = Date.now();
    this.seasonProgress = 0;

    // Уведомляем слушателей о смене сезона
    this.notifyEventListeners('seasonChange', {
      season: this.currentSeason,
      index: this.currentSeasonIndex
    });
  }

  // Получение текущих эффектов геймплея
  getCurrentGameplayEffects() {
    if (this.isTransitioning) {
      // Во время перехода интерполируем эффекты между сезонами
      const fromSeason = CONSCIOUSNESS_SEASONS[this.currentSeasonIndex];
      const toSeason = CONSCIOUSNESS_SEASONS[(this.currentSeasonIndex + 1) % CONSCIOUSNESS_SEASONS.length];

      return this.interpolateEffects(fromSeason.gameplayEffects, toSeason.gameplayEffects, this.transitionProgress);
    }

    return this.currentSeason.gameplayEffects;
  }

  // Интерполяция эффектов между сезонами
  interpolateEffects(fromEffects, toEffects, progress) {
    const interpolated = {};

    for (const key in fromEffects) {
      if (toEffects[key] !== undefined) {
        // Линейная интерполяция
        interpolated[key] = fromEffects[key] + (toEffects[key] - fromEffects[key]) * progress;
      } else {
        // Сохраняем значение, если его нет в целевых эффектах
        interpolated[key] = fromEffects[key];
      }
    }

    // Добавляем новые эффекты из целевых
    for (const key in toEffects) {
      if (fromEffects[key] === undefined) {
        interpolated[key] = toEffects[key] * progress;
      }
    }

    return interpolated;
  }

  // Получение текущих визуальных эффектов
  getCurrentVisualEffects() {
    if (this.isTransitioning) {
      // Во время перехода смешиваем эффекты
      const fromSeason = CONSCIOUSNESS_SEASONS[this.currentSeasonIndex];
      const toSeason = CONSCIOUSNESS_SEASONS[(this.currentSeasonIndex + 1) % CONSCIOUSNESS_SEASONS.length];

      return [...fromSeason.visualEffects, ...toSeason.visualEffects];
    }

    return this.currentSeason.visualEffects;
  }

  // Получение информации о текущем сезоне
  getCurrentSeasonInfo() {
    return {
      name: this.currentSeason.name,
      description: this.currentSeason.description,
      color: this.currentSeason.color,
      modifiers: this.currentSeason.modifiers,
      progress: this.seasonProgress,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.transitionProgress
    };
  }

  // Добавление слушателя событий
  addEventListener(callback) {
    this.eventListeners.push(callback);
  }

  // Удаление слушателя событий
  removeEventListener(callback) {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Уведомление слушателей о событиях
  notifyEventListeners(eventType, data) {
    this.eventListeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('Error in seasonal modifier event listener:', error);
      }
    });
  }
}

// Функция для создания системы сезонных модификаторов
export function createSeasonalModifiersSystem(seed) {
  return new SeasonalModifiersSystem(seed);
}

// Форматирование информации о сезоне для отображения
export function formatSeasonInfo(seasonInfo) {
  return `
=== СЕЗОН СОЗНАНИЯ: ${seasonInfo.name} ===

${seasonInfo.description}

Модификаторы:
${seasonInfo.modifiers.map(mod => `• ${mod}`).join('\n')}

Прогресс сезона: ${Math.round(seasonInfo.progress * 100)}%
${seasonInfo.isTransitioning ? `Прогресс перехода: ${Math.round(seasonInfo.transitionProgress * 100)}%` : ''}

Цвет сезона: ${seasonInfo.color}
  `.trim();
}
