// Тесты для системы когнитивной нагрузки

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  CognitiveLoadSystem,
  createCognitiveLoadSystem,
  formatCognitiveLoadStats,
  createCognitiveTask,
} from '../src/systems/cognitive_load.js';

describe('CognitiveLoadSystem', () => {
  let system;

  beforeEach(() => {
    system = new CognitiveLoadSystem();
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
      duration: 5000,
    };

    const taskId = system.addTask(task);

    expect(taskId).toBe(0);
    expect(system.tasks.length).toBe(1);
    expect(system.tasks[0]).toMatchObject(task);
    expect(system.tasks[0].createdAt).toBeDefined();
    expect(system.currentLoad).toBeGreaterThan(0);
  });

  it('должен правильно рассчитывать нагрузку от задачи', () => {
    const memoryTask = {
      type: 'память',
      complexity: 2,
      urgency: 1.5,
    };

    const decisionTask = {
      type: 'принятие решений',
      complexity: 3,
      urgency: 1.5,
    };

    const memoryLoad = system.calculateTaskLoad(memoryTask);
    const decisionLoad = system.calculateTaskLoad(decisionTask);

    // Задачи принятия решений должны создавать большую нагрузку
    expect(decisionLoad).toBeGreaterThan(memoryLoad);
  });

  it('должен правильно рассчитывать нагрузку с несколькими задачами', () => {
    const task1 = {
      type: 'память',
      complexity: 1,
      urgency: 1.0,
    };

    const task2 = {
      type: 'память',
      complexity: 1,
      urgency: 1.0,
    };

    system.addTask(task1);
    system.addTask(task2);

    // Нагрузка должна быть больше с двумя задачами из-за complexityMultiplier
    expect(system.currentLoad).toBeGreaterThan(100); // 2 * (1 + 0.2) = 2.4, но с учетом baseComplexity
  });

  it('должен обновлять состояние и удалять завершенные задачи', () => {
    const task = {
      type: 'память',
      complexity: 1,
      urgency: 1,
      duration: 100, // Очень короткая задача для теста
    };

    system.addTask(task);
    expect(system.tasks.length).toBe(1);

    // Эмулируем прохождение времени, достаточное для завершения задачи
    const now = Date.now();
    Date.now = jest.fn(() => now + 150);

    system.update(150);

    // Задача должна быть отмечена как завершенная, но не удалена автоматически
    expect(system.tasks.length).toBe(1);
    expect(system.tasks[0].status).toBe('completed');
    expect(system.currentLoad).toBe(0);
    expect(system.currentDifficulty).toBe(system.baseDifficulty);
  });

  it('должен увеличивать срочность задач по мере приближения к дедлайну', () => {
    const task = {
      type: 'память',
      complexity: 1,
      urgency: 1,
      duration: 1000,
    };

    system.addTask(task);
    const initialUrgency = system.tasks[0].urgency;

    // Эмулируем прохождение 95% времени задачи (менее 10 секунд осталось)
    const now = Date.now();
    Date.now = jest.fn(() => now + 950);

    system.update(950);

    // Срочность должна увеличиться
    expect(system.tasks[0].urgency).toBeGreaterThan(initialUrgency);
  });

  it('должен правильно возвращать состояние', () => {
    const task = {
      type: 'память',
      complexity: 2,
      urgency: 1.5,
    };

    system.addTask(task);

    const state = system.getState();

    expect(state.tasks).toEqual(system.tasks);
    expect(state.currentLoad).toBeGreaterThan(0);
    expect(state.baseDifficulty).toBe(system.baseDifficulty);
    expect(state.maxDifficulty).toBe(system.maxDifficulty);
  });

  it('должен сбрасывать состояние', () => {
    const task = {
      type: 'память',
      complexity: 2,
      urgency: 1.5,
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
    const system = new CognitiveLoadSystem();
    const task = { type: 'test', complexity: 1, urgency: 1 };
    system.addTask(task);

    const formatted = formatCognitiveLoadStats(system);

    expect(formatted).toContain('Когнитивная нагрузка');
    expect(formatted).toContain('Производительность');
    expect(formatted).toContain('Задачи');
  });
});

describe('createCognitiveTask', () => {
  it('должен создавать задачу с указанными параметрами', () => {
    const task = createCognitiveTask('память', 2, 1.5, 5000);

    expect(task.type).toBe('память');
    expect(task.complexity).toBe(2);
    expect(task.urgency).toBe(1.5);
    expect(task.duration).toBe(5000);
    expect(task.priority).toBe(1);
  });

  it('должен создавать задачу со случайными параметрами', () => {
    const task = createCognitiveTask();

    expect(task.type).toBeDefined();
    expect(task.complexity).toBeGreaterThan(0);
    expect(task.urgency).toBeGreaterThan(0);
    expect(task.duration).toBeGreaterThan(0);
  });
});
