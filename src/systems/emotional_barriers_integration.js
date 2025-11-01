// Интеграция системы эмоциональных барьеров с игровой механикой

import {
  createEmotionalBarriersSystem,
  createEmotionalBarrier,
  formatEmotionalBarriersStats,
} from './emotional_barriers.js';

// Класс для интеграции системы эмоциональных барьеров в игру
export class EmotionalBarriersIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.barriersSystem = createEmotionalBarriersSystem(config.maxBarriers || 5);
    this.barrierElements = [];
    this.initialized = false;
    this.playerPosition = { x: 0, y: 0 };
    this.barrierGenerationInterval = config.barrierGenerationInterval || 6000; // Интервал создания новых барьеров
    this.lastBarrierGeneration = 0;
    this.emotionRadius = config.emotionRadius || 200;
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Создаем начальные барьеры
    this.generateInitialBarriers();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для информации об эмоциональных барьерах
    this.barriersInfo = document.createElement('div');
    this.barriersInfo.className = 'emotional-barriers-info';
    this.barriersInfo.style.position = 'absolute';
    this.barriersInfo.style.top = '10px';
    this.barriersInfo.style.left = '10px';
    this.barriersInfo.style.padding = '8px';
    this.barriersInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.barriersInfo.style.color = 'white';
    this.barriersInfo.style.borderRadius = '5px';
    this.barriersInfo.style.fontSize = '14px';
    this.gameContainer.appendChild(this.barriersInfo);

    // Индикатор радиуса эмоционального влияния
    this.emotionIndicator = document.createElement('div');
    this.emotionIndicator.className = 'emotion-indicator';
    this.emotionIndicator.style.position = 'absolute';
    this.emotionIndicator.style.width = `${this.emotionRadius * 2}px`;
    this.emotionIndicator.style.height = `${this.emotionRadius * 2}px`;
    this.emotionIndicator.style.borderRadius = '50%';
    this.emotionIndicator.style.border = '2px dashed rgba(255,255,255,0.2)';
    this.emotionIndicator.style.pointerEvents = 'none';
    this.emotionIndicator.style.display = 'none';
    this.gameContainer.appendChild(this.emotionIndicator);
  }

  // Создание начальных барьеров
  generateInitialBarriers() {
    const barrierCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < barrierCount; i++) {
      this.generateBarrier();
    }
  }

  // Генерация нового барьера
  generateBarrier() {
    const emotionTypes = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
    const emotion = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
    const intensity = 0.5 + Math.random() * 1.5;

    // Создаем барьер со случайными параметрами
    const barrier = createEmotionalBarrier(
      50 + Math.random() * (this.gameContainer.offsetWidth - 150),
      50 + Math.random() * (this.gameContainer.offsetHeight - 100),
      40 + Math.random() * 80,
      10 + Math.random() * 30,
      emotion,
      intensity
    );

    // Добавляем ID для отслеживания
    barrier.id = `barrier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Добавляем барьер в систему
    const barrierId = this.barriersSystem.addBarrier(barrier);

    if (barrierId >= 0) {
      // Создаем визуальное представление барьера
      this.createBarrierElement(barrier, barrierId);
    }
  }

  // Создание визуального представления барьера
  createBarrierElement(barrier, barrierId) {
    const barrierElement = document.createElement('div');
    barrierElement.className = 'emotional-barrier';
    barrierElement.id = barrier.id;
    barrierElement.style.position = 'absolute';
    barrierElement.style.left = `${barrier.x}px`;
    barrierElement.style.top = `${barrier.y}px`;
    barrierElement.style.width = `${barrier.width}px`;
    barrierElement.style.height = `${barrier.height}px`;
    barrierElement.style.backgroundColor = barrier.color;
    barrierElement.style.opacity = barrier.opacity;
    barrierElement.style.borderRadius = '4px';
    barrierElement.style.transition = 'all 0.3s ease';

    // Добавляем индикатор типа эмоции
    const emotionIndicator = document.createElement('div');
    emotionIndicator.className = 'emotion-type-indicator';
    emotionIndicator.style.position = 'absolute';
    emotionIndicator.style.top = '-20px';
    emotionIndicator.style.left = '0';
    emotionIndicator.style.fontSize = '10px';
    emotionIndicator.style.color = 'white';
    emotionIndicator.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
    emotionIndicator.textContent = this.getEmotionLabel(barrier.emotion);

    barrierElement.appendChild(emotionIndicator);

    // Добавляем в контейнер игры
    this.gameContainer.appendChild(barrierElement);

    // Сохраняем ссылку на элемент
    barrier.element = barrierElement;
    barrier.emotionIndicator = emotionIndicator;

    // Сохраняем в массив для обновления
    this.barrierElements.push(barrierElement);
  }

  // Получение метки для типа эмоции
  getEmotionLabel(emotion) {
    const labels = {
      joy: 'Радость',
      sadness: 'Грусть',
      anger: 'Гнев',
      fear: 'Страх',
      surprise: 'Удивление',
      disgust: 'Отвращение',
    };

    return labels[emotion] || 'Неизвестно';
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
    this.barriersSystem.updatePlayerPosition(x, y);

    // Обновляем позицию индикатора радиуса эмоционального влияния
    this.emotionIndicator.style.left = `${x - this.emotionRadius}px`;
    this.emotionIndicator.style.top = `${y - this.emotionRadius}px`;
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему эмоциональных барьеров
    this.barriersSystem.update(deltaTime);
    const state = this.barriersSystem.getState();

    // Проверяем, нужно ли создать новый барьер
    const now = Date.now();
    if (now - this.lastBarrierGeneration > this.barrierGenerationInterval) {
      this.generateBarrier();
      this.lastBarrierGeneration = now;
    }

    // Обновляем визуальные элементы барьеров
    this.updateBarrierElements(state);

    // Обновляем UI
    this.updateUI(state);
  }

  // Обновление визуальных элементов барьеров
  updateBarrierElements(state) {
    state.barriers.forEach((barrier) => {
      const barrierObj = this.barriersSystem.barriers.find(
        (b) => b.barrier.id === barrier.barrierId
      )?.barrier;

      if (barrierObj && barrierObj.element) {
        // Обновляем позицию (с учетом дрожания)
        const emotionalBarrier = this.barriersSystem.barriers.find(
          (b) => b.barrier.id === barrier.barrierId
        );
        const shakeOffset = emotionalBarrier ? emotionalBarrier.shakeOffset : { x: 0, y: 0 };

        barrierObj.element.style.left = `${barrierObj.x + shakeOffset.x}px`;
        barrierObj.element.style.top = `${barrierObj.y + shakeOffset.y}px`;

        // Обновляем размер
        barrierObj.element.style.width = `${barrierObj.width}px`;
        barrierObj.element.style.height = `${barrierObj.height}px`;

        // Обновляем цвет и прозрачность
        barrierObj.element.style.backgroundColor = barrierObj.color;
        barrierObj.element.style.opacity = barrierObj.opacity;

        // Обновляем форму
        if (barrierObj.shape === 'triangle') {
          barrierObj.element.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        } else {
          barrierObj.element.style.clipPath = '';
        }

        // Обновляем индикатор эмоционального влияния
        if (barrier.isAffected) {
          barrierObj.element.style.boxShadow = '0 0 10px 2px rgba(255,255,255,0.6)';
          this.emotionIndicator.style.display = 'block';
        } else {
          barrierObj.element.style.boxShadow = '';
        }
      }
    });
  }

  // Обновление UI
  updateUI(state) {
    // Обновляем информацию об эмоциональных барьерах
    this.barriersInfo.textContent = formatEmotionalBarriersStats(state);

    // Скрываем индикатор эмоционального влияния, если ни один барьер не под влиянием
    const hasAffected = state.barriers.some((barrier) => barrier.isAffected);
    if (!hasAffected) {
      this.emotionIndicator.style.display = 'none';
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем HTML элементы
    if (this.barriersInfo) {
      this.gameContainer.removeChild(this.barriersInfo);
    }

    if (this.emotionIndicator) {
      this.gameContainer.removeChild(this.emotionIndicator);
    }

    // Удаляем элементы барьеров
    this.barrierElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Сбрасываем систему
    this.barriersSystem.reset();
    this.barrierElements = [];

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return this.barriersSystem.getState();
  }
}

// Функция для создания интеграции системы эмоциональных барьеров
export function createEmotionalBarriersIntegration(gameContainer, config) {
  return new EmotionalBarriersIntegration(gameContainer, config);
}
