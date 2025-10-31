// Система разделения внимания - управление несколькими сущностями одновременно

// Класс для системы разделения внимания
export class AttentionSplittingSystem {
  constructor(maxEntities = 3, difficulty = 1) {
    this.maxEntities = maxEntities;
    this.difficulty = difficulty;
    this.entities = [];
    this.activeEntityIndex = 0;
    this.attentionLoad = 0;
    this.errors = 0;
    this.switchCooldown = 0;
  }

  // Добавление сущности для управления
  addEntity(entity) {
    if (this.entities.length < this.maxEntities) {
      this.entities.push({
        ...entity,
        id: this.entities.length,
        isActive: this.entities.length === 0
      });
      return this.entities.length - 1;
    }
    return -1;
  }

  // Переключение активной сущности
  switchActiveEntity(index) {
    if (this.switchCooldown > 0) {
      this.errors++;
      return false;
    }

    if (index >= 0 && index < this.entities.length) {
      // Деактивируем текущую сущность
      this.entities[this.activeEntityIndex].isActive = false;

      // Активируем новую сущность
      this.activeEntityIndex = index;
      this.entities[index].isActive = true;

      // Устанавливаем время перезарядки переключения
      this.switchCooldown = Math.max(5, 15 - this.difficulty * 2);

      return true;
    }

    this.errors++;
    return false;
  }

  // Обновление состояния системы
  update(deltaTime) {
    // Уменьшаем время перезарядки переключения
    if (this.switchCooldown > 0) {
      this.switchCooldown = Math.max(0, this.switchCooldown - deltaTime);
    }

    // Рассчитываем нагрузку на внимание
    this.attentionLoad = this.entities.length * this.difficulty;

    // Обновляем все сущности
    this.entities.forEach(entity => {
      if (typeof entity.update === 'function') {
        entity.update(deltaTime, entity.isActive);
      }
    });
  }

  // Получение текущего состояния
  getState() {
    return {
      entities: [...this.entities],
      activeEntityIndex: this.activeEntityIndex,
      maxEntities: this.maxEntities,
      attentionLoad: this.attentionLoad,
      difficulty: this.difficulty,
      errors: this.errors,
      switchCooldown: this.switchCooldown,
      canSwitch: this.switchCooldown === 0
    };
  }

  // Сброс системы
  reset() {
    this.entities = [];
    this.activeEntityIndex = 0;
    this.attentionLoad = 0;
    this.errors = 0;
    this.switchCooldown = 0;
  }
}

// Функция для создания системы разделения внимания
export function createAttentionSplittingSystem(maxEntities, difficulty) {
  return new AttentionSplittingSystem(maxEntities, difficulty);
}

// Функция для форматирования статистики разделения внимания
export function formatAttentionSplittingStats(stats) {
  return `Entities: ${stats.entities.length}/${stats.maxEntities}, Active: ${stats.activeEntityIndex}, Load: ${stats.attentionLoad.toFixed(1)}, Errors: ${stats.errors}`;
}

// Функция для создания типичной сущности для разделения внимания
export function createAttentionEntity(type, x, y, config = {}) {
  const defaultConfig = {
    speed: 1,
    color: '#ffffff',
    size: 20
  };

  return {
    type,
    x,
    y,
    ...defaultConfig,
    ...config,
    update: function(deltaTime, isActive) {
      // Базовая логика обновления сущности
      if (isActive) {
        // Логика активной сущности
        this.lastActive = Date.now();
      } else {
        // Логика неактивной сущности
        // Например, замедление или автоматическое движение
      }
    }
  };
}
