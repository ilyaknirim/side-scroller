import {
  generateSessionName,
  applyMoodFromModifiers,
  generateMicroStory,
} from '../src/systems/proc_gen.js';

test('generateSessionName uses seed to pick title deterministically', () => {
  const n1 = generateSessionName('Тема', [], 3);
  const n2 = generateSessionName('Тема', [], 3);
  expect(n1).toBe(n2);
  expect(n1).toContain('Тема');
});

test('applyMoodFromModifiers increases mood with specific modifiers', () => {
  const base = applyMoodFromModifiers([]);
  const inc = applyMoodFromModifiers(['Инверсия', 'Аффективность']);
  expect(typeof base).toBe('number');
  expect(typeof inc).toBe('number');
  expect(inc).toBeGreaterThanOrEqual(base);
});

test('generateMicroStory is reproducible with same seed', () => {
  const s1 = generateMicroStory('тема', ['Модиф'], 12345);
  const s2 = generateMicroStory('тема', ['Модиф'], 12345);
  expect(s1).toBe(s2);
  expect(s1).toContain('Тема:');
});
