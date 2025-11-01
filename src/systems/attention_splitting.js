// Attention Splitting System - управление несколькими сущностями одновременно
// Реализует когнитивную механику разделения внимания

export class AttentionSplittingSystem {
  constructor(maxEntities = 3, difficulty = 1) {
    this.entities = [];
    this.maxEntities = maxEntities;
    this.difficulty = difficulty;
    this.activeEntityIndex = 0;
    this.attentionLoad = 0;
    this.errors = 0;
    this.switchCooldown = 0;
  }

  // Добавить сущность для управления
  addEntity(entity) {
    if (this.entities.length >= this.maxEntities) {
      return -1; // Maximum entities reached
    }

    const newEntity = {
      ...entity,
      isActive: this.entities.length === 0, // First entity is active
    };

    this.entities.push(newEntity);
    this.updateAttentionLoad();
    return this.entities.length - 1; // Return index
  }

  // Переключить активную сущность
  switchActiveEntity(index) {
    if (index < 0 || index >= this.entities.length) {
      this.errors++;
      return false;
    }

    if (this.switchCooldown > 0) {
      this.errors++;
      return false;
    }

    // Deactivate current active entity
    if (this.entities[this.activeEntityIndex]) {
      this.entities[this.activeEntityIndex].isActive = false;
    }

    // Activate new entity
    this.activeEntityIndex = index;
    this.entities[index].isActive = true;

    // Set cooldown
    this.switchCooldown = 500; // 500ms cooldown

    return true;
  }

  // Обновить систему (вызывать каждый кадр)
  update(deltaTime) {
    // Update switch cooldown
    if (this.switchCooldown > 0) {
      this.switchCooldown -= deltaTime;
      if (this.switchCooldown < 0) this.switchCooldown = 0;
    }

    // Update entities
    this.entities.forEach((entity, index) => {
      if (entity.update) {
        entity.update(deltaTime, entity.isActive);
      }
    });

    this.updateAttentionLoad();
  }

  // Обновить нагрузку внимания
  updateAttentionLoad() {
    this.attentionLoad = this.entities.length * this.difficulty;
  }

  // Получить состояние системы
  getState() {
    return {
      entities: this.entities,
      activeEntityIndex: this.activeEntityIndex,
      maxEntities: this.maxEntities,
      attentionLoad: this.attentionLoad,
      difficulty: this.difficulty,
      errors: this.errors,
      switchCooldown: this.switchCooldown,
      canSwitch: this.switchCooldown <= 0,
    };
  }

  // Сбросить систему
  reset() {
    this.entities = [];
    this.activeEntityIndex = 0;
    this.attentionLoad = 0;
    this.errors = 0;
    this.switchCooldown = 0;
  }
}

// Функция создания системы разделения внимания
export function createAttentionSplittingSystem(maxEntities = 3, difficulty = 1) {
  return new AttentionSplittingSystem(maxEntities, difficulty);
}

// Форматирование статистики системы разделения внимания
export function formatAttentionSplittingStats(stats) {
  return `Entities: ${stats.entities.length}/${stats.maxEntities}, Active: ${stats.activeEntityIndex}, Load: ${stats.attentionLoad}, Errors: ${stats.errors}`;
}

// Создать сущность для управления
export function createAttentionEntity(type, x, y, options = {}) {
  const entity = {
    type,
    x,
    y,
    speed: options.speed || 1,
    color: options.color || '#ffffff',
    size: options.size || 20,
    update(deltaTime, isActive) {
      // Simple update logic
      if (isActive) {
        // Active entity moves faster or something
      }
    },
  };

  return entity;
}
