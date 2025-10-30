
import { generateSessionParameters, generateSessionName } from '../src/systems/proc_gen.js';

test('proc_gen deterministic seed', () => {
  const p1 = generateSessionParameters(12345);
  const p2 = generateSessionParameters(12345);
  expect(p1.theme).toBe(p2.theme);
  expect(p1.difficulty).toBe(p2.difficulty);
});

test('generateSessionName returns string with theme', ()=>{
  const p = generateSessionParameters(42);
  const name = generateSessionName(p.theme, p.modifiers, p.seed);
  expect(typeof name).toBe('string');
  expect(name).toContain(p.theme.split(' ')[0]);
});
