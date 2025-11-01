// Интеграция системы локальных временных полей с игровой механикой

import {
  createTemporalFieldsSystem,
  createTemporalField,
  formatTemporalFieldsStats,
} from './temporal_fields.js';

// Класс для интеграции системы локальных временных полей в игру
export class TemporalFieldsIntegration {
  constructor(gameContainer, config = {}) {
    this.gameContainer = gameContainer;
    this.fieldsSystem = createTemporalFieldsSystem(config.maxFields || 4);
    this.fieldElements = [];
    this.initialized = false;
    this.playerPosition = { x: 0, y: 0 };
    this.fieldGenerationInterval = config.fieldGenerationInterval || 8000; // Интервал создания новых полей
    this.lastFieldGeneration = 0;
    this.timeScale = 1; // Текущий масштаб времени
  }

  // Инициализация системы
  async init() {
    // Создаем HTML элементы для отображения состояния
    this.createUIElements();

    // Создаем начальные поля
    this.generateInitialFields();

    this.initialized = true;
    return this;
  }

  // Создание UI элементов
  createUIElements() {
    // Контейнер для информации о временных полях
    this.fieldsInfo = document.createElement('div');
    this.fieldsInfo.className = 'temporal-fields-info';
    this.fieldsInfo.style.position = 'absolute';
    this.fieldsInfo.style.top = '10px';
    this.fieldsInfo.style.right = '10px';
    this.fieldsInfo.style.padding = '8px';
    this.fieldsInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.fieldsInfo.style.color = 'white';
    this.fieldsInfo.style.borderRadius = '5px';
    this.fieldsInfo.style.fontSize = '14px';
    this.gameContainer.appendChild(this.fieldsInfo);

    // Индикатор масштаба времени
    this.timeScaleIndicator = document.createElement('div');
    this.timeScaleIndicator.className = 'time-scale-indicator';
    this.timeScaleIndicator.style.position = 'absolute';
    this.timeScaleIndicator.style.top = '60px';
    this.timeScaleIndicator.style.right = '10px';
    this.timeScaleIndicator.style.padding = '8px';
    this.timeScaleIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.timeScaleIndicator.style.color = 'white';
    this.timeScaleIndicator.style.borderRadius = '5px';
    this.timeScaleIndicator.style.fontSize = '14px';
    this.gameContainer.appendChild(this.timeScaleIndicator);
  }

