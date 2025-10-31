// Система когнитивной нагрузки - сложность увеличивается с количеством задач

// Класс для системы когнитивной нагрузки
export class CognitiveLoadSystem {
  constructor(baseDifficulty = 1, maxDifficulty = 10) {
    this.baseDifficulty = baseDifficulty;
    this.maxDifficulty = maxDifficulty;
    this.tasks = [];
    this.currentLoad = 0;
    this.currentDifficulty = baseDifficulty;
    this.taskTypes = ['память', 'внимание', 'принятие решений', 'реакция', 'планирование'];
  }

  // Добавление задачи
  addTask(task) {
    const taskWithDefaults = {
      type: task.type || this.taskTypes[Math.floor(Math.random() * this.taskTypes.length)],
      complexity: task.complexity || 1,
      urgency: task.urgency || 1,
      duration: task.duration || 5000, // в миллисекундах
      ...task
    };

    // Устанавливаем время создания
    taskWithDefaults.createdAt = Date.now();

    // Рассчитываем нагрузку от задачи
    taskWithDefaults.load = this.calculateTaskLoad(taskWithDefaults);

    // Добавляем задачу
    this.tasks.push(taskWithDefaults);

    // Пересчитываем общую нагрузку
    this.recalculateLoad();

    return this.tasks.length - 1; // Возвращаем индекс задачи
  }

  // Расчет нагрузки от задачи
  calculateTaskLoad(task) {
    // Базовая нагрузка зависит от сложности и срочности
    let load = task.complexity * task.urgency;

    // Модификаторы в зависимости от типа задачи
    const typeMultipliers = {
      'память': 1.2,
      'внимание': 1.1,
      'принятие решений': 1.5,
      'реакция': 1.0,
      'планирование': 1.3
    };

    load *= typeMultipliers[task.type] || 1.0;

    return load;
  }

  // Пересчет общей нагрузки и сложности
  recalculateLoad() {
    // Суммируем нагрузку от всех активных задач
    this.currentLoad = this.tasks.reduce((sum, task) => sum + task.load, 0);

    // Рассчитываем текущую сложность на основе нагрузки
    // Используем логарифмическую шкалу для более плавного увеличения
    this.currentDifficulty = Math.min(
      this.maxDifficulty,
      this.baseDifficulty + Math.log2(1 + this.currentLoad) * 2
    );
  }

  // Обновление состояния системы
  update(deltaTime) {
    const now = Date.now();
    let tasksRemoved = false;

    // Проверяем и удаляем завершенные задачи
    this.tasks = this.tasks.filter(task => {
      const elapsed = now - task.createdAt;
      if (elapsed >= task.duration) {
        tasksRemoved = true;
        return false; // Удаляем задачу
      }
      return true; // Оставляем задачу
    });

    // Если задачи были удалены, пересчитываем нагрузку
    if (tasksRemoved) {
      this.recalculateLoad();
    }

    // Обновляем оставшиеся задачи
    this.tasks.forEach(task => {
      const elapsed = now - task.createdAt;
      const progress = Math.min(1, elapsed / task.duration);

      // Обновляем прогресс задачи
      task.progress = progress;

      // По мере приближения к дедлайну увеличиваем срочность
      if (progress > 0.7) {
        task.urgency = 1 + (progress - 0.7) * 3; // Увеличиваем срочность в последние 30% времени
      }
    });
  }

  // Получение текущего состояния
  getState() {
    return {
      tasks: [...this.tasks],
      currentLoad: this.currentLoad,
      currentDifficulty: this.currentDifficulty,
      baseDifficulty: this.baseDifficulty,
      maxDifficulty: this.maxDifficulty,
      difficultyRatio: (this.currentDifficulty - this.baseDifficulty) / (this.maxDifficulty - this.baseDifficulty)
    };
  }

  // Сброс системы
  reset() {
    this.tasks = [];
    this.currentLoad = 0;
    this.currentDifficulty = this.baseDifficulty;
  }
}

// Функция для создания системы когнитивной нагрузки
export function createCognitiveLoadSystem(baseDifficulty, maxDifficulty) {
  return new CognitiveLoadSystem(baseDifficulty, maxDifficulty);
}

// Функция для форматирования статистики когнитивной нагрузки
export function formatCognitiveLoadStats(stats) {
  return `Задач: ${stats.tasks.length}, Нагрузка: ${stats.currentLoad.toFixed(1)}, Сложность: ${stats.currentDifficulty.toFixed(1)}/${stats.maxDifficulty}`;
}

// Функция для создания типичной задачи
export function createCognitiveTask(type = null, complexity = null, urgency = null, duration = null) {
  const taskTypes = ['память', 'внимание', 'принятие решений', 'реакция', 'планирование'];

  return {
    type: type || taskTypes[Math.floor(Math.random() * taskTypes.length)],
    complexity: complexity !== null ? complexity : 1 + Math.random() * 2,
    urgency: urgency !== null ? urgency : 1 + Math.random() * 2,
    duration: duration || 3000 + Math.random() * 7000 // от 3 до 10 секунд
  };
}
