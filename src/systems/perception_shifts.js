// Система перцептуальных сдвигов, изменяющих восприятие игрока

// Класс для управления инверсией восприятия
export class PerceptionInversion {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      blinkThreshold: options.blinkThreshold || 300, // Порог времени бездействия для "моргания" (мс)
      inversionDuration: options.inversionDuration || 3000, // Длительность инверсии (мс)
      blinkChance: options.blinkChance || 0.02, // Шанс "моргания" при каждом обновлении
      ...options
    };

    // Состояние инверсии
    this.isInverted = false;
    this.inversionStartTime = 0;
    this.lastActivityTime = Date.now();

    // Слушатели событий
    this.eventListeners = [];

    // CSS-класс для инвертированного состояния
    this.invertedClass = 'perception-inverted';

    // Запускаем проверку на "моргание"
    this.startBlinkDetection();
  }

  // Запуск обнаружения "моргания"
  startBlinkDetection() {
    this.blinkInterval = setInterval(() => this.checkForBlink(), 100); // Проверяем 10 раз в секунду
  }

  // Остановка обнаружения "моргания"
  stopBlinkDetection() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
  }

  // Проверка на "моргание"
  checkForBlink() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivityTime;

    // Если игрок долго не активен, это может быть "морганием"
    const isInactiveBlink = timeSinceActivity > this.options.blinkThreshold;

    // Случайное "моргание"
    const isRandomBlink = Math.random() < this.options.blinkChance;

    if (isInactiveBlink || isRandomBlink) {
      this.triggerBlink();
    }
  }

  // Обновление времени активности
  updateActivity() {
    this.lastActivityTime = Date.now();
  }

  // Запуск "моргания" и инверсии
  triggerBlink() {
    // Если уже инвертировано, не делаем ничего
    if (this.isInverted) return;

    // Запускаем инверсию
    this.startInversion();
  }

  // Начало инверсии восприятия
  startInversion() {
    this.isInverted = true;
    this.inversionStartTime = Date.now();

    // Применяем CSS-класс для инверсии
    this.container.classList.add(this.invertedClass);

    // Уведомляем слушателей о начале инверсии
    this.notifyEventListeners('inversionStart', {
      duration: this.options.inversionDuration
    });

    // Устанавливаем таймер для окончания инверсии
    this.inversionTimeout = setTimeout(() => {
      this.endInversion();
    }, this.options.inversionDuration);
  }

  // Окончание инверсии восприятия
  endInversion() {
    if (!this.isInverted) return;

    this.isInverted = false;

    // Убираем CSS-класс инверсии
    this.container.classList.remove(this.invertedClass);

    // Уведомляем слушателей об окончании инверсии
    this.notifyEventListeners('inversionEnd', {});
  }

  // Получение инвертированного значения для управления
  getInvertedValue(value, axis) {
    if (!this.isInverted) return value;

    // Инвертируем значение в зависимости от оси
    switch (axis) {
      case 'horizontal':
        return -value;
      case 'vertical':
        return -value;
      default:
        return -value;
    }
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
        console.error('Error in perception inversion event listener:', error);
      }
    });
  }

  // Очистка ресурсов
  destroy() {
    this.stopBlinkDetection();

    if (this.inversionTimeout) {
      clearTimeout(this.inversionTimeout);
      this.inversionTimeout = null;
    }

    if (this.isInverted) {
      this.container.classList.remove(this.invertedClass);
    }

    this.eventListeners = [];
  }
}

// Класс для управления туннельным зрением
export class TunnelVision {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      baseRadius: options.baseRadius || 200, // Базовый радиус видимости
      minRadius: options.minRadius || 50, // Минимальный радиус при стрессе
      maxRadius: options.maxRadius || 300, // Максимальный радиус при спокойствии
      stressThreshold: options.stressThreshold || 3, // Порог стресса для сужения
      recoveryRate: options.recoveryRate || 0.05, // Скорость восстановления
      ...options
    };

    // Состояние туннельного зрения
    this.currentRadius = this.options.baseRadius;
    this.stressLevel = 0;

    // Создаем элемент маски для туннельного зрения
    this.createTunnelMask();

    // Запускаем обновление
    this.startUpdating();
  }

  // Создание маски для туннельного зрения
  createTunnelMask() {
    // Создаем SVG-элемент для маски
    this.maskElement = document.createElement('div');
    this.maskElement.className = 'tunnel-vision-mask';
    this.maskElement.style.position = 'absolute';
    this.maskElement.style.top = '0';
    this.maskElement.style.left = '0';
    this.maskElement.style.width = '100%';
    this.maskElement.style.height = '100%';
    this.maskElement.style.pointerEvents = 'none';
    this.maskElement.style.zIndex = '1000';

    // Создаем SVG внутри маски
    this.maskElement.innerHTML = `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="tunnelMask">
            <rect width="100%" height="100%" fill="white"/>
            <circle id="tunnelHole" cx="50%" cy="50%" r="${this.options.baseRadius}" fill="black"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="black" mask="url(#tunnelMask)"/>
      </svg>
    `;

    // Добавляем маску в контейнер
    this.container.appendChild(this.maskElement);

    // Запоминаем ссылку на элемент круга
    this.holeElement = this.maskElement.querySelector('#tunnelHole');
  }

  // Запуск обновления
  startUpdating() {
    this.updateInterval = setInterval(() => this.update(), 50); // Обновляем 20 раз в секунду
  }

  // Остановка обновления
  stopUpdating() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Обновление состояния
  update() {
    // Восстановление радиуса при снижении стресса
    if (this.stressLevel > 0) {
      this.stressLevel = Math.max(0, this.stressLevel - this.options.recoveryRate);
    }

    // Вычисляем целевой радиус на основе уровня стресса
    const targetRadius = this.options.maxRadius - 
                        (this.options.maxRadius - this.options.minRadius) * 
                        (this.stressLevel / this.options.stressThreshold);

    // Плавно переходим к целевому радиусу
    this.currentRadius += (targetRadius - this.currentRadius) * 0.1;

    // Обновляем радиус круга в маске
    if (this.holeElement) {
      this.holeElement.setAttribute('r', this.currentRadius);
    }
  }

  // Увеличение уровня стресса
  increaseStress(amount = 1) {
    this.stressLevel = Math.min(this.options.stressThreshold, this.stressLevel + amount);
  }

  // Очистка ресурсов
  destroy() {
    this.stopUpdating();

    if (this.maskElement && this.container.contains(this.maskElement)) {
      this.container.removeChild(this.maskElement);
    }
  }
}

// Функция для создания системы инверсии восприятия
export function createPerceptionInversion(gameContainer, options) {
  return new PerceptionInversion(gameContainer, options);
}

// Функция для создания системы туннельного зрения
export function createTunnelVision(gameContainer, options) {
  return new TunnelVision(gameContainer, options);
}
