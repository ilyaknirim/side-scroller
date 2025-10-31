// Система динамической сложности, адаптирующаяся под поведение игрока

import { pseudoRandom } from './proc_gen.js';

// Параметры адаптивной сложности
const DIFFICULTY_PARAMS = {
  // Базовые значения
  baseDifficulty: 1,
  maxDifficulty: 5,
  minDifficulty: 1,

  // Параметры адаптации
  adaptationSpeed: 0.1, // Скорость адаптации (0-1)
  difficultyDecay: 0.05, // Уменьшение сложности при отсутствии активности

  // Пороговые значения для изменения сложности
  deathThreshold: 3, // Количество смертей для уменьшения сложности
  successThreshold: 5, // Количество успехов для увеличения сложности
  timeThreshold: 30000, // Время бездействия для уменьшения сложности (мс)

  // Вес метрик для оценки производительности
  metricsWeights: {
    deaths: 0.4,
    successes: 0.3,
    time: 0.2,
    resources: 0.1
  }
};

// Класс для отслеживания производительности игрока
export class PlayerPerformanceTracker {
  constructor(seed) {
    this.seed = seed;
    this.rnd = pseudoRandom(seed);

    // Текущие метрики
    this.deaths = 0;
    this.successes = 0;
    this.resources = 100; // Начальные ресурсы
    this.lastActivityTime = Date.now();
    this.sessionStartTime = Date.now();

    // История метрик для анализа трендов
    this.history = [];

    // Текущая сложность
    this.currentDifficulty = DIFFICULTY_PARAMS.baseDifficulty;
  }

  // Регистрация смерти игрока
  registerDeath() {
    this.deaths++;
    this.lastActivityTime = Date.now();
    this.updateDifficulty();
  }

  // Регистрация успеха (прохождение секции, сбор предмета и т.д.)
  registerSuccess() {
    this.successes++;
    this.lastActivityTime = Date.now();
    this.updateDifficulty();
  }

  // Изменение количества ресурсов
  changeResources(amount) {
    this.resources += amount;
    this.lastActivityTime = Date.now();
    this.updateDifficulty();
  }

  // Обновление сложности на основе текущих метрик
  updateDifficulty() {
    // Вычисляем оценку производительности
    const performanceScore = this.calculatePerformanceScore();

    // Определяем целевую сложность
    let targetDifficulty = this.currentDifficulty;

    if (performanceScore > 0.7) {
      // Игрок справляется хорошо, увеличиваем сложность
      targetDifficulty = Math.min(
        DIFFICULTY_PARAMS.maxDifficulty,
        this.currentDifficulty + DIFFICULTY_PARAMS.adaptationSpeed
      );
    } else if (performanceScore < 0.3) {
      // Игрок испытывает трудности, уменьшаем сложность
      targetDifficulty = Math.max(
        DIFFICULTY_PARAMS.minDifficulty,
        this.currentDifficulty - DIFFICULTY_PARAMS.adaptationSpeed
      );
    }

    // Плавно переходим к целевой сложности
    this.currentDifficulty += (targetDifficulty - this.currentDifficulty) * DIFFICULTY_PARAMS.adaptationSpeed;

    // Сохраняем текущее состояние в историю
    this.history.push({
      timestamp: Date.now(),
      difficulty: this.currentDifficulty,
      deaths: this.deaths,
      successes: this.successes,
      resources: this.resources
    });

    // Ограничиваем размер истории
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  // Вычисление оценки производительности (0-1)
  calculatePerformanceScore() {
    const weights = DIFFICULTY_PARAMS.metricsWeights;

    // Нормализуем метрики
    const deathScore = Math.max(0, 1 - (this.deaths / DIFFICULTY_PARAMS.deathThreshold));
    const successScore = Math.min(1, this.successes / DIFFICULTY_PARAMS.successThreshold);
    const resourceScore = this.resources / 100; // Нормализуем ресурсы к 0-1
    const timeScore = Math.min(1, (Date.now() - this.lastActivityTime) / DIFFICULTY_PARAMS.timeThreshold);

    // Вычисляем взвешенную оценку
    return (
      deathScore * weights.deaths +
      successScore * weights.successes +
      resourceScore * weights.resources +
      timeScore * weights.time
    );
  }

  // Получение адаптированных параметров уровня
  getAdaptedLevelParams(baseParams) {
    const adaptedParams = { ...baseParams };

    // Адаптируем параметры на основе текущей сложности
    const difficultyFactor = this.currentDifficulty / DIFFICULTY_PARAMS.baseDifficulty;

    // Увеличиваем или уменьшаем сложность физических параметров
    adaptedParams.gravity = (baseParams.gravity || 0.5) * (0.8 + difficultyFactor * 0.4);
    adaptedParams.speed = (baseParams.speed || 2) * (0.8 + difficultyFactor * 0.4);
    adaptedParams.gap = Math.floor((baseParams.gap || 140) * (1.2 - difficultyFactor * 0.2));

    // Добавляем или убираем модификаторы в зависимости от сложности
    if (difficultyFactor > 1.5 && (!adaptedParams.modifiers || adaptedParams.modifiers.length < 2)) {
      // Добавляем хаотичный модификатор при высокой сложности
      const chaoticModifiers = ['Инверсия управления', 'Гравитационные всплески', 'Телепорт-хаос'];
      const randomModifier = chaoticModifiers[Math.floor(this.rnd() * chaoticModifiers.length)];
      adaptedParams.modifiers = [...(adaptedParams.modifiers || []), randomModifier];
    } else if (difficultyFactor < 0.7 && adaptedParams.modifiers && adaptedParams.modifiers.length > 0) {
      // Убираем модификаторы при низкой сложности
      adaptedParams.modifiers = [];
    }

    return adaptedParams;
  }

  // Получение текущей статистики
  getStats() {
    const sessionTime = Date.now() - this.sessionStartTime;
    return {
      currentDifficulty: Math.round(this.currentDifficulty * 10) / 10,
      deaths: this.deaths,
      successes: this.successes,
      resources: this.resources,
      sessionTime: Math.floor(sessionTime / 1000), // в секундах
      performanceScore: Math.round(this.calculatePerformanceScore() * 100) / 100
    };
  }
}

// Функция для создания трекера производительности
export function createPerformanceTracker(seed) {
  return new PlayerPerformanceTracker(seed);
}

// Форматирование статистики для отображения
export function formatPerformanceStats(stats) {
  return `
=== СТАТИСТИКА ИГРОКА ===

Текущая сложность: ${stats.currentDifficulty}/5
Оценка производительности: ${Math.round(stats.performanceScore * 100)}%

Достижения:
• Смерти: ${stats.deaths}
• Успехи: ${stats.successes}
• Ресурсы: ${stats.resources}
• Время в игре: ${stats.sessionTime} сек.

Совет по улучшению:
${stats.performanceScore < 0.3
  ? 'Сосредоточьтесь на базовых механиках и избегайте рискованных действий.'
  : stats.performanceScore < 0.7
  ? 'Вы хорошо справляетесь! Попробуйте экспериментировать с разными стратегиями.'
  : 'Отличная игра! Сложность будет увеличена для большего вызова.'}
  `.trim();
}
