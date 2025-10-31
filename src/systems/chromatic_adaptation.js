// Система хроматической адаптации - цвета влияют на физику

// Карта соответствия цветов и их влияния на физику
const COLOR_PHYSICS_MAP = {
  // Красный - увеличивает скорость, уменьшает гравитацию
  '#ff0000': { speedMultiplier: 1.3, gravityMultiplier: 0.8, jumpMultiplier: 1.1 },
  '#ff3333': { speedMultiplier: 1.2, gravityMultiplier: 0.85, jumpMultiplier: 1.05 },
  '#ff6666': { speedMultiplier: 1.1, gravityMultiplier: 0.9, jumpMultiplier: 1.0 },

  // Синий - уменьшает скорость, увеличивает гравитацию
  '#0000ff': { speedMultiplier: 0.8, gravityMultiplier: 1.3, jumpMultiplier: 0.9 },
  '#3333ff': { speedMultiplier: 0.85, gravityMultiplier: 1.2, jumpMultiplier: 0.95 },
  '#6666ff': { speedMultiplier: 0.9, gravityMultiplier: 1.1, jumpMultiplier: 0.95 },

  // Зеленый - баланс скорости и гравитации, увеличивает прыжок
  '#00ff00': { speedMultiplier: 1.0, gravityMultiplier: 1.0, jumpMultiplier: 1.3 },
  '#33ff33': { speedMultiplier: 1.0, gravityMultiplier: 1.0, jumpMultiplier: 1.2 },
  '#66ff66': { speedMultiplier: 1.0, gravityMultiplier: 1.0, jumpMultiplier: 1.1 },

  // Желтый - увеличивает скорость и прыжок
  '#ffff00': { speedMultiplier: 1.2, gravityMultiplier: 1.0, jumpMultiplier: 1.2 },
  '#ffff33': { speedMultiplier: 1.1, gravityMultiplier: 1.0, jumpMultiplier: 1.1 },
  '#ffff66': { speedMultiplier: 1.05, gravityMultiplier: 1.0, jumpMultiplier: 1.05 },

  // Фиолетовый - уменьшает все параметры, но добавляет "левитацию"
  '#ff00ff': { speedMultiplier: 0.9, gravityMultiplier: 0.5, jumpMultiplier: 1.4 },
  '#ff33ff': { speedMultiplier: 0.9, gravityMultiplier: 0.6, jumpMultiplier: 1.3 },
  '#ff66ff': { speedMultiplier: 0.95, gravityMultiplier: 0.7, jumpMultiplier: 1.2 }
};

// Класс для управления хроматической адаптацией
export class ChromaticAdaptation {
  constructor(gameContainer, options = {}) {
    this.container = gameContainer;
    this.options = {
      transitionSpeed: options.transitionSpeed || 0.05, // Скорость перехода между цветами
      colorChangeInterval: options.colorChangeInterval || 15000, // Интервал смены цвета (мс)
      dominantColorDetection: options.dominantColorDetection !== false, // Определение доминирующего цвета
      ...options
    };

    // Текущее состояние
    this.currentColor = '#ffffff';
    this.targetColor = '#ffffff';
    this.colorTransition = 0;
    this.currentPhysicsModifiers = {
      speedMultiplier: 1.0,
      gravityMultiplier: 1.0,
      jumpMultiplier: 1.0
    };

    // Создаем UI для индикации текущего цвета
    this.createColorIndicator();

    // Запускаем цикл смены цветов
    this.startColorCycle();
  }

