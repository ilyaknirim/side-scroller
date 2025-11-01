// Интеграция системы проприоцептивного дрифта с игровой механикой

import {
  createProprioceptiveDriftSystem,
  createProprioceptiveDrift,
  formatProprioceptiveDriftStats,
} from './proprioceptive_drift.js';

// Класс для интеграции системы проприоцептивного дрифта в игру
export class ProprioceptiveDriftIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.driftSystem = createProprioceptiveDriftSystem(config.maxDrift || 2);
    this.driftElements = [];
    this.initialized = false;
    this.playerPosition = { x: 0, y: 0 };
    this.playerSize = 30;
    this.playerOrientation = 0;
    this.driftGenerationInterval = config.driftGenerationInterval || 10000; // Интервал создания новых дрифтов
    this.lastDriftGeneration = 0;
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Создаем начальные дрифты
    this.generateInitialDrifts();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для информации о проприоцептивных дрифтах
    this.driftsInfo = document.createElement('div');
    this.driftsInfo.className = 'proprioceptive-drifts-info';
    this.driftsInfo.style.position = 'absolute';
    this.driftsInfo.style.top = '10px';
    this.driftsInfo.style.left = '10px';
    this.driftsInfo.style.padding = '8px';
    this.driftsInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.driftsInfo.style.color = 'white';
    this.driftsInfo.style.borderRadius = '5px';
    this.driftsInfo.style.fontSize = '14px';
    this.gameContainer.appendChild(this.driftsInfo);

    // Индикатор состояния игрока
    this.playerStateIndicator = document.createElement('div');
    this.playerStateIndicator.className = 'player-state-indicator';
    this.playerStateIndicator.style.position = 'absolute';
    this.playerStateIndicator.style.top = '60px';
    this.playerStateIndicator.style.left = '10px';
    this.playerStateIndicator.style.padding = '8px';
    this.playerStateIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.playerStateIndicator.style.color = 'white';
    this.playerStateIndicator.style.borderRadius = '5px';
    this.playerStateIndicator.style.fontSize = '14px';
    this.gameContainer.appendChild(this.playerStateIndicator);
  }

  // Создание начальных дрифтов
  generateInitialDrifts() {
    const driftCount = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < driftCount; i++) {
      this.generateDrift();
    }
  }

  // Генерация нового дрифта
  generateDrift() {
    const driftTypes = ['position', 'size', 'orientation', 'gravity', 'momentum'];
    const type = driftTypes[Math.floor(Math.random() * driftTypes.length)];
    const intensity = 0.5 + Math.random() * 1.5;

    // Создаем дрифт со случайными параметрами
    const drift = createProprioceptiveDrift(type, intensity);

    // Добавляем ID для отслеживания
    drift.id = `drift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Добавляем дрифт в систему
    const driftId = this.driftSystem.addDrift(drift);

    if (driftId >= 0) {
      // Создаем визуальное представление дрифта
      this.createDriftElement(drift, driftId);
    }
  }

  // Создание визуального представления дрифта
  createDriftElement(drift, driftId) {
    const driftElement = document.createElement('div');
    driftElement.className = 'proprioceptive-drift';
    driftElement.id = drift.id;
    driftElement.style.position = 'absolute';
    driftElement.style.width = '100px';
    driftElement.style.height = '100px';
    driftElement.style.borderRadius = '50%';
    driftElement.style.backgroundColor = 'rgba(255,255,255,0.1)';
    driftElement.style.border = '2px dashed rgba(255,255,255,0.3)';
    driftElement.style.pointerEvents = 'none';
    driftElement.style.transition = 'all 0.3s ease';

    // Добавляем индикатор типа дрифта
    const typeIndicator = document.createElement('div');
    typeIndicator.className = 'drift-type-indicator';
    typeIndicator.style.position = 'absolute';
    typeIndicator.style.top = '-20px';
    typeIndicator.style.left = '0';
    typeIndicator.style.fontSize = '10px';
    typeIndicator.style.color = 'white';
    typeIndicator.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
    typeIndicator.textContent = this.getDriftTypeLabel(drift.type);

    driftElement.appendChild(typeIndicator);

    // Добавляем в контейнер игры
    this.gameContainer.appendChild(driftElement);

    // Сохраняем ссылку на элемент
    drift.element = driftElement;
    drift.typeIndicator = typeIndicator;

    // Сохраняем в массив для обновления
    this.driftElements.push(driftElement);
  }

  // Получение метки для типа дрифта
  getDriftTypeLabel(type) {
    const labels = {
      position: 'Позиция',
      size: 'Размер',
      orientation: 'Ориентация',
      gravity: 'Гравитация',
      momentum: 'Инерция',
    };

    return labels[type] || 'Неизвестно';
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
    this.driftSystem.updatePlayerPosition(x, y);

    // Обновляем позиции элементов дрифтов
    this.updateDriftElements();
  }

  // Обновление размера игрока
  updatePlayerSize(size) {
    this.playerSize = size;
  }

  // Обновление ориентации игрока
  updatePlayerOrientation(orientation) {
    this.playerOrientation = orientation;
  }

  // Обновление позиций элементов дрифтов
  updateDriftElements() {
    this.driftSystem.drifts.forEach((drift) => {
      if (drift.drift.element) {
        // Размещаем элемент дрифта вокруг игрока
        const angle = Math.atan2(
          this.playerPosition.y - this.gameContainer.offsetHeight / 2,
          this.playerPosition.x - this.gameContainer.offsetWidth / 2
        );
        const distance = 150;

        const x = this.playerPosition.x + Math.cos(angle) * distance;
        const y = this.playerPosition.y + Math.sin(angle) * distance;

        drift.drift.element.style.left = `${x - 50}px`;
        drift.drift.element.style.top = `${y - 50}px`;
      }
    });
  }

  // Применение трансформаций к игроку
  applyToPlayer(player) {
    // Применяем трансформацию к позиции
    const transformedPosition = this.driftSystem.applyToPlayerPosition(this.playerPosition);
    player.x = transformedPosition.x;
    player.y = transformedPosition.y;

    // Применяем трансформацию к размеру
    const transformedSize = this.driftSystem.applyToPlayerSize(this.playerSize);
    player.size = transformedSize;

    // Применяем трансформацию к ориентации
    const transformedOrientation = this.driftSystem.applyToPlayerOrientation(
      this.playerOrientation
    );
    player.orientation = transformedOrientation;

    // Применяем трансформацию к гравитации
    if (player.gravity) {
      const transformedGravity = this.driftSystem.applyToGravity(player.gravity);
      player.gravity = transformedGravity;
    }

    // Применяем трансформацию к инерции
    if (player.momentum !== undefined) {
      const transformedMomentum = this.driftSystem.applyToMomentum(player.momentum);
      player.momentum = transformedMomentum;
    }

    return player;
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему проприоцептивных дрифтов
    this.driftSystem.update(deltaTime);
    const state = this.driftSystem.getState();

    // Проверяем, нужно ли создать новый дрифт
    const now = Date.now();
    if (now - this.lastDriftGeneration > this.driftGenerationInterval) {
      this.generateDrift();
      this.lastDriftGeneration = now;
    }

    // Обновляем UI
    this.updateUI(state);
  }

  // Обновление UI
  updateUI(state) {
    // Обновляем информацию о проприоцептивных дрифтах
    this.driftsInfo.textContent = formatProprioceptiveDriftStats(state);

    // Обновляем индикатор состояния игрока
    let stateText = 'Состояние: ';
    const activeDrifts = state.drifts.filter((drift) => drift.isActive);

    if (activeDrifts.length === 0) {
      stateText += 'Нормальное';
    } else {
      const driftTypes = activeDrifts.map((drift) => this.getDriftTypeLabel(drift.type));
      stateText += driftTypes.join(', ');
    }

    this.playerStateIndicator.textContent = stateText;

    // Изменяем цвет индикатора в зависимости от количества активных дрифтов
    if (activeDrifts.length === 0) {
      this.playerStateIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)'; // Черный
    } else if (activeDrifts.length === 1) {
      this.playerStateIndicator.style.backgroundColor = 'rgba(255,165,0,0.7)'; // Оранжевый
    } else {
      this.playerStateIndicator.style.backgroundColor = 'rgba(255,0,0,0.7)'; // Красный
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем HTML элементы
    if (this.driftsInfo) {
      this.gameContainer.removeChild(this.driftsInfo);
    }

    if (this.playerStateIndicator) {
      this.gameContainer.removeChild(this.playerStateIndicator);
    }

    // Удаляем элементы дрифтов
    this.driftElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Сбрасываем систему
    this.driftSystem.reset();
    this.driftElements = [];

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return {
      driftSystem: this.driftSystem.getState(),
      playerPosition: { ...this.playerPosition },
      playerSize: this.playerSize,
      playerOrientation: this.playerOrientation,
    };
  }
}

// Функция для создания интеграции системы проприоцептивного дрифта
export function createProprioceptiveDriftIntegration(gameContainer, config) {
  return new ProprioceptiveDriftIntegration(gameContainer, config);
}
