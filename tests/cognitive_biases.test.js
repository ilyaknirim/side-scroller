// Тесты для системы когнитивных искажений

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  CognitiveBiasesSystem,
  createCognitiveBiasesSystem,
  formatCognitiveBiasesStats,
  createBiasedPlatform,
} from '../src/systems/cognitive_biases.js';

describe('CognitiveBiasesSystem', () => {
  let system;

  beforeEach(() => {
    system = new CognitiveBiasesSystem(5);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxBiases).toBe(5);
    expect(system.biases).toEqual([]);
    expect(system.observationRadius).toBe(150);
    expect(system.playerPosition).toEqual({ x: 0, y: 0 });
    expect(system.biasTypes).toContain('confirmation');
    expect(system.biasTypes).toContain('negativity');
    expect(system.biasTypes).toContain('availability');
    expect(system.biasTypes).toContain('anchoring');
    expect(system.biasTypes).toContain('illusory');
    expect(system.biasTypes).toContain('bandwagon');
  });

  it('должен добавлять когнитивное искажение', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, color: '#ffffff' };
    const biasId = system.addBias(platform, 'confirmation', 1.5);

    expect(biasId).toBe(0);
    expect(system.biases.length).toBe(1);
    expect(system.biases[0].platform).toBe(platform);
    expect(system.biases[0].type).toBe('confirmation');
    expect(system.biases[0].strength).toBe(1.5);
    expect(system.biases[0].isObserved).toBe(false);
  });

  it('должен ограничивать количество искажений', () => {
    // Заполняем до максимума
    for (let i = 0; i < 5; i++) {
      const platform = { x: 100 + i * 50, y: 200, width: 50, height: 10 };
      system.addBias(platform);
    }

    // Пытаемся добавить еще одно
    const platform = { x: 500, y: 200, width: 50, height: 10 };
    const biasId = system.addBias(platform);

    expect(biasId).toBe(-1);
    expect(system.biases.length).toBe(5);
  });

  it('должен ограничивать силу искажения', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10 };
    system.addBias(platform, 'confirmation', 5); // Превышает максимум

    expect(system.biases[0].strength).toBe(2); // Ограничено максимумом
  });

  it('должен обновлять позицию игрока', () => {
    system.updatePlayerPosition(150, 250);

    expect(system.playerPosition).toEqual({ x: 150, y: 250 });
  });

  it('должен определять, наблюдается ли платформа', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10 };
    system.addBias(platform);
    system.updatePlayerPosition(150, 200); // Рядом с платформой

    expect(system.isPlatformObserved(system.biases[0])).toBe(true);

    system.updatePlayerPosition(300, 200); // Далеко от платформы

    expect(system.isPlatformObserved(system.biases[0])).toBe(false);
  });

  it('должен применять эффект подтверждающего искажения', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, color: '#ffffff', solid: true };
    system.addBias(platform, 'confirmation', 1.0);
    const bias = system.biases[0];

    // При наблюдении
    bias.isObserved = true;
    system.applyBiasEffect(bias);

    expect(platform.solid).toBe(true);
    expect(platform.color).toBe('#00ff00');

    // Без наблюдения
    bias.isObserved = false;
    system.applyBiasEffect(bias);

    expect(platform.solid).toBeLessThan(1); // Менее твердая
    expect(platform.color).toBe('#ffffff');
  });

  it('должен применять эффект негативного искажения', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, color: '#ffffff', dangerous: false };
    system.addBias(platform, 'negativity', 1.0);
    const bias = system.biases[0];

    // При наблюдении
    bias.isObserved = true;
    system.applyBiasEffect(bias);

    expect(platform.dangerous).toBe(true);
    expect(platform.color).toBe('#ff0000');

    // Без наблюдения
    bias.isObserved = false;
    system.applyBiasEffect(bias);

    expect(platform.dangerous).toBe(false);
    expect(platform.color).toBe('#ffffff');
  });

  it('должен применять эффект искажения доступности', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, visible: true, solid: true };
    system.addBias(platform, 'availability', 1.0);
    const bias = system.biases[0];

    // При наблюдении
    bias.isObserved = true;
    system.applyBiasEffect(bias);

    expect(platform.visible).toBe(false);
    expect(platform.solid).toBe(false);

    // Без наблюдения
    bias.isObserved = false;
    system.applyBiasEffect(bias);

    expect(platform.visible).toBe(true);
    expect(platform.solid).toBe(true);
  });

  it('должен применять эффект якоря', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10 };
    system.addBias(platform, 'anchoring', 1.0);
    system.updatePlayerPosition(150, 200); // Рядом с платформой
    const bias = system.biases[0];

    // При наблюдении
    bias.isObserved = true;
    system.applyBiasEffect(bias);

    expect(platform.pullForce).toBeDefined();
    expect(platform.pullForce.x).toBeLessThan(0); // Сила притяжения влево
    expect(platform.pullForce.y).toBe(0);

    // Без наблюдения
    bias.isObserved = false;
    system.applyBiasEffect(bias);

    expect(platform.pullForce.x).toBe(0);
    expect(platform.pullForce.y).toBe(0);
  });

  it('должен применять эффект иллюзорного искажения', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10 };
    system.addBias(platform, 'illusory', 1.0);
    const bias = system.biases[0];
    const originalWidth = platform.width;
    const originalHeight = platform.height;

    // При наблюдении
    bias.isObserved = true;
    system.applyBiasEffect(bias);

    expect(platform.width).toBeGreaterThan(originalWidth);
    expect(platform.height).toBeGreaterThan(originalHeight);

    // Без наблюдения
    bias.isObserved = false;
    system.applyBiasEffect(bias);

    expect(platform.width).toBe(originalWidth);
    expect(platform.height).toBe(originalHeight);
  });

  it('должен применять эффект толпы', () => {
    const platform1 = { x: 100, y: 200, width: 50, height: 10 };
    const platform2 = { x: 200, y: 200, width: 50, height: 10 };

    system.addBias(platform1, 'bandwagon', 1.0);
    system.addBias(platform2, 'confirmation', 1.0);

    const bias1 = system.biases[0];
    const bias2 = system.biases[1];

    const originalX1 = platform1.x;
    const originalX2 = platform2.x;

    // При наблюдении первой платформы
    bias1.isObserved = true;
    system.applyBiasEffect(bias1);

    // Первая платформа должна двигаться в сторону второй
    expect(platform1.x).toBeGreaterThan(originalX1);
    expect(platform2.x).toBe(originalX2); // Вторая не двигается
  });

  it('должен обновлять состояние системы', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10 };
    system.addBias(platform);

    const now = Date.now();
    const originalTime = now - 1000;

    // Устанавливаем время последнего наблюдения
    system.biases[0].lastObservationTime = originalTime;

    // Обновляем систему
    system.update(100);

    // Время должно обновиться, если состояние наблюдения изменилось
    // (но в данном случае оно не изменилось, поэтому время должно остаться прежним)
    expect(system.biases[0].lastObservationTime).toBe(originalTime);
  });

  it('должен правильно возвращать состояние', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, id: 'test-platform' };
    system.addBias(platform, 'confirmation', 1.0);
    system.updatePlayerPosition(150, 200);

    const state = system.getState();

    expect(state.biases).toHaveLength(1);
    expect(state.biases[0].type).toBe('confirmation');
    expect(state.biases[0].strength).toBe(1.0);
    expect(state.biases[0].platformId).toBe('test-platform');
    expect(state.observationRadius).toBe(150);
    expect(state.playerPosition).toEqual({ x: 150, y: 200 });
  });

  it('должен сбрасывать состояние', () => {
    const platform = { x: 100, y: 200, width: 50, height: 10, solid: true, dangerous: false };
    system.addBias(platform, 'anchoring', 1.0);
    system.updatePlayerPosition(150, 200); // Рядом с платформой

    // Применяем эффект
    system.biases[0].isObserved = true;
    system.applyBiasEffect(system.biases[0]);

    expect(platform.pullForce).toBeDefined();

    // Сбрасываем систему
    system.reset();

    expect(system.biases).toEqual([]);
    expect(platform.pullForce).toEqual({ x: 0, y: 0 });
  });
});

