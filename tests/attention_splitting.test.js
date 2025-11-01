// Тесты для системы разделения внимания

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  AttentionSplittingSystem,
  createAttentionSplittingSystem,
  formatAttentionSplittingStats,
  createAttentionEntity,
} from '../src/systems/attention_splitting.js';

describe('AttentionSplittingSystem', () => {
  let system;

  beforeEach(() => {
    system = new AttentionSplittingSystem(3, 1);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxEntities).toBe(3);
    expect(system.difficulty).toBe(1);
    expect(system.entities).toEqual([]);
    expect(system.activeEntityIndex).toBe(0);
    expect(system.attentionLoad).toBe(0);
    expect(system.errors).toBe(0);
    expect(system.switchCooldown).toBe(0);
  });

  it('должен добавлять сущности до максимального количества', () => {
    const entity1 = { type: 'test', x: 0, y: 0 };
    const entity2 = { type: 'test', x: 10, y: 10 };
    const entity3 = { type: 'test', x: 20, y: 20 };
    const entity4 = { type: 'test', x: 30, y: 30 };

    const id1 = system.addEntity(entity1);
    const id2 = system.addEntity(entity2);
    const id3 = system.addEntity(entity3);
    const id4 = system.addEntity(entity4);

    expect(id1).toBe(0);
    expect(id2).toBe(1);
    expect(id3).toBe(2);
    expect(id4).toBe(-1); // Превышение лимита

    expect(system.entities.length).toBe(3);
    expect(system.entities[0].isActive).toBe(true);
    expect(system.entities[1].isActive).toBe(false);
    expect(system.entities[2].isActive).toBe(false);
  });

  it('должен переключаться между сущностями', () => {
    const entity1 = { type: 'test', x: 0, y: 0 };
    const entity2 = { type: 'test', x: 10, y: 10 };

    system.addEntity(entity1);
    system.addEntity(entity2);

    expect(system.activeEntityIndex).toBe(0);
    expect(system.entities[0].isActive).toBe(true);
    expect(system.entities[1].isActive).toBe(false);

    const result = system.switchActiveEntity(1);

    expect(result).toBe(true);
    expect(system.activeEntityIndex).toBe(1);
    expect(system.entities[0].isActive).toBe(false);
    expect(system.entities[1].isActive).toBe(true);
  });

  it('должен устанавливать перезарядку после переключения', () => {
    const entity1 = { type: 'test', x: 0, y: 0 };
    const entity2 = { type: 'test', x: 10, y: 10 };

    system.addEntity(entity1);
    system.addEntity(entity2);

    system.switchActiveEntity(1);

    expect(system.switchCooldown).toBeGreaterThan(0);

    // Попытка переключения во время перезарядки
    const result = system.switchActiveEntity(0);

    expect(result).toBe(false);
    expect(system.activeEntityIndex).toBe(1); // Индекс не изменился
    expect(system.errors).toBe(1);
  });

  it('должен обновлять состояние системы', () => {
    const entity1 = { type: 'test', x: 0, y: 0, update: jest.fn() };
    const entity2 = { type: 'test', x: 10, y: 10, update: jest.fn() };

    system.addEntity(entity1);
    system.addEntity(entity2);

    system.update(16); // 16ms deltaTime

    expect(entity1.update).toHaveBeenCalledWith(16, true);
    expect(entity2.update).toHaveBeenCalledWith(16, false);

    // Проверяем расчет нагрузки на внимание
    expect(system.attentionLoad).toBe(2); // 2 сущности * сложность 1
  });

  it('должен правильно возвращать состояние', () => {
    const entity1 = { type: 'test', x: 0, y: 0 };
    const entity2 = { type: 'test', x: 10, y: 10 };

    system.addEntity(entity1);
    system.addEntity(entity2);

    // Вызываем update для расчета нагрузки на внимание
    system.update(16);

    const state = system.getState();

    expect(state.entities).toEqual(system.entities);
    expect(state.activeEntityIndex).toBe(0);
    expect(state.maxEntities).toBe(3);
    expect(state.attentionLoad).toBe(2);
    expect(state.difficulty).toBe(1);
    expect(state.errors).toBe(0);
    expect(state.switchCooldown).toBe(0);
    expect(state.canSwitch).toBe(true);
  });

  it('должен сбрасывать состояние', () => {
    const entity1 = { type: 'test', x: 0, y: 0 };
    system.addEntity(entity1);
    system.switchActiveEntity(0);
    system.update(16);

    system.reset();

    expect(system.entities).toEqual([]);
    expect(system.activeEntityIndex).toBe(0);
    expect(system.attentionLoad).toBe(0);
    expect(system.errors).toBe(0);
    expect(system.switchCooldown).toBe(0);
  });
});

describe('createAttentionSplittingSystem', () => {
  it('должен создавать экземпляр AttentionSplittingSystem', () => {
    const system = createAttentionSplittingSystem(5, 2);

    expect(system).toBeInstanceOf(AttentionSplittingSystem);
    expect(system.maxEntities).toBe(5);
    expect(system.difficulty).toBe(2);
  });
});

describe('formatAttentionSplittingStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      entities: [{}, {}, {}],
      activeEntityIndex: 1,
      maxEntities: 5,
      attentionLoad: 3.5,
      errors: 2,
    };

    const formatted = formatAttentionSplittingStats(stats);

    expect(formatted).toBe('Entities: 3/5, Active: 1, Load: 3.5, Errors: 2');
  });
});

describe('createAttentionEntity', () => {
  it('должен создавать сущность с указанными параметрами', () => {
    const entity = createAttentionEntity('player', 100, 200, {
      speed: 2,
      color: '#ff0000',
      size: 30,
    });

    expect(entity.type).toBe('player');
    expect(entity.x).toBe(100);
    expect(entity.y).toBe(200);
    expect(entity.speed).toBe(2);
    expect(entity.color).toBe('#ff0000');
    expect(entity.size).toBe(30);
    expect(typeof entity.update).toBe('function');
  });

  it('должен использовать значения по умолчанию', () => {
    const entity = createAttentionEntity('player', 100, 200);

    expect(entity.type).toBe('player');
    expect(entity.x).toBe(100);
    expect(entity.y).toBe(200);
    expect(entity.speed).toBe(1);
    expect(entity.color).toBe('#ffffff');
    expect(entity.size).toBe(20);
  });
});
