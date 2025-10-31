// Интеграция системы ментальных вращений с игровой механикой

import { createMentalRotationsSystem, createMentalRotationTask, formatMentalRotationsStats } from './mental_rotations.js';

// Класс для интеграции системы ментальных вращений в игру
export class MentalRotationsIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.mentalSystem = createMentalRotationsSystem(
      config.maxRotation || 180,
      config.rotationSpeed || 30
    );
    this.tasks = [];
    this.currentTask = null;
    this.initialized = false;
    this.taskGenerationInterval = config.taskGenerationInterval || 8000; // Интервал создания новых задач
    this.lastTaskGeneration = 0;
    this.transformedElements = [];
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Настраиваем обработчики ввода для управления вращением
    this.setupInputHandlers();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для информации о вращении
    this.rotationInfo = document.createElement('div');
    this.rotationInfo.className = 'mental-rotation-info';
    this.rotationInfo.style.position = 'absolute';
    this.rotationInfo.style.top = '10px';
    this.rotationInfo.style.left = '10px';
    this.rotationInfo.style.padding = '8px';
    this.rotationInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.rotationInfo.style.color = 'white';
    this.rotationInfo.style.borderRadius = '5px';
    this.rotationInfo.style.fontSize = '14px';
    this.gameContainer.appendChild(this.rotationInfo);

    // Индикатор текущей задачи
    this.taskIndicator = document.createElement('div');
    this.taskIndicator.className = 'mental-rotation-task';
    this.taskIndicator.style.position = 'absolute';
    this.taskIndicator.style.top = '60px';
    this.taskIndicator.style.left = '10px';
    this.taskIndicator.style.padding = '8px';
    this.taskIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.taskIndicator.style.color = 'white';
    this.taskIndicator.style.borderRadius = '5px';
    this.taskIndicator.style.fontSize = '14px';
    this.taskIndicator.style.maxWidth = '300px';
    this.gameContainer.appendChild(this.taskIndicator);

    // Индикатор прогресса вращения
    this.progressIndicator = document.createElement('div');
    this.progressIndicator.className = 'mental-rotation-progress';
    this.progressIndicator.style.position = 'absolute';
    this.progressIndicator.style.bottom = '10px';
    this.progressIndicator.style.left = '10px';
    this.progressIndicator.style.width = '200px';
    this.progressIndicator.style.height = '10px';
    this.progressIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
    this.progressIndicator.style.borderRadius = '5px';
    this.progressIndicator.style.overflow = 'hidden';
    this.gameContainer.appendChild(this.progressIndicator);

    // Внутренний элемент прогресса
    this.progressBar = document.createElement('div');
    this.progressBar.style.height = '100%';
    this.progressBar.style.width = '0%';
    this.progressBar.style.backgroundColor = '#3498db';
    this.progressBar.style.transition = 'width 0.3s ease';
    this.progressIndicator.appendChild(this.progressBar);
  }

  // Настройка обработчиков ввода
  setupInputHandlers() {
    // Обработчики для управления вращением
    this.inputHandlers = {
      keydown: (e) => {
        if (!this.currentTask) return;

        switch(e.key) {
          case 'ArrowLeft':
            this.mentalSystem.startRotation(
              this.mentalSystem.targetRotation - 15,
              this.currentTask.axis,
              this.currentTask.complexity
            );
            break;
          case 'ArrowRight':
            this.mentalSystem.startRotation(
              this.mentalSystem.targetRotation + 15,
              this.currentTask.axis,
              this.currentTask.complexity
            );
            break;
          case 'x':
            this.mentalSystem.rotationAxis = 'x';
            break;
          case 'y':
            this.mentalSystem.rotationAxis = 'y';
            break;
          case 'z':
            this.mentalSystem.rotationAxis = 'z';
            break;
        }
      }
    };

    document.addEventListener('keydown', this.inputHandlers.keydown);
  }

  // Генерация новой задачи
  generateTask() {
    // Создаем задачу со случайными параметрами
    this.currentTask = createMentalRotationTask();

    // Начинаем вращение
    this.mentalSystem.startRotation(
      this.currentTask.targetAngle,
      this.currentTask.axis,
      this.currentTask.complexity
    );

    // Применяем вращение к игровым элементам
    this.applyRotationToGameElements();
  }

  // Применение вращения к игровым элементам
  applyRotationToGameElements() {
    // Находим элементы, к которым нужно применить вращение
    const gameElements = this.gameContainer.querySelectorAll('.game-element, .platform, .obstacle');

    // Сохраняем ссылки на элементы для последующего обновления
    this.transformedElements = Array.from(gameElements);

    // Применяем начальное преобразование
    this.updateElementTransforms();
  }

  // Обновление преобразований элементов
  updateElementTransforms() {
    const transform = this.mentalSystem.getTransformMatrix();

    this.transformedElements.forEach(element => {
      element.style.transform = transform;
      element.style.transformStyle = 'preserve-3d';
      element.style.transition = 'transform 0.3s ease';
    });
  }

  // Проверка выполнения задачи
  checkTaskCompletion() {
    if (!this.currentTask) return false;

    const state = this.mentalSystem.getState();

    // Проверяем, достаточно ли близко текущее вращение к целевому
    const tolerance = 5; // Допустимая погрешность в градусах
    const isCompleted = Math.abs(state.currentRotation - this.currentTask.targetAngle) <= tolerance;

    if (isCompleted && !state.isRotating) {
      // Задача выполнена
      this.tasks.push(this.currentTask);
      this.currentTask = null;
      return true;
    }

    return false;
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему ментальных вращений
    this.mentalSystem.update(deltaTime);
    const state = this.mentalSystem.getState();

    // Обновляем преобразования элементов
    this.updateElementTransforms();

    // Проверяем, нужно ли сгенерировать новую задачу
    const now = Date.now();
    if (!this.currentTask && now - this.lastTaskGeneration > this.taskGenerationInterval) {
      this.generateTask();
      this.lastTaskGeneration = now;
    }

    // Проверяем выполнение текущей задачи
    if (this.currentTask && this.checkTaskCompletion()) {
      // Задача выполнена, можно добавить награду или другие эффекты
    }

    // Обновляем UI
    this.updateUI(state);
  }

  // Обновление UI
  updateUI(state) {
    // Обновляем информацию о вращении
    this.rotationInfo.textContent = formatMentalRotationsStats(state);

    // Обновляем индикатор задачи
    if (this.currentTask) {
      this.taskIndicator.textContent = this.currentTask.hint;
      this.taskIndicator.style.display = 'block';
    } else {
      this.taskIndicator.style.display = 'none';
    }

    // Обновляем индикатор прогресса
    if (state.isRotating) {
      const progress = (1 - state.progress) * 100; // Инвертируем прогресс для отображения
      this.progressBar.style.width = `${progress}%`;
    } else {
      this.progressBar.style.width = '0%';
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем обработчики событий
    if (this.inputHandlers.keydown) {
      document.removeEventListener('keydown', this.inputHandlers.keydown);
    }

    // Удаляем HTML элементы
    if (this.rotationInfo) {
      this.gameContainer.removeChild(this.rotationInfo);
    }

    if (this.taskIndicator) {
      this.gameContainer.removeChild(this.taskIndicator);
    }

    if (this.progressIndicator) {
      this.gameContainer.removeChild(this.progressIndicator);
    }

    // Сбрасываем преобразования элементов
    this.transformedElements.forEach(element => {
      element.style.transform = '';
    });

    // Сбрасываем систему
    this.mentalSystem.reset();
    this.tasks = [];
    this.currentTask = null;
    this.transformedElements = [];

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return {
      mentalSystem: this.mentalSystem.getState(),
      tasks: this.tasks,
      currentTask: this.currentTask
    };
  }
}

// Функция для создания интеграции системы ментальных вращений
export function createMentalRotationsIntegration(gameContainer, config) {
  return new MentalRotationsIntegration(gameContainer, config);
}
