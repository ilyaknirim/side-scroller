// Тесты для системы локальных временных полей

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  TemporalFieldsSystem,
  createTemporalFieldsSystem,
  formatTemporalFieldsStats,
  createTemporalField,
} from '../src/systems/temporal_fields.js';

describe('TemporalFieldsSystem', () => {
  let system;

  beforeEach(() => {
    system = new TemporalFieldsSystem(4);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxFields).toBe(4);
    expect(system.fields).toEqual([]);
    expect(system.playerPosition).toEqual({ x: 0, y: 0 });
    expect(system.fieldTypes).toContain('slowdown');
    expect(system.fieldTypes).toContain('speedup');
    expect(system.fieldTypes).toContain('reversal');
    expect(system.fieldTypes).toContain('stasis');
    expect(system.fieldTypes).toContain('oscillation');
  });

  it('должен добавлять временное поле', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff' };
    const fieldId = system.addField(field, 'slowdown', 1.5);

    expect(fieldId).toBe(0);
    expect(system.fields.length).toBe(1);
    expect(system.fields[0].field).toBe(field);
    expect(system.fields[0].type).toBe('slowdown');
    expect(system.fields[0].intensity).toBe(1.5);
    expect(system.fields[0].isAffected).toBe(false);
  });

  it('должен ограничивать количество полей', () => {
    // Заполняем до максимума
    for (let i = 0; i < 4; i++) {
      const field = { x: 100 + i * 50, y: 200, radius: 50 };
      system.addField(field);
    }

    // Пытаемся добавить еще одно
    const field = { x: 500, y: 200, radius: 50 };
    const fieldId = system.addField(field);

    expect(fieldId).toBe(-1);
    expect(system.fields.length).toBe(4);
  });

  it('должен ограничивать интенсивность поля', () => {
    const field = { x: 100, y: 200, radius: 50 };
    system.addField(field, 'slowdown', 5); // Превышает максимум

    expect(system.fields[0].intensity).toBe(2); // Ограничено максимумом
  });

  it('должен обновлять позицию игрока', () => {
    system.updatePlayerPosition(150, 250);

    expect(system.playerPosition).toEqual({ x: 150, y: 250 });
  });

  it('должен определять, находится ли игрок в поле', () => {
    const field = { x: 100, y: 200, radius: 50 };
    system.addField(field);
    system.updatePlayerPosition(120, 200); // Внутри поля

    expect(system.isPlayerAffected(system.fields[0])).toBe(true);

    system.updatePlayerPosition(200, 200); // Вне поля

    expect(system.isPlayerAffected(system.fields[0])).toBe(false);
  });

  it('должен применять эффект замедления времени', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'slowdown', 1.0);
    const temporalField = system.fields[0];

    // При влиянии поля
    temporalField.isAffected = true;
    const modifiedTime = system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBeLessThan(1); // Время должно замедлиться
    expect(field.color).not.toBe('#ffffff'); // Цвет должен измениться
    expect(field.opacity).toBeGreaterThan(0.3); // Прозрачность должна увеличиться
    expect(modifiedTime).toBeLessThan(100); // Модифицированное время должно быть меньше

    // Без влияния поля
    temporalField.isAffected = false;
    system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(1); // Время должно вернуться к нормальному
    expect(field.color).toBe('#ffffff'); // Цвет должен вернуться к исходному
    expect(field.opacity).toBe(0.3); // Прозрачность должна вернуться к исходной
  });

  it('должен применять эффект ускорения времени', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'speedup', 1.0);
    const temporalField = system.fields[0];

    // При влиянии поля
    temporalField.isAffected = true;
    const modifiedTime = system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBeGreaterThan(1); // Время должно ускориться
    expect(field.color).not.toBe('#ffffff'); // Цвет должен измениться
    expect(field.opacity).toBeGreaterThan(0.3); // Прозрачность должна увеличиться
    expect(modifiedTime).toBeGreaterThan(100); // Модифицированное время должно быть больше

    // Без влияния поля
    temporalField.isAffected = false;
    system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(1); // Время должно вернуться к нормальному
    expect(field.color).toBe('#ffffff'); // Цвет должен вернуться к исходному
    expect(field.opacity).toBe(0.3); // Прозрачность должна вернуться к исходной
  });

  it('должен применять эффект обратного времени', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'reversal', 1.0);
    const temporalField = system.fields[0];

    // При влиянии поля
    temporalField.isAffected = true;
    const modifiedTime = system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBeLessThan(0); // Время должно идти назад
    expect(field.color).not.toBe('#ffffff'); // Цвет должен измениться
    expect(field.opacity).toBeGreaterThan(0.3); // Прозрачность должна увеличиться
    expect(modifiedTime).toBeLessThan(0); // Модифицированное время должно быть отрицательным

    // Без влияния поля
    temporalField.isAffected = false;
    system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(1); // Время должно вернуться к нормальному
    expect(field.color).toBe('#ffffff'); // Цвет должен вернуться к исходному
    expect(field.opacity).toBe(0.3); // Прозрачность должна вернуться к исходной
  });

  it('должен применять эффект стазиса', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'stasis', 1.0);
    const temporalField = system.fields[0];

    // При влиянии поля
    temporalField.isAffected = true;
    const modifiedTime = system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(0); // Время должно остановиться
    expect(field.color).not.toBe('#ffffff'); // Цвет должен измениться
    expect(field.opacity).toBeGreaterThan(0.3); // Прозрачность должна увеличиться
    expect(modifiedTime).toBe(0); // Модифицированное время должно быть нулевым

    // Без влияния поля
    temporalField.isAffected = false;
    system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(1); // Время должно вернуться к нормальному
    expect(field.color).toBe('#ffffff'); // Цвет должен вернуться к исходному
    expect(field.opacity).toBe(0.3); // Прозрачность должна вернуться к исходной
  });

  it('должен применять эффект колебательного времени', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'oscillation', 1.0);
    const temporalField = system.fields[0];

    // При влиянии поля
    temporalField.isAffected = true;
    temporalField.pulsePhase = Math.PI / 2; // Максимальное значение синуса
    const modifiedTime = system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBeGreaterThan(1); // Время должно ускориться (в максимуме синуса)
    expect(field.color).not.toBe('#ffffff'); // Цвет должен измениться
    expect(field.opacity).toBeGreaterThan(0.3); // Прозрачность должна увеличиться
    expect(modifiedTime).toBeGreaterThan(100); // Модифицированное время должно быть больше

    // Без влияния поля
    temporalField.isAffected = false;
    system.applyFieldEffect(temporalField, 100);

    expect(field.timeScale).toBe(1); // Время должно вернуться к нормальному
    expect(field.color).toBe('#ffffff'); // Цвет должен вернуться к исходному
    expect(field.opacity).toBe(0.3); // Прозрачность должна вернуться к исходной
  });

  it('должен обновлять состояние системы', () => {
    const field = { x: 100, y: 200, radius: 50 };
    system.addField(field);

    const now = Date.now();
    const originalTime = now - 1000;

    // Устанавливаем время последнего влияния поля
    system.fields[0].lastFieldTime = originalTime;

    // Обновляем систему
    system.update(100);

    // Время должно обновиться, если состояние влияния изменилось
    // (но в данном случае оно не изменилось, поэтому время должно остаться прежним)
    expect(system.fields[0].lastFieldTime).toBe(originalTime);
  });

  it('должен правильно возвращать состояние', () => {
    const field = { x: 100, y: 200, radius: 50, id: 'test-field' };
    system.addField(field, 'slowdown', 1.0);
    system.updatePlayerPosition(150, 200);

    const state = system.getState();

    expect(state.fields).toHaveLength(1);
    expect(state.fields[0].type).toBe('slowdown');
    expect(state.fields[0].intensity).toBe(1.0);
    expect(state.fields[0].fieldId).toBe('test-field');
    expect(state.playerPosition).toEqual({ x: 150, y: 200 });
  });

  it('должен сбрасывать состояние', () => {
    const field = { x: 100, y: 200, radius: 50, color: '#ffffff', opacity: 0.3, timeScale: 1 };
    system.addField(field, 'slowdown', 1.0);

    // Применяем эффект
    system.fields[0].isAffected = true;
    system.applyFieldEffect(system.fields[0], 100);

    expect(field.color).not.toBe('#ffffff'); // Цвет изменен
    expect(field.timeScale).not.toBe(1); // Масштаб времени изменен

    // Сбрасываем систему
    system.reset();

    expect(system.fields).toEqual([]);
    expect(field.color).toBe('#ffffff'); // Возвращается исходный цвет
    expect(field.timeScale).toBe(1); // Возвращается исходный масштаб времени
  });

  it('должен правильно добавлять цветовой оттенок', () => {
    const baseColor = '#ffffff'; // Белый
    const tintColor = '#ff0000'; // Красный
    const tinted = system.addColorTint(baseColor, tintColor, 0.5);

    expect(tinted).not.toBe(baseColor);
    expect(tinted).not.toBe(tintColor);
    expect(tinted).toMatch(/^#[0-9a-f]{6}$/); // Должен быть валидным HEX-цветом
  });
});

describe('createTemporalFieldsSystem', () => {
  it('должен создавать экземпляр TemporalFieldsSystem', () => {
    const system = createTemporalFieldsSystem(6);

    expect(system).toBeInstanceOf(TemporalFieldsSystem);
    expect(system.maxFields).toBe(6);
  });
});

describe('formatTemporalFieldsStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      fields: [{ isAffected: true }, { isAffected: false }, { isAffected: true }],
      maxFields: 4,
    };

    const formatted = formatTemporalFieldsStats(stats);

    expect(formatted).toBe('Полей: 3/4, Под влиянием: 2');
  });
});

describe('createTemporalField', () => {
  it('должен создавать поле с указанными параметрами', () => {
    const field = createTemporalField(100, 200, 50, 'slowdown', 1.5);

    expect(field.x).toBe(100);
    expect(field.y).toBe(200);
    expect(field.radius).toBe(50);
    expect(field.type).toBe('slowdown');
    expect(field.intensity).toBe(1.5);
    expect(field.color).toBe('#ffffff');
    expect(field.opacity).toBe(0.3);
    expect(field.timeScale).toBe(1);
    expect(field.pulsePhase).toBe(0);
  });
});