describe('createCognitiveBiasesSystem', () => {
  it('должен создавать экземпляр CognitiveBiasesSystem', () => {
    const system = createCognitiveBiasesSystem(10);

    expect(system).toBeInstanceOf(CognitiveBiasesSystem);
    expect(system.maxBiases).toBe(10);
  });
});

describe('formatCognitiveBiasesStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      biases: [{ isObserved: true }, { isObserved: false }, { isObserved: true }],
      maxBiases: 5,
    };

    const formatted = formatCognitiveBiasesStats(stats);

    expect(formatted).toBe('Искажений: 3/5, Наблюдается: 2');
  });
});

describe('createBiasedPlatform', () => {
  it('должен создавать платформу с указанными параметрами', () => {
    const platform = createBiasedPlatform(100, 200, 50, 10, 'confirmation', 1.5);

    expect(platform.x).toBe(100);
    expect(platform.y).toBe(200);
    expect(platform.width).toBe(50);
    expect(platform.height).toBe(10);
    expect(platform.biasType).toBe('confirmation');
    expect(platform.biasStrength).toBe(1.5);
    expect(platform.color).toBe('#ffffff');
    expect(platform.solid).toBe(true);
    expect(platform.dangerous).toBe(false);
    expect(platform.visible).toBe(true);
  });
});
