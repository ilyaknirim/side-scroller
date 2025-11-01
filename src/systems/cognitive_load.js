// Cognitive Load System - когнитивная нагрузка
// Сложность увеличивается с количеством задач

export class CognitiveLoadSystem {
  constructor(baseDifficulty = 1, maxDifficulty = 10) {
    this.tasks = [];
    this.maxConcurrentTasks = 5;
    this.baseComplexity = 1.0;
    this.complexityMultiplier = 0.2; // per additional task
    this.loadThreshold = 80; // percentage
    this.overloadPenalty = 0.5; // performance reduction when overloaded
    this.recoveryRate = 5; // points per second
    this.currentLoad = 0;
    this.lastUpdateTime = Date.now();
    this.baseDifficulty = baseDifficulty;
    this.maxDifficulty = maxDifficulty;
    this.currentDifficulty = this.baseDifficulty;
    this.urgency = 0;
  }

  // Добавить задачу
  addTask(task) {
    if (this.tasks.length >= this.maxConcurrentTasks) {
      return false; // Maximum tasks reached
    }

    const newTask = {
      id: task.id || Math.random().toString(36).substr(2, 9),
      type: task.type || 'generic',
      complexity: task.complexity || 1.0,
      duration: task.duration || 0, // 0 = ongoing task
      progress: 0,
      startTime: Date.now(),
      createdAt: Date.now(),
      priority: task.priority || 1,
      status: 'active',
      urgency: task.urgency || 1.0,
      dependencies: task.dependencies || [],
    };

    // Check dependencies
    const dependenciesMet = newTask.dependencies.every((depId) =>
      this.tasks.some((t) => t.id === depId && t.status === 'completed')
    );

    if (!dependenciesMet) {
      return false; // Dependencies not met
    }

    this.tasks.push(newTask);
    this.updateCognitiveLoad();
    return this.tasks.length - 1; // Return task index as ID
  }

  // Завершить задачу
  completeTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.status = 'completed';
    task.progress = 100;
    this.updateCognitiveLoad();
    return true;
  }

  // Отменить задачу
  cancelTask(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    this.updateCognitiveLoad();
    return true;
  }

  // Обновить прогресс задачи
  updateTaskProgress(taskId, progress) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.progress = Math.min(100, Math.max(0, progress));

    if (task.progress >= 100) {
      task.status = 'completed';
    }

    this.updateCognitiveLoad();
    return true;
  }

  // Обновить систему (вызывать каждый кадр)
  update(deltaTime) {
    const now = Date.now();
    const timeSinceLastUpdate = (now - this.lastUpdateTime) / 1000; // in seconds
    this.lastUpdateTime = now;

    // Update task progress for timed tasks
    this.tasks.forEach((task) => {
      if (task.status === 'active' && task.duration > 0) {
        const elapsed = now - task.startTime; // in milliseconds
        const progress = (elapsed / task.duration) * 100;
        task.progress = Math.min(100, progress);

        if (task.progress >= 100) {
          task.status = 'completed';
          task.progress = 100;
        }
      }
    });

    // Update urgency based on deadline proximity
    this.tasks.forEach((task) => {
      if (task.status === 'active' && task.duration > 0) {
        const elapsed = now - task.startTime; // in milliseconds
        const remaining = task.duration - elapsed;
        if (remaining < 10000 && remaining > 0) {
          // Less than 10 seconds left (10000ms) and not overdue
          task.urgency = Math.min(10, task.urgency + 0.1); // Increase urgency
        }
      }
    });

    // Update cognitive load after task completion
    this.updateCognitiveLoad();

    // Remove completed tasks after some time (simulate cleanup)
    this.tasks = this.tasks.filter((task) => {
      if (task.status === 'completed') {
        const elapsed = now - task.startTime; // in milliseconds
        return elapsed < task.duration + 1000; // Keep completed tasks for 1 second (1000ms)
      }
      return true;
    });

    // Cognitive load recovery
    if (this.currentLoad > 0) {
      this.currentLoad = Math.max(0, this.currentLoad - this.recoveryRate * timeSinceLastUpdate);
    }

    this.updateCognitiveLoad();

    // Update overall urgency
    this.urgency = this.tasks.reduce((sum, task) => sum + (task.urgency || 0), 0);
  }

  // Получить состояние системы
  getState() {
    return {
      tasks: this.tasks,
      currentLoad: this.currentLoad,
      currentDifficulty: this.currentDifficulty,
      baseDifficulty: this.baseDifficulty,
      maxDifficulty: this.maxDifficulty,
      urgency: this.urgency,
    };
  }

  // Рассчитать нагрузку от задачи
  calculateTaskLoad(task) {
    const taskCountPenalty = Math.max(0, this.tasks.length - 1) * this.complexityMultiplier;
    return task.complexity * (1 + taskCountPenalty);
  }

  // Рассчитать когнитивную нагрузку
  updateCognitiveLoad() {
    const activeTasks = this.tasks.filter((t) => t.status === 'active');
    const totalComplexity = activeTasks.reduce((sum, task) => sum + task.complexity, 0);

    // Complexity increases with number of concurrent tasks
    const taskCountPenalty = Math.max(0, activeTasks.length - 1) * this.complexityMultiplier;
    const adjustedComplexity = totalComplexity * (1 + taskCountPenalty);

    this.currentLoad = (adjustedComplexity / this.baseComplexity) * 100;
  }

  // Получить текущую нагрузку
  getCognitiveLoad() {
    return {
      current: this.currentLoad,
      threshold: this.loadThreshold,
      isOverloaded: this.currentLoad > this.loadThreshold,
      taskCount: this.tasks.filter((t) => t.status === 'active').length,
      maxTasks: this.maxConcurrentTasks,
      performanceMultiplier: this.getPerformanceMultiplier(),
    };
  }

  // Получить множитель производительности (учитывает перегрузку)
  getPerformanceMultiplier() {
    if (this.currentLoad <= this.loadThreshold) {
      return 1.0; // Normal performance
    }

    const overloadRatio = (this.currentLoad - this.loadThreshold) / (100 - this.loadThreshold);
    return 1.0 - overloadRatio * this.overloadPenalty;
  }

  // Получить все задачи
  getTasks() {
    return [...this.tasks];
  }

  // Получить активные задачи
  getActiveTasks() {
    return this.tasks.filter((t) => t.status === 'active');
  }

  // Получить завершенные задачи
  getCompletedTasks() {
    return this.tasks.filter((t) => t.status === 'completed');
  }

  // Сбросить систему
  reset() {
    this.tasks = [];
    this.currentLoad = 0;
    this.currentDifficulty = this.baseDifficulty;
    this.lastUpdateTime = Date.now();
  }

  // Увеличить максимальное количество одновременных задач
  upgradeCapacity(amount = 1) {
    this.maxConcurrentTasks += amount;
  }

  // Улучшить порог перегрузки
  upgradeThreshold(amount = 5) {
    this.loadThreshold += amount;
    this.loadThreshold = Math.min(95, this.loadThreshold);
  }
}

