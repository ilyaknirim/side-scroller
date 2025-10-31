import { GAME_WIDTH, GAME_HEIGHT } from '../../src/utils/constants.js';

test('GAME_WIDTH and GAME_HEIGHT are positive integers', () => {
  expect(Number.isFinite(GAME_WIDTH)).toBe(true);
  expect(Number.isFinite(GAME_HEIGHT)).toBe(true);
  expect(GAME_WIDTH).toBeGreaterThan(0);
  expect(GAME_HEIGHT).toBeGreaterThan(0);
});
