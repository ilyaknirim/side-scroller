import { pseudoRandom, generateWorldObject, formatWorldObjectDescription } from '../src/systems/world_generator.js';

test('pseudoRandom produces reproducible sequence and values in [0,1)', () => {
  const r1 = pseudoRandom(10);
  const r2 = pseudoRandom(10);
  const a = [r1(), r1(), r1()];
  const b = [r2(), r2(), r2()];
  expect(a).toEqual(b);
  a.forEach(v => {
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});

test('generateWorldObject returns object with expected shape and seed', () => {
  const obj = generateWorldObject(7);
  expect(obj).toBeDefined();
  expect(obj.seed).toBeDefined();
  expect(obj.size).toBeDefined();
  expect(obj.properties).toBeInstanceOf(Array);
});

test('formatWorldObjectDescription returns a string mentioning the seed', () => {
  const obj = generateWorldObject(99);
  const desc = formatWorldObjectDescription(obj);
  expect(typeof desc).toBe('string');
  expect(desc).toContain(String(obj.seed));
});