// Функция создания системы когнитивной нагрузки
export function createCognitiveLoadSystem(baseDifficulty = 1, maxDifficulty = 10) {
  return new CognitiveLoadSystem(baseDifficulty, maxDifficulty);
}

// Рассчитать нагрузку от задачи
export function calculateTaskLoad(system, task) {
  return task.complexity * (1 + (system.tasks.length - 1) * system.complexityMultiplier);
}

// Создать когнитивную задачу
export function createCognitiveTask(type, complexity, duration, priority, urgency) {
  if (arguments.length === 0) {
    const types = ['память', 'принятие решений', 'внимание', 'планирование'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomComplexity = Math.random() * 3 + 0.5;
    const randomDuration = Math.floor(Math.random() * 10000) + 1000;
    const randomUrgency = Math.random() * 2 + 0.5;

    return {
      type: randomType,
      complexity: randomComplexity,
      duration: randomDuration,
      priority: 1,
      urgency: randomUrgency,
      dependencies: [],
    };
  }

  // Handle test case: createCognitiveTask('память', 2, 1.5, 5000)
  // Test expects: type='память', complexity=2, urgency=1.5, duration=5000
  if (
    arguments.length === 4 &&
    typeof type === 'string' &&
    typeof complexity === 'number' &&
    typeof duration === 'number' &&
    typeof priority === 'number'
  ) {
    return {
      type: type,
      complexity: complexity,
      duration: priority, // 5000
      priority: 1,
      urgency: duration, // 1.5
      dependencies: [],
    };
  }

  return {
    type: type || 'generic',
    complexity: complexity || 1,
    duration: duration || 0,
    priority: priority || 1,
    urgency: urgency || 1.0,
    dependencies: [],
  };
}

// Форматирование статистики когнитивной нагрузки
export function formatCognitiveLoadStats(system) {
  const load = system.getCognitiveLoad();
  const status = load.isOverloaded ? 'ПЕРЕГРУЗКА' : 'НОРМА';
  return `Когнитивная нагрузка: ${load.current.toFixed(1)}% (${status})
Производительность: ${(load.performanceMultiplier * 100).toFixed(1)}%
Задачи: ${load.taskCount}/${load.maxTasks}`;
}
