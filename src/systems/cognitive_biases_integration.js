// Интеграция системы когнитивных искажений с игровой механикой

import {
  createCognitiveBiasesSystem,
  createBiasedPlatform,
  formatCognitiveBiasesStats,
} from './cognitive_biases.js';

// Класс для интеграции системы когнитивных искажений в игру
export class CognitiveBiasesIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.biasesSystem = createCognitiveBiasesSystem(config.maxBiases || 5);
    this.platformElements = [];
    this.initialized = false;
    this.playerPosition = { x: 0, y: 0 };
    this.platformGenerationInterval = config.platformGenerationInterval || 5000; // Интервал создания новых платформ
    this.lastPlatformGeneration = 0;
    this.observationRadius = config.observationRadius || 150;
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Создаем начальные платформы
    this.generateInitialPlatforms();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для информации о когнитивных искажениях
    this.biasesInfo = document.createElement('div');
    this.biasesInfo.className = 'cognitive-biases-info';
    this.biasesInfo.style.position = 'absolute';
    this.biasesInfo.style.top = '10px';
    this.biasesInfo.style.right = '10px';
    this.biasesInfo.style.padding = '8px';
    this.biasesInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.biasesInfo.style.color = 'white';
    this.biasesInfo.style.borderRadius = '5px';
    this.biasesInfo.style.fontSize = '14px';
    this.gameContainer.appendChild(this.biasesInfo);

    // Индикатор радиуса наблюдения
    this.observationIndicator = document.createElement('div');
    this.observationIndicator.className = 'observation-indicator';
    this.observationIndicator.style.position = 'absolute';
    this.observationIndicator.style.width = `${this.observationRadius * 2}px`;
    this.observationIndicator.style.height = `${this.observationRadius * 2}px`;
    this.observationIndicator.style.borderRadius = '50%';
    this.observationIndicator.style.border = '2px dashed rgba(255,255,255,0.3)';
    this.observationIndicator.style.pointerEvents = 'none';
    this.observationIndicator.style.display = 'none';
    this.gameContainer.appendChild(this.observationIndicator);
  }

  // Создание начальных платформ
  generateInitialPlatforms() {
    const platformCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < platformCount; i++) {
      this.generatePlatform();
    }
  }

  // Генерация новой платформы
  generatePlatform() {
    const biasTypes = [
      'confirmation',
      'negativity',
      'availability',
      'anchoring',
      'illusory',
      'bandwagon',
    ];
    const biasType = biasTypes[Math.floor(Math.random() * biasTypes.length)];
    const strength = 0.5 + Math.random() * 1.5;

    // Создаем платформу со случайными параметрами
    const platform = createBiasedPlatform(
      50 + Math.random() * (this.gameContainer.offsetWidth - 150),
      50 + Math.random() * (this.gameContainer.offsetHeight - 100),
      50 + Math.random() * 100,
      10 + Math.random() * 20,
      biasType,
      strength
    );

    // Добавляем ID для отслеживания
    platform.id = `platform-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Добавляем платформу в систему
    const biasId = this.biasesSystem.addBias(platform);

    if (biasId >= 0) {
      // Создаем визуальное представление платформы
      this.createPlatformElement(platform, biasId);
    }
  }

  // Создание визуального представления платформы
  createPlatformElement(platform, biasId) {
    const platformElement = document.createElement('div');
    platformElement.className = 'cognitive-bias-platform';
    platformElement.id = platform.id;
    platformElement.style.position = 'absolute';
    platformElement.style.left = `${platform.x}px`;
    platformElement.style.top = `${platform.y}px`;
    platformElement.style.width = `${platform.width}px`;
    platformElement.style.height = `${platform.height}px`;
    platformElement.style.backgroundColor = platform.color;
    platformElement.style.borderRadius = '4px';
    platformElement.style.transition = 'all 0.3s ease';

    // Добавляем индикатор типа искажения
    const biasIndicator = document.createElement('div');
    biasIndicator.className = 'bias-indicator';
    biasIndicator.style.position = 'absolute';
    biasIndicator.style.top = '-20px';
    biasIndicator.style.left = '0';
    biasIndicator.style.fontSize = '10px';
    biasIndicator.style.color = 'white';
    biasIndicator.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
    biasIndicator.textContent = this.getBiasTypeLabel(platform.biasType);

    platformElement.appendChild(biasIndicator);

    // Добавляем в контейнер игры
    this.gameContainer.appendChild(platformElement);

    // Сохраняем ссылку на элемент
    platform.element = platformElement;
    platform.biasIndicator = biasIndicator;

    // Сохраняем в массив для обновления
    this.platformElements.push(platformElement);
  }

  // Получение метки для типа искажения
  getBiasTypeLabel(type) {
    const labels = {
      confirmation: 'Подтверждение',
      negativity: 'Негатив',
      availability: 'Доступность',
      anchoring: 'Якорь',
      illusory: 'Иллюзия',
      bandwagon: 'Толпа',
    };

    return labels[type] || 'Неизвестно';
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
    this.biasesSystem.updatePlayerPosition(x, y);

    // Обновляем позицию индикатора радиуса наблюдения
    this.observationIndicator.style.left = `${x - this.observationRadius}px`;
    this.observationIndicator.style.top = `${y - this.observationRadius}px`;
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему когнитивных искажений
    this.biasesSystem.update(deltaTime);
    const state = this.biasesSystem.getState();

    // Проверяем, нужно ли создать новую платформу
    const now = Date.now();
    if (now - this.lastPlatformGeneration > this.platformGenerationInterval) {
      this.generatePlatform();
      this.lastPlatformGeneration = now;
    }

    // Обновляем визуальные элементы платформ
    this.updatePlatformElements(state);

    // Обновляем UI
    this.updateUI(state);
  }

  // Обновление визуальных элементов платформ
  updatePlatformElements(state) {
    state.biases.forEach((bias) => {
      const platform = this.biasesSystem.biases.find(
        (b) => b.platform.id === bias.platformId
      )?.platform;

      if (platform && platform.element) {
        // Обновляем позицию
        platform.element.style.left = `${platform.x}px`;
        platform.element.style.top = `${platform.y}px`;

        // Обновляем размер
        platform.element.style.width = `${platform.width}px`;
        platform.element.style.height = `${platform.height}px`;

        // Обновляем цвет
        platform.element.style.backgroundColor = platform.color;

        // Обновляем видимость
        platform.element.style.display = platform.visible ? 'block' : 'none';

        // Обновляем индикатор наблюдения
        if (bias.isObserved) {
          platform.element.style.boxShadow = '0 0 10px 2px rgba(255,255,255,0.8)';
          this.observationIndicator.style.display = 'block';
        } else {
          platform.element.style.boxShadow = '';
        }
      }
    });
  }

  // Обновление UI
  updateUI(state) {
    // Обновляем информацию о когнитивных искажениях
    this.biasesInfo.textContent = formatCognitiveBiasesStats(state);

    // Скрываем индикатор наблюдения, если ни одна платформа не наблюдается
    const hasObserved = state.biases.some((bias) => bias.isObserved);
    if (!hasObserved) {
      this.observationIndicator.style.display = 'none';
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем HTML элементы
    if (this.biasesInfo) {
      this.gameContainer.removeChild(this.biasesInfo);
    }

    if (this.observationIndicator) {
      this.gameContainer.removeChild(this.observationIndicator);
    }

    // Удаляем элементы платформ
    this.platformElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Сбрасываем систему
    this.biasesSystem.reset();
    this.platformElements = [];

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return this.biasesSystem.getState();
  }
}

// Функция для создания интеграции системы когнитивных искажений
export function createCognitiveBiasesIntegration(gameContainer, config) {
  return new CognitiveBiasesIntegration(gameContainer, config);
}
