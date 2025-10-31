// Тесты для системы ментальных вращений

import { describe, it, expect, beforeEach } from '@jest/globals';
import { MentalRotationsSystem, createMentalRotationsSystem, formatMentalRotationsStats, createMentalRotationTask } from '../src/systems/mental_rotations.js';

describe('MentalRotationsSystem', () => {
  let system;

  beforeEach(() => {
    system = new MentalRotationsSystem(180, 30);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.maxRotation).toBe(180);
    expect(system.rotationSpeed).toBe(30);
    expect(system.currentRotation).toBe(0);
    expect(system.targetRotation).toBe(0);
    expect(system.isRotating).toBe(false);
    expect(system.rotationAxis).toBe('y');
    expect(system.rotationComplexity).toBe(1);
    expect(system.rotationHistory).toEqual([]);
  });

  it('должен начинать вращение до указанного угла', () => {
    system.startRotation(90, 'x', 1.5);

    expect(system.targetRotation).toBe(90);
    expect(system.rotationAxis).toBe('x');
    expect(system.rotationComplexity).toBe(1.5);
    expect(system.isRotating).toBe(true);
    expect(system.rotationHistory.length).toBe(1);
    expect(system.rotationHistory[0]).toMatchObject({
      from: 0,
      to: 90,
      axis: 'x',
      complexity: 1.5
    });
  });

  it('должен ограничивать угол вращения максимальным значением', () => {
    system.startRotation(270, 'y');

    expect(system.targetRotation).toBe(180); // Ограничено maxRotation
  });

  it('должен ограничивать угол вращения минимальным значением', () => {
    system.startRotation(-270, 'y');

    expect(system.targetRotation).toBe(-180); // Ограничено -maxRotation
  });

  it('должен обновлять угол вращения', () => {
    system.startRotation(90, 'y');

    // Обновляем на 1 секунду
    system.update(1000);

    expect(system.currentRotation).toBeGreaterThan(0);
    expect(system.currentRotation).toBeLessThan(90);
  });

  it('должен останавливать вращение при достижении цели', () => {
    system.startRotation(30, 'y');

    // Обновляем достаточно времени, чтобы достичь цели
    system.update(2000);

    expect(system.currentRotation).toBe(30);
    expect(system.isRotating).toBe(false);
  });

  it('должен правильно возвращать состояние', () => {
    system.startRotation(90, 'z', 2);

    const state = system.getState();

    expect(state.currentRotation).toBe(0);
    expect(state.targetRotation).toBe(90);
    expect(state.isRotating).toBe(true);
    expect(state.rotationAxis).toBe('z');
    expect(state.rotationComplexity).toBe(2);
    expect(state.rotationHistory).toHaveLength(1);
    expect(state.progress).toBe(1); // Начальный прогресс
  });

  it('должен сбрасывать состояние', () => {
    system.startRotation(90, 'x');
    system.update(500);

    system.reset();

    expect(system.currentRotation).toBe(0);
    expect(system.targetRotation).toBe(0);
    expect(system.isRotating).toBe(false);
    expect(system.rotationAxis).toBe('y');
    expect(system.rotationComplexity).toBe(1);
    expect(system.rotationHistory).toEqual([]);
  });

  it('должен возвращать правильное CSS-преобразование для разных осей', () => {
    system.currentRotation = 45;

    // Проверяем для оси X
    system.rotationAxis = 'x';
    expect(system.getTransformMatrix()).toBe('rotateX(45deg)');

    // Проверяем для оси Y
    system.rotationAxis = 'y';
    expect(system.getTransformMatrix()).toBe('rotateY(45deg)');

    // Проверяем для оси Z
    system.rotationAxis = 'z';
    expect(system.getTransformMatrix()).toBe('rotateZ(45deg)');
  });

  it('должен возвращать правильную матрицу преобразования для 3D', () => {
    system.currentRotation = 90;
    system.rotationAxis = 'y';

    const matrix = system.get3DTransformMatrix();

    // Для поворота на 90 градусов вокруг оси Y
    expect(matrix[0]).toBeCloseTo(0); // cos(90°)
    expect(matrix[2]).toBeCloseTo(1);  // sin(90°)
    expect(matrix[8]).toBeCloseTo(-1); // -sin(90°)
    expect(matrix[10]).toBeCloseTo(0); // cos(90°)
  });

  it('должен применять вращение к точке', () => {
    system.currentRotation = 90;
    system.rotationAxis = 'y';

    const point = { x: 1, y: 0, z: 0 };
    const transformed = system.applyToPoint(point);

    // При повороте на 90 градусов вокруг оси Y, точка (1,0,0) должна стать (0,0,-1)
    expect(transformed.x).toBeCloseTo(0);
    expect(transformed.y).toBeCloseTo(0);
    expect(transformed.z).toBeCloseTo(-1);
  });
});

describe('createMentalRotationsSystem', () => {
  it('должен создавать экземпляр MentalRotationsSystem', () => {
    const system = createMentalRotationsSystem(360, 60);

    expect(system).toBeInstanceOf(MentalRotationsSystem);
    expect(system.maxRotation).toBe(360);
    expect(system.rotationSpeed).toBe(60);
  });
});

describe('formatMentalRotationsStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      currentRotation: 45.5,
      rotationAxis: 'x',
      rotationComplexity: 1.5
    };

    const formatted = formatMentalRotationsStats(stats);

    expect(formatted).toBe('Вращение: 45.5°, Ось: x, Сложность: 1.5');
  });
});

describe('createMentalRotationTask', () => {
  it('должен создавать задачу с указанными параметрами', () => {
    const task = createMentalRotationTask(90, 'z', 2);

    expect(task.targetAngle).toBe(90);
    expect(task.axis).toBe('z');
    expect(task.complexity).toBe(2);
    expect(task.hint).toContain('90°');
  });

  it('должен создавать задачу со случайными параметрами', () => {
    const task = createMentalRotationTask();

    expect(typeof task.targetAngle).toBe('number');
    expect(['x', 'y', 'z']).toContain(task.axis);
    expect(typeof task.complexity).toBe('number');
    expect(task.hint).toBeDefined();
  });
});
