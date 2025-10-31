// Тесты для системы когнитивной нагрузки

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CognitiveLoadSystem, createCognitiveLoadSystem, formatCognitiveLoadStats, createCognitiveTask } from '../src/systems/cognitive_load.js';

describe('CognitiveLoadSystem', () => {
  let system;

  beforeEach(() => {
    system = new CognitiveLoadSystem(1, 10);
  });

  it('должен создаваться с правильными параметрами', () => {
    expect(system.baseDifficulty).toBe(1);
    expect(system.maxDifficulty).toBe(10);
    expect(system.tasks).toEqual([]);
    expect(system.currentLoad).toBe(0);
    expect(system.currentDifficulty).toBe(1);
  });

  it('должен добавлять задачи и рассчитывать нагрузку', () => {
    const task = {
      type: 'память',
      complexity: 2,
      urgency: 1.5,
      duration: 5000
    };

    const taskId = system.addTask(task);

    expect(taskId).toBe(0);
    expect(system.tasks.length).toBe(1);
    expect(system.tasks[0]).toMatchObject(task);
    expect(system.tasks[0].createdAt).toBeDefined();
    expect(system.tasks[0].load).toBeGreaterThan(0);
    expect(system.currentLoad).toBeGreaterThan(0);
    expect(system.currentDifficulty).toBeGreaterThan(system.baseDifficulty);
  });

  it('должен правильно рассчитывать нагрузку от задачи', () => {
    const memoryTask = {
      type: 'память',
      complexity: 2,
      urgency: 1.5
    };

    const decisionTask = {
      type: 'принятие решений',
      complexity: 2,
      urgency: 1.5
    };

    const memoryLoad = system.calculateTaskLoad(memoryTask);
    const decisionLoad = system.calculateTaskLoad(decisionTask);

    // Задачи принятия решений должны создавать большую нагрузку
    expect(decisionLoad).toBeGreaterThan(memoryLoad);
  });

  it('должен обновлять состояние и удалять завершенные задачи', () => {
    const task = {
      type: 'память',
      complexity: 1,
      urgency: 1,
      duration: 100 // Очень короткая задача для теста
    };

    system.addTask(task);
    expect(system.tasks.length).toBe(1);

    // Эмулируем прохождение времени, достаточное для завершения задачи
    const now = Date.now();
    Date.now = jest.fn(() => now + 150);

    system.update(150);

    // Задача должна быть удалена
    expect(system.tasks.length).toBe(0);
    expect(system.currentLoad).toBe(0);
    expect(system.currentDifficulty).toBe(system.baseDifficulty);
  });

  it('должен увеличивать срочность задач по мере приближения к дедлайну', () => {
    const task = {
      type: 'память',
      complexity: 1,
      urgency: 1,
      duration: 1000
    };

    system.addTask(task);
    const initialUrgency = system.tasks[0].urgency;

    // Эмулируем прохождение 80% времени задачи
    const now = Date.now();
    Date.now = jest.fn(() => now + 800);

    system.update(800);

    // Срочность должна увеличиться
    expect(system.tasks[0].urgency).toBeGreaterThan(initialUrgency);
  });

  it('должен правильно возвращать состояние', () => {
    const task = {
      type: 'память',
      complexity: 2,
      urgency: 1.5
    };

    system.addTask(task);

    const state = system.getState();

    expect(state.tasks).toEqual(system.tasks);
    expect(state.currentLoad).toBeGreaterThan(0);
    expect(state.currentDifficulty).toBeGreaterThan(system.baseDifficulty);
    expect(state.baseDifficulty).toBe(system.baseDifficulty);
    expect(state.maxDifficulty).toBe(system.maxDifficulty);
    expect(state.difficultyRatio).toBeGreaterThan(0);
  });

  it('должен сбрасывать состояние', () => {
    const task = {
      type: 'память',
      complexity: 2,
      urgency: 1.5
    };

    system.addTask(task);
    expect(system.tasks.length).toBe(1);
    expect(system.currentLoad).toBeGreaterThan(0);

    system.reset();

    expect(system.tasks).toEqual([]);
    expect(system.currentLoad).toBe(0);
    expect(system.currentDifficulty).toBe(system.baseDifficulty);
  });
});

describe('createCognitiveLoadSystem', () => {
  it('должен создавать экземпляр CognitiveLoadSystem', () => {
    const system = createCognitiveLoadSystem(2, 8);

    expect(system).toBeInstanceOf(CognitiveLoadSystem);
    expect(system.baseDifficulty).toBe(2);
    expect(system.maxDifficulty).toBe(8);
  });
});

describe('formatCognitiveLoadStats', () => {
  it('должен форматировать статистику системы', () => {
    const stats = {
      tasks: [{}, {}, {}],
      currentLoad: 4.5,
      currentDifficulty: 3.2,
      maxDifficulty: 10
    };

    const formatted = formatCognitiveLoadStats(stats);

    expect(formatted).toBe('Задач: 3, Нагрузка: 4.5, Сложность: 3.2/10');
  });
});

describe('createCognitiveTask', () => {
  it('должен создавать задачу с указанными параметрами', () => {
    const task = createCognitiveTask('память', 2, 1.5, 5000);

    expect(task.type).toBe('память');
    expect(task.complexity).toBe(2);
    expect(task.urgency).toBe(1.5);
    expect(task.duration).toBe(5000);
  });

  it('должен создавать задачу со случайными параметрами', () => {
    const task = createCognitiveTask();

    expect(task.type).toBeDefined();
    expect(task.complexity).toBeGreaterThan(0);
    expect(task.urgency).toBeGreaterThan(0);
    expect(task.duration).toBeGreaterThan(0);
  });
});
