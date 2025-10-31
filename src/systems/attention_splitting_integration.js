// Интеграция системы разделения внимания с игровой механикой

import { createAttentionSplittingSystem, createAttentionEntity, formatAttentionSplittingStats } from './attention_splitting.js';

// Класс для интеграции системы разделения внимания в игру
export class AttentionSplittingIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.attentionSystem = createAttentionSplittingSystem(
      config.maxEntities || 3,
      config.difficulty || 1
    );
    this.entities = [];
    this.inputHandlers = {};
    this.initialized = false;
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Настраиваем обработчики ввода
    this.setupInputHandlers();

    // Добавляем сущности для управления
    this.createInitialEntities();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для индикаторов сущностей
    this.entityIndicators = document.createElement('div');
    this.entityIndicators.className = 'attention-entities';
    this.entityIndicators.style.position = 'absolute';
    this.entityIndicators.style.top = '10px';
    this.entityIndicators.style.left = '10px';
    this.entityIndicators.style.display = 'flex';
    this.entityIndicators.style.gap = '10px';
    this.gameContainer.appendChild(this.entityIndicators);

    // Индикатор нагрузки на внимание
    this.attentionLoadIndicator = document.createElement('div');
    this.attentionLoadIndicator.className = 'attention-load';
    this.attentionLoadIndicator.style.position = 'absolute';
    this.attentionLoadIndicator.style.top = '10px';
    this.attentionLoadIndicator.style.right = '10px';
    this.attentionLoadIndicator.style.padding = '5px';
    this.attentionLoadIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
    this.attentionLoadIndicator.style.color = 'white';
    this.attentionLoadIndicator.style.borderRadius = '5px';
    this.gameContainer.appendChild(this.attentionLoadIndicator);

    // Индикатор перезарядки переключения
    this.switchCooldownIndicator = document.createElement('div');
    this.switchCooldownIndicator.className = 'switch-cooldown';
    this.switchCooldownIndicator.style.position = 'absolute';
    this.switchCooldownIndicator.style.bottom = '10px';
    this.switchCooldownIndicator.style.left = '50%';
    this.switchCooldownIndicator.style.transform = 'translateX(-50%)';
    this.switchCooldownIndicator.style.padding = '5px';
    this.switchCooldownIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
    this.switchCooldownIndicator.style.color = 'white';
    this.switchCooldownIndicator.style.borderRadius = '5px';
    this.gameContainer.appendChild(this.switchCooldownIndicator);
  }

  // Настройка обработчиков ввода
  setupInputHandlers() {
    // Обработчик для переключения между сущностями (клавиши 1-3)
    this.inputHandlers.keydown = (e) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= this.attentionSystem.maxEntities) {
        this.attentionSystem.switchActiveEntity(key - 1);
      }
    };

    document.addEventListener('keydown', this.inputHandlers.keydown);
  }

  // Создание начальных сущностей
  createInitialEntities() {
    for (let i = 0; i < this.attentionSystem.maxEntities; i++) {
      const entity = createAttentionEntity(
        'player', 
        100 + i * 150, 
        200,
        {
          color: `hsl(${i * 120}, 70%, 50%)`,
          speed: 1 + i * 0.2
        }
      );

      const entityId = this.attentionSystem.addEntity(entity);

      // Создаем визуальное представление сущности
      const entityElement = document.createElement('div');
      entityElement.className = 'attention-entity';
      entityElement.id = `entity-${entityId}`;
      entityElement.style.position = 'absolute';
      entityElement.style.width = `${entity.size}px`;
      entityElement.style.height = `${entity.size}px`;
      entityElement.style.backgroundColor = entity.color;
      entityElement.style.borderRadius = '50%';
      entityElement.style.left = `${entity.x}px`;
      entityElement.style.top = `${entity.y}px`;
      entityElement.style.transition = 'all 0.3s ease';

      // Добавляем индикатор активности
      if (entity.isActive) {
        entityElement.style.boxShadow = '0 0 10px 2px rgba(255,255,255,0.8)';
        entityElement.style.transform = 'scale(1.2)';
      }

      this.gameContainer.appendChild(entityElement);

      // Сохраняем элемент для обновления
      entity.element = entityElement;

      // Создаем индикатор сущности в UI
      const indicator = document.createElement('div');
      indicator.className = 'entity-indicator';
      indicator.id = `indicator-${entityId}`;
      indicator.style.width = '20px';
      indicator.style.height = '20px';
      indicator.style.borderRadius = '50%';
      indicator.style.backgroundColor = entity.color;
      indicator.style.opacity = entity.isActive ? '1' : '0.5';

      if (entity.isActive) {
        indicator.style.boxShadow = '0 0 5px rgba(255,255,255,0.8)';
      }

      this.entityIndicators.appendChild(indicator);
      entity.indicator = indicator;
    }
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем систему разделения внимания
    this.attentionSystem.update(deltaTime);
    const state = this.attentionSystem.getState();

    // Обновляем визуальные элементы сущностей
    state.entities.forEach((entity, index) => {
      if (entity.element) {
        // Обновляем позицию
        entity.element.style.left = `${entity.x}px`;
        entity.element.style.top = `${entity.y}px`;

        // Обновляем индикатор активности
        if (entity.isActive) {
          entity.element.style.boxShadow = '0 0 10px 2px rgba(255,255,255,0.8)';
          entity.element.style.transform = 'scale(1.2)';
        } else {
          entity.element.style.boxShadow = '';
          entity.element.style.transform = 'scale(1)';
        }
      }

      // Обновляем индикатор в UI
      if (entity.indicator) {
        entity.indicator.style.opacity = entity.isActive ? '1' : '0.5';

        if (entity.isActive) {
          entity.indicator.style.boxShadow = '0 0 5px rgba(255,255,255,0.8)';
        } else {
          entity.indicator.style.boxShadow = '';
        }
      }
    });

    // Обновляем индикатор нагрузки на внимание
    this.attentionLoadIndicator.textContent = `Нагрузка: ${state.attentionLoad.toFixed(1)}`;

    // Обновляем индикатор перезарядки переключения
    if (state.switchCooldown > 0) {
      this.switchCooldownIndicator.textContent = `Перезарядка: ${state.switchCooldown.toFixed(1)}`;
      this.switchCooldownIndicator.style.display = 'block';
    } else {
      this.switchCooldownIndicator.style.display = 'none';
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем обработчики событий
    if (this.inputHandlers.keydown) {
      document.removeEventListener('keydown', this.inputHandlers.keydown);
    }

    // Удаляем HTML элементы
    if (this.entityIndicators) {
      this.gameContainer.removeChild(this.entityIndicators);
    }

    if (this.attentionLoadIndicator) {
      this.gameContainer.removeChild(this.attentionLoadIndicator);
    }

    if (this.switchCooldownIndicator) {
      this.gameContainer.removeChild(this.switchCooldownIndicator);
    }

    // Удаляем элементы сущностей
    this.attentionSystem.getState().entities.forEach(entity => {
      if (entity.element) {
        this.gameContainer.removeChild(entity.element);
      }
    });

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return this.attentionSystem.getState();
  }
}

// Функция для создания интеграции системы разделения внимания
export function createAttentionSplittingIntegration(gameContainer, config) {
  return new AttentionSplittingIntegration(gameContainer, config);
}
