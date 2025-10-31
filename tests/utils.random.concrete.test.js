import { pseudoRandom } from '../../src/utils/random.js';

test('pseudoRandom: reproducible sequence for same seed and range [0,1)', () => {
  const a = pseudoRandom(42);
  const b = pseudoRandom(42);
  const seqA = [a(), a(), a(), a()];
  const seqB = [b(), b(), b(), b()];
  expect(seqA).toEqual(seqB);
  seqA.forEach(v => {
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});
