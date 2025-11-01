// Интеграция системы когнитивной нагрузки с игровой механикой

import {
  createCognitiveLoadSystem,
  createCognitiveTask,
  formatCognitiveLoadStats,
} from './cognitive_load.js';

// Класс для интеграции системы когнитивной нагрузки в игру
export class CognitiveLoadIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.cognitiveSystem = createCognitiveLoadSystem(
      config.baseDifficulty || 1,
      config.maxDifficulty || 10
    );
    this.tasks = [];
    this.taskElements = [];
    this.initialized = false;
    this.taskSpawnInterval = config.taskSpawnInterval || 3000; // Интервал создания новых задач
    this.lastTaskSpawn = 0;
    this.maxTasks = config.maxTasks || 5;
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для индикаторов задач
    this.taskContainer = document.createElement('div');
    this.taskContainer.className = 'cognitive-tasks';
    this.taskContainer.style.position = 'absolute';
    this.taskContainer.style.top = '60px';
    this.taskContainer.style.right = '10px';
    this.taskContainer.style.width = '200px';
    this.gameContainer.appendChild(this.taskContainer);

    // Индикатор когнитивной нагрузки
    this.loadIndicator = document.createElement('div');
    this.loadIndicator.className = 'cognitive-load';
    this.loadIndicator.style.position = 'absolute';
    this.loadIndicator.style.top = '10px';
    this.loadIndicator.style.left = '10px';
    this.loadIndicator.style.padding = '8px';
    this.loadIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.loadIndicator.style.color = 'white';
    this.loadIndicator.style.borderRadius = '5px';
    this.loadIndicator.style.fontSize = '14px';
    this.gameContainer.appendChild(this.loadIndicator);

    // Индикатор сложности
    this.difficultyIndicator = document.createElement('div');
    this.difficultyIndicator.className = 'difficulty-indicator';
    this.difficultyIndicator.style.position = 'absolute';
    this.difficultyIndicator.style.top = '10px';
    this.difficultyIndicator.style.right = '10px';
    this.difficultyIndicator.style.padding = '8px';
    this.difficultyIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.difficultyIndicator.style.color = 'white';
    this.difficultyIndicator.style.borderRadius = '5px';
    this.difficultyIndicator.style.fontSize = '14px';
    this.gameContainer.appendChild(this.difficultyIndicator);
  }

  // Создание новой задачи
  spawnTask() {
    // Проверяем, не превышено ли максимальное количество задач
    if (this.tasks.length >= this.maxTasks) {
      return;
    }

    // Создаем задачу со случайными параметрами
    const task = createCognitiveTask();
    const taskId = this.cognitiveSystem.addTask(task);

    // Создаем визуальное представление задачи
    const taskElement = document.createElement('div');
    taskElement.className = 'cognitive-task';
    taskElement.id = `task-${taskId}`;
    taskElement.style.marginBottom = '8px';
    taskElement.style.padding = '8px';
    taskElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    taskElement.style.borderRadius = '5px';
    taskElement.style.color = 'white';
    taskElement.style.fontSize = '12px';
    taskElement.style.borderLeft = `4px solid ${this.getTaskColor(task.type)}`;

    // Добавляем информацию о задаче
    taskElement.innerHTML = `
      <div style="font-weight: bold;">${task.type}</div>
      <div>Сложность: ${task.complexity.toFixed(1)}</div>
      <div>Срочность: ${task.urgency.toFixed(1)}</div>
      <div class="task-progress" style="height: 4px; background-color: rgba(255,255,255,0.2); margin-top: 4px;">
        <div class="task-progress-bar" style="height: 100%; width: 0%; background-color: ${this.getTaskColor(
          task.type
        )};"></div>
      </div>
    `;

    // Добавляем элемент в контейнер
    this.taskContainer.appendChild(taskElement);

    // Сохраняем ссылку на элемент
    task.element = taskElement;

    // Добавляем в массив задач
    this.tasks.push(task);
  }

  // Получение цвета для типа задачи
  getTaskColor(taskType) {
    const colors = {
      память: '#3498db', // синий
      внимание: '#2ecc71', // зеленый
      'принятие решений': '#e74c3c', // красный
      реакция: '#f39c12', // оранжевый
      планирование: '#9b59b6', // фиолетовый
    };

    return colors[taskType] || '#95a5a6'; // серый по умолчанию
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему когнитивной нагрузки
    this.cognitiveSystem.update(deltaTime);
    const state = this.cognitiveSystem.getState();

    // Проверяем, нужно ли создать новую задачу
    const now = Date.now();
    if (now - this.lastTaskSpawn > this.taskSpawnInterval) {
      this.spawnTask();
      this.lastTaskSpawn = now;
    }

    // Обновляем визуальные элементы задач
    this.updateTaskElements(state);

    // Обновляем индикаторы
    this.updateIndicators(state);
  }

  // Обновление визуальных элементов задач
  updateTaskElements(state) {
    // Удаляем элементы для завершенных задач
    this.taskElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Очищаем массив
    this.taskElements = [];

    // Обновляем существующие задачи
    state.tasks.forEach((task) => {
      if (task.element) {
        // Обновляем прогресс-бар
        const progressBar = task.element.querySelector('.task-progress-bar');
        if (progressBar) {
          progressBar.style.width = `${task.progress * 100}%`;
        }

        // Обновляем срочность (цвет рамки)
        if (task.urgency > 2) {
          task.element.style.borderLeftColor = '#e74c3c'; // красный при высокой срочности
        } else if (task.urgency > 1.5) {
          task.element.style.borderLeftColor = '#f39c12'; // оранжевый при средней срочности
        }
      }
    });
  }

  // Обновление индикаторов
  updateIndicators(state) {
    // Обновляем индикатор нагрузки
    this.loadIndicator.textContent = `Нагрузка: ${state.currentLoad.toFixed(1)}`;

    // Обновляем индикатор сложности
    this.difficultyIndicator.textContent = `Сложность: ${state.currentDifficulty.toFixed(1)}/${
      state.maxDifficulty
    }`;

    // Меняем цвет индикатора сложности в зависимости от уровня
    const ratio = state.difficultyRatio;
    if (ratio > 0.8) {
      this.difficultyIndicator.style.backgroundColor = 'rgba(231, 76, 60, 0.7)'; // красный
    } else if (ratio > 0.5) {
      this.difficultyIndicator.style.backgroundColor = 'rgba(243, 156, 18, 0.7)'; // оранжевый
    } else {
      this.difficultyIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)'; // черный по умолчанию
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем HTML элементы
    if (this.taskContainer) {
      this.gameContainer.removeChild(this.taskContainer);
    }

    if (this.loadIndicator) {
      this.gameContainer.removeChild(this.loadIndicator);
    }

    if (this.difficultyIndicator) {
      this.gameContainer.removeChild(this.difficultyIndicator);
    }

    // Сбрасываем систему
    this.cognitiveSystem.reset();
    this.tasks = [];
    this.taskElements = [];

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return this.cognitiveSystem.getState();
  }
}

// Функция для создания интеграции системы когнитивной нагрузки
export function createCognitiveLoadIntegration(gameContainer, config) {
  return new CognitiveLoadIntegration(gameContainer, config);
}
