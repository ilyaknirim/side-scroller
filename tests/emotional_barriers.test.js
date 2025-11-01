// Тесты для системы эмоциональных барьеров

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  EmotionalBarriersSystem,
  createEmotionalBarriersSystem,
  formatEmotionalBarriersStats,
  createEmotionalBarrier,
} from '../src/systems/emotional_barriers.js';

describe('EmotionalBarriersSystem', () => {
  let system;

  beforeEach(() => {
    system = new EmotionalBarriersSystem(5);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxBarriers).toBe(5);
    expect(system.barriers).toEqual([]);
    expect(system.emotionRadius).toBe(200);
    expect(system.playerPosition).toEqual({ x: 0, y: 0 });
    expect(system.emotionTypes).toContain('joy');
    expect(system.emotionTypes).toContain('sadness');
    expect(system.emotionTypes).toContain('anger');
    expect(system.emotionTypes).toContain('fear');
    expect(system.emotionTypes).toContain('surprise');
    expect(system.emotionTypes).toContain('disgust');
  });

  it('должен добавлять эмоциональный барьер', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10, color: '#ffffff' };
    const barrierId = system.addBarrier(barrier, 'joy', 1.5);

    expect(barrierId).toBe(0);
    expect(system.barriers.length).toBe(1);
    expect(system.barriers[0].barrier).toBe(barrier);
    expect(system.barriers[0].emotion).toBe('joy');
    expect(system.barriers[0].intensity).toBe(1.5);
    expect(system.barriers[0].isAffected).toBe(false);
  });

  it('должен ограничивать количество барьеров', () => {
    // Заполняем до максимума
    for (let i = 0; i < 5; i++) {
      const barrier = { x: 100 + i * 50, y: 200, width: 50, height: 10 };
      system.addBarrier(barrier);
    }

    // Пытаемся добавить еще один
    const barrier = { x: 500, y: 200, width: 50, height: 10 };
    const barrierId = system.addBarrier(barrier);

    expect(barrierId).toBe(-1);
    expect(system.barriers.length).toBe(5);
  });

  it('должен ограничивать интенсивность эмоции', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10 };
    system.addBarrier(barrier, 'joy', 5); // Превышает максимум

    expect(system.barriers[0].intensity).toBe(2); // Ограничено максимумом
  });

  it('должен обновлять позицию игрока', () => {
    system.updatePlayerPosition(150, 250);

    expect(system.playerPosition).toEqual({ x: 150, y: 250 });
  });

  it('должен определять, находится ли барьер в зоне эмоционального влияния', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10 };
    system.addBarrier(barrier);
    system.updatePlayerPosition(150, 200); // Рядом с барьером

    expect(system.isBarrierAffected(system.barriers[0])).toBe(true);

    system.updatePlayerPosition(400, 200); // Далеко от барьера

    expect(system.isBarrierAffected(system.barriers[0])).toBe(false);
  });

  it('должен применять эффект радости', () => {
    const barrier = {
      x: 100,
      y: 200,
      width: 50,
      height: 10,
      color: '#808080',
      opacity: 1,
      solid: true,
    };
    system.addBarrier(barrier, 'joy', 1.0);
    const emotionalBarrier = system.barriers[0];

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).not.toBe('#808080'); // Цвет должен измениться
    expect(barrier.opacity).toBeLessThan(1); // Прозрачность должна уменьшиться

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).toBe('#808080'); // Возвращается исходный цвет
    expect(barrier.opacity).toBe(1); // Возвращается исходная прозрачность
  });

  it('должен применять эффект грусти', () => {
    const barrier = {
      x: 100,
      y: 200,
      width: 50,
      height: 10,
      color: '#808080',
      opacity: 1,
      damage: 0,
    };
    system.addBarrier(barrier, 'sadness', 1.0);
    const emotionalBarrier = system.barriers[0];

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).not.toBe('#808080'); // Цвет должен измениться
    expect(barrier.opacity).toBeGreaterThanOrEqual(1); // Прозрачность должна увеличиться или остаться прежней
    expect(barrier.damage).toBeGreaterThan(0); // Урон должен увеличиться

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).toBe('#808080'); // Возвращается исходный цвет
    expect(barrier.opacity).toBe(1); // Возвращается исходная прозрачность
    expect(barrier.damage).toBe(0); // Возвращается исходный урон
  });

  it('должен применять эффект гнева', () => {
    const barrier = {
      x: 100,
      y: 200,
      width: 50,
      height: 10,
      color: '#808080',
      shape: 'rectangle',
      damage: 0,
    };
    system.addBarrier(barrier, 'anger', 1.0);
    const emotionalBarrier = system.barriers[0];

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).not.toBe('#808080'); // Цвет должен измениться
    expect(barrier.shape).toBe('triangle'); // Форма должна измениться
    expect(barrier.damage).toBeGreaterThan(0); // Урон должен увеличиться

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).toBe('#808080'); // Возвращается исходный цвет
    expect(barrier.shape).toBe('rectangle'); // Возвращается исходная форма
    expect(barrier.damage).toBe(0); // Возвращается исходный урон
  });

  it('должен применять эффект страха', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10, opacity: 1, solid: true };
    system.addBarrier(barrier, 'fear', 1.0);
    const emotionalBarrier = system.barriers[0];

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    system.applyEmotionEffect(emotionalBarrier);

    expect(emotionalBarrier.shakeOffset.x).not.toBe(0); // Дрожание по X
    expect(emotionalBarrier.shakeOffset.y).not.toBe(0); // Дрожание по Y
    expect(barrier.opacity).toBeLessThan(1); // Прозрачность должна уменьшиться

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(emotionalBarrier.shakeOffset.x).toBe(0); // Нет дрожания по X
    expect(emotionalBarrier.shakeOffset.y).toBe(0); // Нет дрожания по Y
    expect(barrier.opacity).toBe(1); // Возвращается исходная прозрачность
  });

  it('должен применять эффект удивления', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10 };
    system.addBarrier(barrier, 'surprise', 1.0);
    const emotionalBarrier = system.barriers[0];
    const originalWidth = barrier.width;
    const originalHeight = barrier.height;

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    emotionalBarrier.pulsePhase = Math.PI / 2; // Максимальное значение синуса
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.width).toBeGreaterThan(originalWidth); // Ширина должна увеличиться
    expect(barrier.height).toBeGreaterThan(originalHeight); // Высота должна увеличиться

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.width).toBe(originalWidth); // Возвращается исходная ширина
    expect(barrier.height).toBe(originalHeight); // Возвращается исходная высота
  });

  it('должен применять эффект отвращения', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10, color: '#808080' };
    system.addBarrier(barrier, 'disgust', 1.0);
    const emotionalBarrier = system.barriers[0];

    // При эмоциональном влиянии
    emotionalBarrier.isAffected = true;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).not.toBe('#808080'); // Цвет должен измениться
    expect(barrier.slowdown).toBeGreaterThan(0); // Замедление должно быть установлено

    // Без эмоционального влияния
    emotionalBarrier.isAffected = false;
    system.applyEmotionEffect(emotionalBarrier);

    expect(barrier.color).toBe('#808080'); // Возвращается исходный цвет
    expect(barrier.slowdown).toBeUndefined(); // Замедление должно быть удалено
  });

  it('должен обновлять состояние системы', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10 };
    system.addBarrier(barrier);

    const now = Date.now();
    const originalTime = now - 1000;

    // Устанавливаем время последнего эмоционального влияния
    system.barriers[0].lastEmotionTime = originalTime;

    // Обновляем систему
    system.update(100);

    // Время должно обновиться, если состояние влияния изменилось
    // (но в данном случае оно не изменилось, поэтому время должно остаться прежним)
    expect(system.barriers[0].lastEmotionTime).toBe(originalTime);
  });

  it('должен правильно возвращать состояние', () => {
    const barrier = { x: 100, y: 200, width: 50, height: 10, id: 'test-barrier' };
    system.addBarrier(barrier, 'joy', 1.0);
    system.updatePlayerPosition(150, 200);

    const state = system.getState();

    expect(state.barriers).toHaveLength(1);
    expect(state.barriers[0].emotion).toBe('joy');
    expect(state.barriers[0].intensity).toBe(1.0);
    expect(state.barriers[0].barrierId).toBe('test-barrier');
    expect(state.emotionRadius).toBe(200);
    expect(state.playerPosition).toEqual({ x: 150, y: 200 });
  });

  it('должен сбрасывать состояние', () => {
    const barrier = {
      x: 100,
      y: 200,
      width: 50,
      height: 10,
      color: '#808080',
      solid: true,
      damage: 0,
    };
    system.addBarrier(barrier, 'sadness', 1.0);

    // Применяем эффект
    system.barriers[0].isAffected = true;
    system.applyEmotionEffect(system.barriers[0]);

    expect(barrier.color).not.toBe('#808080'); // Цвет изменен
    expect(barrier.damage).toBeGreaterThan(0); // Урон изменен

    // Сбрасываем систему
    system.reset();

    expect(system.barriers).toEqual([]);
    expect(barrier.color).toBe('#808080'); // Возвращается исходный цвет
    expect(barrier.damage).toBe(0); // Возвращается исходный урон
  });

  it('должен правильно осветлять цвет', () => {
    const color = '#808080'; // Серый
    const lightened = system.lightenColor(color, 0.5);

    expect(lightened).not.toBe(color);
    expect(lightened).toMatch(/^#[0-9a-f]{6}$/); // Должен быть валидным HEX-цветом
  });

  it('должен правильно затемнять цвет', () => {
    const color = '#808080'; // Серый
    const darkened = system.darkenColor(color, 0.5);

    expect(darkened).not.toBe(color);
    expect(darkened).toMatch(/^#[0-9a-f]{6}$/); // Должен быть валидным HEX-цветом
  });

  it('должен правильно добавлять цветовой оттенок', () => {
    const baseColor = '#808080'; // Серый
    const tintColor = '#ff0000'; // Красный
    const tinted = system.addColorTint(baseColor, tintColor, 0.5);

    expect(tinted).not.toBe(baseColor);
    expect(tinted).not.toBe(tintColor);
    expect(tinted).toMatch(/^#[0-9a-f]{6}$/); // Должен быть валидным HEX-цветом
  });
});

describe('createEmotionalBarriersSystem', () => {
  it('должен создавать экземпляр EmotionalBarriersSystem', () => {
    const system = createEmotionalBarriersSystem(10);

    expect(system).toBeInstanceOf(EmotionalBarriersSystem);
    expect(system.maxBarriers).toBe(10);
  });
});

describe('formatEmotionalBarriersStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      barriers: [{ isAffected: true }, { isAffected: false }, { isAffected: true }],
      maxBarriers: 5,
    };

    const formatted = formatEmotionalBarriersStats(stats);

    expect(formatted).toBe('Барьеров: 3/5, Под влиянием: 2');
  });
});

describe('createEmotionalBarrier', () => {
  it('должен создавать барьер с указанными параметрами', () => {
    const barrier = createEmotionalBarrier(100, 200, 50, 10, 'joy', 1.5);

    expect(barrier.x).toBe(100);
    expect(barrier.y).toBe(200);
    expect(barrier.width).toBe(50);
    expect(barrier.height).toBe(10);
    expect(barrier.emotion).toBe('joy');
    expect(barrier.intensity).toBe(1.5);
    expect(barrier.color).toBe('#ffffff');
    expect(barrier.opacity).toBe(1);
    expect(barrier.shape).toBe('rectangle');
    expect(barrier.solid).toBe(true);
    expect(barrier.damage).toBe(0);
  });
});
