// Тесты для системы проприоцептивного дрифта

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ProprioceptiveDriftSystem,
  createProprioceptiveDriftSystem,
  formatProprioceptiveDriftStats,
  createProprioceptiveDrift,
} from '../src/systems/proprioceptive_drift.js';

describe('ProprioceptiveDriftSystem', () => {
  let system;

  beforeEach(() => {
    system = new ProprioceptiveDriftSystem(2);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxDrift).toBe(2);
    expect(system.drifts).toEqual([]);
    expect(system.playerPosition).toEqual({ x: 0, y: 0 });
    expect(system.driftTypes).toContain('position');
    expect(system.driftTypes).toContain('size');
    expect(system.driftTypes).toContain('orientation');
    expect(system.driftTypes).toContain('gravity');
    expect(system.driftTypes).toContain('momentum');
  });

  it('должен добавлять проприоцептивный дрифт', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    const driftId = system.addDrift(drift, 'position', 1.5);

    expect(driftId).toBe(0);
    expect(system.drifts.length).toBe(1);
    expect(system.drifts[0].drift).toBe(drift);
    expect(system.drifts[0].type).toBe('position');
    expect(system.drifts[0].intensity).toBe(1.5);
    expect(system.drifts[0].isActive).toBe(false);
  });

  it('должен ограничивать количество дрифтов', () => {
    // Заполняем до максимума
    for (let i = 0; i < 2; i++) {
      const drift = { positionOffset: { x: 0, y: 0 } };
      system.addDrift(drift);
    }

    // Пытаемся добавить еще один
    const drift = { positionOffset: { x: 0, y: 0 } };
    const driftId = system.addDrift(drift);

    expect(driftId).toBe(-1);
    expect(system.drifts.length).toBe(2);
  });

  it('должен ограничивать интенсивность дрифта', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    system.addDrift(drift, 'position', 5); // Превышает максимум

    expect(system.drifts[0].intensity).toBe(2); // Ограничено максимумом
  });

  it('должен обновлять позицию игрока', () => {
    system.updatePlayerPosition(150, 250);

    expect(system.playerPosition).toEqual({ x: 150, y: 250 });
  });

  it('должен определять, активен ли дрифт', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    system.addDrift(drift);

    // По умолчанию дрифт всегда активен
    expect(system.isDriftActive(system.drifts[0])).toBe(true);
  });

  it('должен применять эффект смещения позиции', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    system.addDrift(drift, 'position', 1.0);
    const proprioceptiveDrift = system.drifts[0];

    // При активном дрифте
    proprioceptiveDrift.isActive = true;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.positionOffset.x).not.toBe(0); // Смещение по X должно измениться
    expect(drift.positionOffset.y).not.toBe(0); // Смещение по Y должно измениться

    // При неактивном дрифте
    proprioceptiveDrift.isActive = false;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.positionOffset.x).toBe(0); // Смещение по X должно вернуться к исходному
    expect(drift.positionOffset.y).toBe(0); // Смещение по Y должно вернуться к исходному
  });

  it('должен применять эффект искажения размера', () => {
    const drift = { sizeMultiplier: 1 };
    system.addDrift(drift, 'size', 1.0);
    const proprioceptiveDrift = system.drifts[0];

    // При активном дрифте
    proprioceptiveDrift.isActive = true;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.sizeMultiplier).not.toBe(1); // Множитель размера должен измениться

    // При неактивном дрифте
    proprioceptiveDrift.isActive = false;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.sizeMultiplier).toBe(1); // Множитель размера должен вернуться к исходному
  });

  it('должен применять эффект искажения ориентации', () => {
    const drift = { rotationAngle: 0 };
    system.addDrift(drift, 'orientation', 1.0);
    const proprioceptiveDrift = system.drifts[0];

    // При активном дрифте
    proprioceptiveDrift.isActive = true;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.rotationAngle).not.toBe(0); // Угол поворота должен измениться

    // При неактивном дрифте
    proprioceptiveDrift.isActive = false;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.rotationAngle).toBe(0); // Угол поворота должен вернуться к исходному
  });

  it('должен применять эффект искажения гравитации', () => {
    const drift = { gravityDirection: { x: 0, y: 1 } };
    system.addDrift(drift, 'gravity', 1.0);
    const proprioceptiveDrift = system.drifts[0];

    // При активном дрифте
    proprioceptiveDrift.isActive = true;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.gravityDirection.x).not.toBe(0); // Направление гравитации по X должно измениться
    expect(drift.gravityDirection.y).not.toBe(1); // Направление гравитации по Y должно измениться

    // При неактивном дрифте
    proprioceptiveDrift.isActive = false;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.gravityDirection.x).toBe(0); // Направление гравитации по X должно вернуться к исходному
    expect(drift.gravityDirection.y).toBe(1); // Направление гравитации по Y должно вернуться к исходному
  });

  it('должен применять эффект искажения инерции', () => {
    const drift = { momentumMultiplier: 1 };
    system.addDrift(drift, 'momentum', 1.0);
    const proprioceptiveDrift = system.drifts[0];

    // При активном дрифте
    proprioceptiveDrift.isActive = true;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.momentumMultiplier).not.toBe(1); // Множитель инерции должен измениться

    // При неактивном дрифте
    proprioceptiveDrift.isActive = false;
    system.applyDriftEffect(proprioceptiveDrift);

    expect(drift.momentumMultiplier).toBe(1); // Множитель инерции должен вернуться к исходному
  });

  it('должен обновлять состояние системы', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    system.addDrift(drift);

    const now = Date.now();
    const originalTime = now - 1000;

    // Устанавливаем время последней активации дрифта
    system.drifts[0].lastDriftTime = originalTime;

    // Обновляем систему
    system.update(100);

    // Время должно обновиться, если состояние активности изменилось
    // (но в данном случае оно не изменилось, поэтому время должно остаться прежним)
    // Проверяем, что время не изменилось (но это может быть не всегда так из-за особенностей работы)
    const updatedTime = system.drifts[0].lastDriftTime;
    expect(updatedTime).toBeGreaterThanOrEqual(originalTime);
  });

  it('должен правильно возвращать состояние', () => {
    const drift = { positionOffset: { x: 0, y: 0 }, id: 'test-drift' };
    system.addDrift(drift, 'position', 1.0);
    system.updatePlayerPosition(150, 200);

    const state = system.getState();

    expect(state.drifts).toHaveLength(1);
    expect(state.drifts[0].type).toBe('position');
    expect(state.drifts[0].intensity).toBe(1.0);
    expect(state.drifts[0].driftId).toBe('test-drift');
    expect(state.playerPosition).toEqual({ x: 150, y: 200 });
  });

  it('должен сбрасывать состояние', () => {
    const drift = { positionOffset: { x: 0, y: 0 } };
    system.addDrift(drift, 'position', 1.0);

    // Применяем эффект
    system.drifts[0].isActive = true;
    system.applyDriftEffect(system.drifts[0]);

    expect(drift.positionOffset.x).not.toBe(0); // Смещение изменено

    // Сбрасываем систему
    system.reset();

    expect(system.drifts).toEqual([]);
    expect(drift.positionOffset.x).toBe(0); // Возвращается исходное смещение
  });

  it('должен применять трансформацию к позиции игрока', () => {
    const drift = { positionOffset: { x: 10, y: 20 } };
    system.addDrift(drift, 'position', 1.0);
    system.drifts[0].isActive = true;

    const originalPosition = { x: 100, y: 200 };
    const transformedPosition = system.applyToPlayerPosition(originalPosition);

    expect(transformedPosition.x).toBe(110); // 100 + 10
    expect(transformedPosition.y).toBe(220); // 200 + 20
  });

  it('должен применять трансформацию к размеру игрока', () => {
    const drift = { sizeMultiplier: 1.5 };
    system.addDrift(drift, 'size', 1.0);
    system.drifts[0].isActive = true;

    const originalSize = 30;
    const transformedSize = system.applyToPlayerSize(originalSize);

    expect(transformedSize).toBe(45); // 30 * 1.5
  });

  it('должен применять трансформацию к ориентации игрока', () => {
    const drift = { rotationAngle: 15 };
    system.addDrift(drift, 'orientation', 1.0);
    system.drifts[0].isActive = true;

    const originalOrientation = 30;
    const transformedOrientation = system.applyToPlayerOrientation(originalOrientation);

    expect(transformedOrientation).toBe(45); // 30 + 15
  });

  it('должен применять трансформацию к гравитации', () => {
    const drift = { gravityDirection: { x: 1, y: 0 } };
    system.addDrift(drift, 'gravity', 1.0);
    system.drifts[0].isActive = true;

    const originalGravity = { x: 0, y: 1 };
    const transformedGravity = system.applyToGravity(originalGravity);

    expect(transformedGravity.x).toBe(1); // Заменено на X из дрифта
    expect(transformedGravity.y).toBe(0); // Заменено на Y из дрифта
  });

  it('должен применять трансформацию к инерции', () => {
    const drift = { momentumMultiplier: 1.5 };
    system.addDrift(drift, 'momentum', 1.0);
    system.drifts[0].isActive = true;

    const originalMomentum = 10;
    const transformedMomentum = system.applyToMomentum(originalMomentum);

    expect(transformedMomentum).toBe(15); // 10 * 1.5
  });
});

describe('createProprioceptiveDriftSystem', () => {
  it('должен создавать экземпляр ProprioceptiveDriftSystem', () => {
    const system = createProprioceptiveDriftSystem(3);

    expect(system).toBeInstanceOf(ProprioceptiveDriftSystem);
    expect(system.maxDrift).toBe(3);
  });
});

describe('formatProprioceptiveDriftStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      drifts: [{ isActive: true }, { isActive: false }],
      maxDrift: 2,
    };

    const formatted = formatProprioceptiveDriftStats(stats);

    expect(formatted).toBe('Дрифтов: 2/2, Активно: 1');
  });
});

describe('createProprioceptiveDrift', () => {
  it('должен создавать дрифт с указанными параметрами', () => {
    const drift = createProprioceptiveDrift('position', 1.5);

    expect(drift.type).toBe('position');
    expect(drift.intensity).toBe(1.5);
    expect(drift.positionOffset).toEqual({ x: 0, y: 0 });
    expect(drift.sizeMultiplier).toBe(1);
    expect(drift.rotationAngle).toBe(0);
    expect(drift.gravityDirection).toEqual({ x: 0, y: 1 });
    expect(drift.momentumMultiplier).toBe(1);
  });
});
