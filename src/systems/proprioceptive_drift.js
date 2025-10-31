// Система проприоцептивного дрифта - управление постепенно расходится с ожиданиями

// Класс для управления проприоцептивным дрифтом
export class ProprioceptiveDrift {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      driftSpeed: options.driftSpeed || 0.001, // Скорость дрифта (0-1)
      maxDrift: options.maxDrift || 0.5, // Максимальное отклонение (0-1)
      recoverySpeed: options.recoverySpeed || 0.002, // Скорость восстановления
      activeTime: options.activeTime || 10000, // Время активации дрифта (мс)
      inactiveTime: options.inactiveTime || 5000, // Время восстановления (мс)
      visualFeedback: options.visualFeedback !== false, // Визуальная индикация дрифта
      ...options
    };

    // Текущее состояние
    this.isActive = false;
    this.driftLevel = 0;
    this.driftAngle = 0;
    this.lastActivityTime = Date.now();
    this.lastInput = { x: 0, y: 0 };
    this.driftedInput = { x: 0, y: 0 };
    this.driftStartTime = 0;

    // Создаем UI для индикации дрифта
    if (this.options.visualFeedback) {
      this.createDriftIndicator();
    }

    // Запускаем цикл проверки активности
    this.startActivityCheck();
  }

  // Создание индикатора дрифта
  createDriftIndicator() {
    // Создаем контейнер для индикатора
    this.indicatorContainer = document.createElement('div');
    this.indicatorContainer.className = 'proprioceptive-drift-indicator';
    this.indicatorContainer.style.position = 'absolute';
    this.indicatorContainer.style.bottom = '10px';
    this.indicatorContainer.style.left = '10px';
    this.indicatorContainer.style.padding = '8px';
    this.indicatorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.indicatorContainer.style.borderRadius = '8px';
    this.indicatorContainer.style.color = 'white';
    this.indicatorContainer.style.zIndex = '1000';
    this.indicatorContainer.style.fontSize = '12px';
    this.indicatorContainer.style.display = 'none'; // Изначально скрыт

    // Создаем индикатор уровня дрифта
    this.driftBar = document.createElement('div');
    this.driftBar.style.width = '100px';
    this.driftBar.style.height = '8px';
    this.driftBar.style.backgroundColor = '#333';
    this.driftBar.style.borderRadius = '4px';
    this.driftBar.style.marginBottom = '5px';
    this.driftBar.style.position = 'relative';
    this.driftBar.style.overflow = 'hidden';

    // Создаем заполнитель для индикатора
    this.driftFill = document.createElement('div');
    this.driftFill.style.height = '100%';
    this.driftFill.style.width = '0%';
    this.driftFill.style.backgroundColor = '#ff6b6b';
    this.driftFill.style.borderRadius = '4px';
    this.driftFill.style.transition = 'width 0.3s ease';

    this.driftBar.appendChild(this.driftFill);

    // Создаем текстовое описание
    this.driftText = document.createElement('div');
    this.driftText.textContent = 'Проприоцептивный дрифт: неактивен';

    // Собираем индикатор
    this.indicatorContainer.appendChild(this.driftBar);
    this.indicatorContainer.appendChild(this.driftText);
    this.container.appendChild(this.indicatorContainer);
  }

  // Запуск проверки активности
  startActivityCheck() {
    this.activityInterval = setInterval(() => this.checkActivity(), 100); // Проверяем 10 раз в секунду
  }

  // Остановка проверки активности
  stopActivityCheck() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  // Проверка активности игрока
  checkActivity() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivityTime;

    // Если игрок долго неактивен, начинаем дрифт
    if (timeSinceActivity > this.options.inactiveTime && !this.isActive) {
      this.startDrift();
    }
    // Если игрок активен, останавливаем дрифт
    else if (timeSinceActivity < this.options.inactiveTime && this.isActive) {
      this.stopDrift();
    }
  }

  // Начало дрифта
  startDrift() {
    this.isActive = true;
    this.driftStartTime = Date.now();
    this.driftAngle = Math.random() * Math.PI * 2; // Случайный начальный угол

    // Показываем индикатор
    if (this.options.visualFeedback) {
      this.indicatorContainer.style.display = 'block';
      this.driftText.textContent = 'Проприоцептивный дрифт: активен';
    }

    // Уведомляем слушателей о начале дрифта
    this.notifyEventListeners('driftStart', {
      angle: this.driftAngle,
      speed: this.options.driftSpeed
    });
  }

  // Остановка дрифта
  stopDrift() {
    this.isActive = false;

    // Скрываем индикатор
    if (this.options.visualFeedback) {
      this.indicatorContainer.style.display = 'none';
    }

    // Уведомляем слушателей об окончании дрифта
    this.notifyEventListeners('driftEnd', {});
  }

  // Обновление состояния дрифта
  update() {
    // Обновляем уровень дрифта
    if (this.isActive) {
      // Постепенно увеличиваем уровень дрифта
      this.driftLevel = Math.min(
        this.options.maxDrift,
        this.driftLevel + this.options.driftSpeed
      );

      // Медленно вращаем угол дрифта
      this.driftAngle += 0.01;

      // Обновляем визуальный индикатор
      if (this.options.visualFeedback) {
        const percentage = Math.round(this.driftLevel / this.options.maxDrift * 100);
        this.driftFill.style.width = `${percentage}%`;

        // Изменяем цвет в зависимости от уровня
        if (percentage < 30) {
          this.driftFill.style.backgroundColor = '#ffeb3b'; // Желтый
        } else if (percentage < 70) {
          this.driftFill.style.backgroundColor = '#ff9f40'; // Оранжевый
        } else {
          this.driftFill.style.backgroundColor = '#ff6b6b'; // Красный
        }
      }
    } else {
      // Постепенно уменьшаем уровень дрифта
      this.driftLevel = Math.max(0, this.driftLevel - this.options.recoverySpeed);
    }
  }

  // Применение дрифта к вводу игрока
  applyDrift(inputX, inputY) {
    // Сохраняем оригинальный ввод
    this.lastInput.x = inputX;
    this.lastInput.y = inputY;

    // Если дрифт активен, применяем искажение
    if (this.isActive && this.driftLevel > 0) {
      // Вычисляем смещение на основе угла и уровня дрифта
      const driftMagnitude = this.driftLevel * 30; // Максимальное смещение в пикселях
      const driftX = Math.cos(this.driftAngle) * driftMagnitude;
      const driftY = Math.sin(this.driftAngle) * driftMagnitude;

      // Применяем дрифт к вводу
      this.driftedInput.x = inputX + driftX;
      this.driftedInput.y = inputY + driftY;
    } else {
      // Без дрифта ввод остается без изменений
      this.driftedInput.x = inputX;
      this.driftedInput.y = inputY;
    }

    return this.driftedInput;
  }

  // Обновление времени активности
  updateActivity() {
    this.lastActivityTime = Date.now();
  }

  // Получение уровня дрифта (0-1)
  getDriftLevel() {
    return this.driftLevel;
  }

  // Добавление слушателя событий
  addEventListener(callback) {
    if (!this.eventListeners) {
      this.eventListeners = [];
    }
    this.eventListeners.push(callback);
  }

  // Удаление слушателя событий
  removeEventListener(callback) {
    if (this.eventListeners) {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    }
  }

  // Уведомление слушателей о событиях
  notifyEventListeners(eventType, data) {
    if (this.eventListeners) {
      this.eventListeners.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error('Error in proprioceptive drift event listener:', error);
        }
      });
    }
  }

  // Очистка ресурсов
  destroy() {
    this.stopActivityCheck();

    if (this.indicatorContainer && this.container.contains(this.indicatorContainer)) {
      this.container.removeChild(this.indicatorContainer);
    }

    this.eventListeners = [];
  }
}

// Функция для создания системы проприоцептивного дрифта
export function createProprioceptiveDrift(gameContainer, options) {
  return new ProprioceptiveDrift(gameContainer, options);
}