  // Создание индикатора текущего цвета
  createColorIndicator() {
    // Создаем контейнер для индикатора
    this.indicatorContainer = document.createElement('div');
    this.indicatorContainer.className = 'chromatic-adaptation-indicator';
    this.indicatorContainer.style.position = 'absolute';
    this.indicatorContainer.style.top = '10px';
    this.indicatorContainer.style.right = '10px';
    this.indicatorContainer.style.padding = '8px';
    this.indicatorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.indicatorContainer.style.borderRadius = '8px';
    this.indicatorContainer.style.color = 'white';
    this.indicatorContainer.style.zIndex = '1000';
    this.indicatorContainer.style.fontSize = '12px';

    // Создаем индикатор цвета
    this.colorIndicator = document.createElement('div');
    this.colorIndicator.style.width = '30px';
    this.colorIndicator.style.height = '30px';
    this.colorIndicator.style.borderRadius = '50%';
    this.colorIndicator.style.backgroundColor = this.currentColor;
    this.colorIndicator.style.marginBottom = '5px';

    // Создаем текст с описанием эффектов
    this.effectText = document.createElement('div');
    this.effectText.textContent = 'Нейтральный';

    // Собираем индикатор
    this.indicatorContainer.appendChild(this.colorIndicator);
    this.indicatorContainer.appendChild(this.effectText);
    this.container.appendChild(this.indicatorContainer);
  }

  // Запуск цикла смены цветов
  startColorCycle() {
    this.colorInterval = setInterval(() => {
      // Генерируем новый случайный цвет
      const colors = Object.keys(COLOR_PHYSICS_MAP);
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.setTargetColor(randomColor);
    }, this.options.colorChangeInterval);
  }

  // Остановка цикла смены цветов
  stopColorCycle() {
    if (this.colorInterval) {
      clearInterval(this.colorInterval);
      this.colorInterval = null;
    }
  }

  // Установка целевого цвета
  setTargetColor(color) {
    if (!COLOR_PHYSICS_MAP[color]) return;

    this.targetColor = color;
    this.colorTransition = 0;
  }

  // Обновление состояния
  update() {
    // Обновляем переход цвета
    if (this.currentColor !== this.targetColor) {
      this.colorTransition += this.options.transitionSpeed;

      if (this.colorTransition >= 1) {
        this.currentColor = this.targetColor;
        this.colorTransition = 0;
        this.updatePhysicsModifiers();
      } else {
        // Интерполируем цвет
        this.currentColor = this.interpolateColor(this.currentColor, this.targetColor, this.colorTransition);
      }

      // Обновляем индикатор
      this.colorIndicator.style.backgroundColor = this.currentColor;
    }
  }

  // Интерполяция между двумя цветами
  interpolateColor(color1, color2, factor) {
    // Преобразуем hex в RGB
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    // Интерполируем каждый канал
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    // Возвращаем в hex
    return this.rgbToHex(r, g, b);
  }

  // Преобразование hex в RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Преобразование RGB в hex
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Обновление модификаторов физики
  updatePhysicsModifiers() {
    const physicsData = COLOR_PHYSICS_MAP[this.currentColor];

    if (physicsData) {
      this.currentPhysicsModifiers = {
        speedMultiplier: physicsData.speedMultiplier,
        gravityMultiplier: physicsData.gravityMultiplier,
        jumpMultiplier: physicsData.jumpMultiplier
      };

      // Обновляем текст эффектов
      let effectText = 'Эффекты: ';
      if (physicsData.speedMultiplier > 1.0) {
        effectText += 'ускорение ';
      } else if (physicsData.speedMultiplier < 1.0) {
        effectText += 'замедление ';
      }

      if (physicsData.gravityMultiplier > 1.0) {
        effectText += '+гравитация ';
      } else if (physicsData.gravityMultiplier < 1.0) {
        effectText += '-гравитация ';
      }

      if (physicsData.jumpMultiplier > 1.0) {
        effectText += '+прыжок ';
      } else if (physicsData.jumpMultiplier < 1.0) {
        effectText += '-прыжок ';
      }

      if (physicsData.gravityMultiplier < 0.7) {
        effectText += '(левитация)';
      }

      this.effectText.textContent = effectText;
    }
  }

  // Получение текущих модификаторов физики
  getCurrentPhysicsModifiers() {
    return this.currentPhysicsModifiers;
  }

  // Очистка ресурсов
  destroy() {
    this.stopColorCycle();

    if (this.indicatorContainer && this.container.contains(this.indicatorContainer)) {
      this.container.removeChild(this.indicatorContainer);
    }
  }
}

// Функция для создания системы хроматической адаптации
export function createChromaticAdaptation(gameContainer, options) {
  return new ChromaticAdaptation(gameContainer, options);
}
