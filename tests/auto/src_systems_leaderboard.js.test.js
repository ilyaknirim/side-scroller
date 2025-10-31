// Behavior tests for src/systems/leaderboard.js
describe('src/systems/leaderboard.js', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('module can be imported', async () => {
    const mod = await import('../../src/systems/leaderboard.js');
    expect(mod).toBeDefined();
  });

  test('exports sanity check', async () => {
    const mod = await import('../../src/systems/leaderboard.js');
    expect(mod.saveScore).toBeDefined();
    expect(mod.loadScores).toBeDefined();
  });

  test('saveScore saves score correctly', async () => {
    const { saveScore } = await import('../../src/systems/leaderboard.js');

    const result = saveScore(100, 'TestPlayer');
    expect(result).toBe(true);

    const stored = localStorage.getItem('leaderboard');
    const scores = JSON.parse(stored);
    expect(scores).toHaveLength(1);
    expect(scores[0]).toMatchObject({
      score: 100,
      playerName: 'TestPlayer',
    });
    expect(scores[0]).toHaveProperty('timestamp');
    expect(typeof scores[0].timestamp).toBe('number');
  });

  test('saveScore uses default player name', async () => {
    const { saveScore } = await import('../../src/systems/leaderboard.js');

    const result = saveScore(50);
    expect(result).toBe(true);

    const stored = localStorage.getItem('leaderboard');
    const scores = JSON.parse(stored);
    expect(scores[0].playerName).toBe('Anonymous');
  });

  test('loadScores returns empty array when no scores', async () => {
    const { loadScores } = await import('../../src/systems/leaderboard.js');

    const scores = loadScores();
    expect(scores).toEqual([]);
  });

  test('loadScores returns saved scores', async () => {
    const { saveScore, loadScores } = await import('../../src/systems/leaderboard.js');

    saveScore(100, 'Player1');
    saveScore(200, 'Player2');
    saveScore(150, 'Player3');

    const scores = loadScores();
    expect(scores).toHaveLength(3);
    // Should be sorted by score descending
    expect(scores[0].score).toBe(200);
    expect(scores[1].score).toBe(150);
    expect(scores[2].score).toBe(100);
  });

  test('saveScore limits to top 10 scores', async () => {
    const { saveScore, loadScores } = await import('../../src/systems/leaderboard.js');

    // Save 12 scores
    for (let i = 1; i <= 12; i++) {
      saveScore(i * 10, `Player${i}`);
    }

    const scores = loadScores();
    expect(scores).toHaveLength(10);
    // Should contain only the top 10 (scores 30-120)
    expect(scores[0].score).toBe(120);
    expect(scores[9].score).toBe(30);
  });

  test('saveScore handles localStorage errors gracefully', async () => {
    const { saveScore } = await import('../../src/systems/leaderboard.js');

    // Mock localStorage.setItem to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const result = saveScore(100, 'TestPlayer');
    expect(result).toBe(false);

    // Restore original function
    Storage.prototype.setItem = originalSetItem;
  });

  test('loadScores handles localStorage errors gracefully', async () => {
    const { loadScores } = await import('../../src/systems/leaderboard.js');

    // Mock localStorage.getItem to throw error
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = jest.fn(() => {
      throw new Error('Storage access denied');
    });

    const scores = loadScores();
    expect(scores).toEqual([]);

    // Restore original function
    Storage.prototype.getItem = originalGetItem;
  });
});