  // Создание начальных полей
  generateInitialFields() {
    const fieldCount = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < fieldCount; i++) {
      this.generateField();
    }
  }

  // Генерация нового поля
  generateField() {
    const fieldTypes = ['slowdown', 'speedup', 'reversal', 'stasis', 'oscillation'];
    const type = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
    const intensity = 0.5 + Math.random() * 1.5;

    // Создаем поле со случайными параметрами
    const field = createTemporalField(
      50 + Math.random() * (this.gameContainer.offsetWidth - 200),
      50 + Math.random() * (this.gameContainer.offsetHeight - 200),
      80 + Math.random() * 120,
      type,
      intensity
    );

    // Добавляем ID для отслеживания
    field.id = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Добавляем поле в систему
    const fieldId = this.fieldsSystem.addField(field);

    if (fieldId >= 0) {
      // Создаем визуальное представление поля
      this.createFieldElement(field, fieldId);
    }
  }

  // Создание визуального представления поля
  createFieldElement(field, fieldId) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'temporal-field';
    fieldElement.id = field.id;
    fieldElement.style.position = 'absolute';
    fieldElement.style.left = `${field.x - field.radius}px`;
    fieldElement.style.top = `${field.y - field.radius}px`;
    fieldElement.style.width = `${field.radius * 2}px`;
    fieldElement.style.height = `${field.radius * 2}px`;
    fieldElement.style.borderRadius = '50%';
    fieldElement.style.backgroundColor = field.color;
    fieldElement.style.opacity = field.opacity;
    fieldElement.style.pointerEvents = 'none';
    fieldElement.style.transition = 'all 0.3s ease';
    fieldElement.style.border = '2px dashed rgba(255,255,255,0.3)';

    // Добавляем индикатор типа поля
    const typeIndicator = document.createElement('div');
    typeIndicator.className = 'field-type-indicator';
    typeIndicator.style.position = 'absolute';
    typeIndicator.style.top = '-20px';
    typeIndicator.style.left = '0';
    typeIndicator.style.fontSize = '10px';
    typeIndicator.style.color = 'white';
    typeIndicator.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
    typeIndicator.textContent = this.getFieldTypeLabel(field.type);

    fieldElement.appendChild(typeIndicator);

    // Добавляем в контейнер игры
    this.gameContainer.appendChild(fieldElement);

    // Сохраняем ссылку на элемент
    field.element = fieldElement;
    field.typeIndicator = typeIndicator;

    // Сохраняем в массив для обновления
    this.fieldElements.push(fieldElement);
  }

  // Получение метки для типа поля
  getFieldTypeLabel(type) {
    const labels = {
      slowdown: 'Замедление',
      speedup: 'Ускорение',
      reversal: 'Обратное время',
      stasis: 'Стазис',
      oscillation: 'Колебания',
    };

    return labels[type] || 'Неизвестно';
  }

  // Обновление позиции игрока
  updatePlayerPosition(x, y) {
    this.playerPosition = { x, y };
    this.fieldsSystem.updatePlayerPosition(x, y);
  }

  // Обновление состояния
  update(deltaTime) {
    if (!this.initialized) return deltaTime;

    // Обновляем систему временных полей
    const modifiedDeltaTime = this.fieldsSystem.update(deltaTime);
    const state = this.fieldsSystem.getState();

    // Обновляем масштаб времени
    this.updateTimeScale(state);

    // Проверяем, нужно ли создать новое поле
    const now = Date.now();
    if (now - this.lastFieldGeneration > this.fieldGenerationInterval) {
      this.generateField();
      this.lastFieldGeneration = now;
    }

    // Обновляем визуальные элементы полей
    this.updateFieldElements(state);

    // Обновляем UI
    this.updateUI(state);

    return modifiedDeltaTime;
  }

  // Обновление масштаба времени
  updateTimeScale(state) {
    // Находим поле, влияющее на игрока
    const affectingField = state.fields.find((field) => field.isAffected);

    if (affectingField) {
      const field = this.fieldsSystem.fields.find((f) => f.field.id === affectingField.fieldId);
      if (field) {
        this.timeScale = field.field.timeScale;
      }
    } else {
      this.timeScale = 1;
    }
  }

  // Обновление визуальных элементов полей
  updateFieldElements(state) {
    state.fields.forEach((field) => {
      const fieldObj = this.fieldsSystem.fields.find((f) => f.field.id === field.fieldId)?.field;

      if (fieldObj && fieldObj.element) {
        // Обновляем цвет и прозрачность
        fieldObj.element.style.backgroundColor = fieldObj.color;
        fieldObj.element.style.opacity = fieldObj.opacity;

        // Обновляем индикатор влияния
        if (field.isAffected) {
          fieldObj.element.style.boxShadow = '0 0 20px 5px rgba(255,255,255,0.6)';
          fieldObj.element.style.animation = 'pulse 2s infinite';
        } else {
          fieldObj.element.style.boxShadow = '';
          fieldObj.element.style.animation = '';
        }
      }
    });
  }

  // Обновление UI
  updateUI(state) {
    // Обновляем информацию о временных полях
    this.fieldsInfo.textContent = formatTemporalFieldsStats(state);

    // Обновляем индикатор масштаба времени
    let timeScaleText = 'Время: ';
    if (this.timeScale < 0.5) {
      timeScaleText += 'Очень медленное';
    } else if (this.timeScale < 1) {
      timeScaleText += 'Замедленное';
    } else if (this.timeScale === 1) {
      timeScaleText += 'Нормальное';
    } else if (this.timeScale <= 2) {
      timeScaleText += 'Ускоренное';
    } else {
      timeScaleText += 'Очень быстрое';
    }

    if (this.timeScale < 0) {
      timeScaleText += ' (Обратное)';
    }

    this.timeScaleIndicator.textContent = timeScaleText;

    // Изменяем цвет индикатора в зависимости от масштаба времени
    if (this.timeScale < 0) {
      this.timeScaleIndicator.style.backgroundColor = 'rgba(128, 0, 128, 0.7)'; // Фиолетовый для обратного времени
    } else if (this.timeScale < 1) {
      this.timeScaleIndicator.style.backgroundColor = 'rgba(0, 0, 255, 0.7)'; // Синий для замедленного
    } else if (this.timeScale > 1) {
      this.timeScaleIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Красный для ускоренного
    } else {
      this.timeScaleIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Черный для нормального
    }
  }

  // Очистка ресурсов
  destroy() {
    // Удаляем HTML элементы
    if (this.fieldsInfo) {
      this.gameContainer.removeChild(this.fieldsInfo);
    }

    if (this.timeScaleIndicator) {
      this.gameContainer.removeChild(this.timeScaleIndicator);
    }

    // Удаляем элементы полей
    this.fieldElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    // Сбрасываем систему
    this.fieldsSystem.reset();
    this.fieldElements = [];
    this.timeScale = 1;

    this.initialized = false;
  }

  // Получение состояния системы
  getState() {
    return {
      fieldsSystem: this.fieldsSystem.getState(),
      timeScale: this.timeScale,
    };
  }
}

// Функция для создания интеграции системы локальных временных полей
export function createTemporalFieldsIntegration(gameContainer, config) {
  return new TemporalFieldsIntegration(gameContainer, config);
}
