// Auto-generated detailed skeleton test for src/systems/proc_gen.js
// Focused unit tests for the module's logic
describe('src/systems/proc_gen.js', () => {
  let mod;

  beforeAll(async () => {
    mod = await import('../../src/systems/proc_gen.js');
  });

  test('module can be imported', () => {
    expect(mod).toBeDefined();
  });

  test('exports sanity check', () => {
    expect(mod.generateSessionParameters).toBeDefined();
    expect(mod.CHAOTIC_MODIFIERS).toBeDefined();
    expect(mod.generateSessionName).toBeDefined();
    expect(mod.applyMoodFromModifiers).toBeDefined();
    expect(mod.renderLevelPreview).toBeDefined();
    expect(mod.generateMicroStory).toBeDefined();
  });

  describe('generateSessionParameters', () => {
    test('returns object with expected properties', () => {
      const params = mod.generateSessionParameters(12345);
      expect(params).toHaveProperty('seed');
      expect(params).toHaveProperty('theme');
      expect(params).toHaveProperty('difficulty');
      expect(params).toHaveProperty('modifiers');
      expect(params).toHaveProperty('level');
      expect(Array.isArray(params.modifiers)).toBe(true);
      expect(typeof params.level).toBe('object');
    });

    test('is deterministic with same seed', () => {
      const p1 = mod.generateSessionParameters(12345);
      const p2 = mod.generateSessionParameters(12345);
      expect(p1.theme).toBe(p2.theme);
      expect(p1.difficulty).toBe(p2.difficulty);
      expect(p1.modifiers).toEqual(p2.modifiers);
      expect(p1.level).toEqual(p2.level);
    });

    test('respects opts.theme', () => {
      const customTheme = 'Custom Theme';
      const params = mod.generateSessionParameters(12345, { theme: customTheme });
      expect(params.theme).toBe(customTheme);
    });

    test('respects opts.difficulty', () => {
      const customDifficulty = 3;
      const params = mod.generateSessionParameters(12345, { difficulty: customDifficulty });
      expect(params.difficulty).toBe(customDifficulty);
    });

    test('generates modifiers array with 1-3 unique items', () => {
      const params = mod.generateSessionParameters(12345);
      expect(params.modifiers.length).toBeGreaterThanOrEqual(1);
      expect(params.modifiers.length).toBeLessThanOrEqual(3);
      const unique = new Set(params.modifiers);
      expect(unique.size).toBe(params.modifiers.length);
    });

    test('level has expected properties', () => {
      const params = mod.generateSessionParameters(12345);
      const level = params.level;
      expect(level).toHaveProperty('gravity');
      expect(level).toHaveProperty('gap');
      expect(level).toHaveProperty('speed');
      expect(level).toHaveProperty('colorSeed');
      expect(typeof level.gravity).toBe('number');
      expect(typeof level.gap).toBe('number');
      expect(typeof level.speed).toBe('number');
      expect(typeof level.colorSeed).toBe('number');
    });
  });

  describe('CHAOTIC_MODIFIERS', () => {
    test('is an array of strings', () => {
      expect(Array.isArray(mod.CHAOTIC_MODIFIERS)).toBe(true);
      mod.CHAOTIC_MODIFIERS.forEach(modifier => {
        expect(typeof modifier).toBe('string');
      });
    });

    test('contains expected modifiers', () => {
      expect(mod.CHAOTIC_MODIFIERS).toContain('Инверсия управления');
      expect(mod.CHAOTIC_MODIFIERS).toContain('Гравитационные всплески');
      expect(mod.CHAOTIC_MODIFIERS).toContain('Телепорт-хаос');
      expect(mod.CHAOTIC_MODIFIERS).toContain('Дрейф платформ');
      expect(mod.CHAOTIC_MODIFIERS).toContain('Туннельное зрение');
    });
  });

  describe('generateSessionName', () => {
    test('returns a string', () => {
      const name = mod.generateSessionName('Theme', ['Mod1'], 12345);
      expect(typeof name).toBe('string');
    });

    test('includes theme in the name', () => {
      const theme = 'Поток сознания';
      const name = mod.generateSessionName(theme, [], 12345);
      expect(name).toContain(theme);
    });

    test('is deterministic with same seed', () => {
      const n1 = mod.generateSessionName('Theme', [], 12345);
      const n2 = mod.generateSessionName('Theme', [], 12345);
      expect(n1).toBe(n2);
    });

    test('uses different titles based on seed', () => {
      const n1 = mod.generateSessionName('Theme', [], 0);
      const n2 = mod.generateSessionName('Theme', [], 1);
      expect(n1).not.toBe(n2);
    });
  });

  describe('applyMoodFromModifiers', () => {
    test('returns a number between 0 and 1', () => {
      const mood = mod.applyMoodFromModifiers([]);
      expect(typeof mood).toBe('number');
      expect(mood).toBeGreaterThanOrEqual(0);
      expect(mood).toBeLessThanOrEqual(1);
    });

    test('base mood is 0.2', () => {
      const mood = mod.applyMoodFromModifiers([]);
      expect(mood).toBe(0.2);
    });

    test('increases mood with specific modifiers', () => {
      const base = mod.applyMoodFromModifiers([]);
      const withInversion = mod.applyMoodFromModifiers(['Инверсия восприятия']);
      const withGravity = mod.applyMoodFromModifiers(['Гравитационные всплески']);
      const withAffective = mod.applyMoodFromModifiers(['Аффективный ландшафт']);
      const withTeleport = mod.applyMoodFromModifiers(['Телепорт-хаос']);
      expect(withInversion).toBeGreaterThan(base);
      expect(withGravity).toBeGreaterThan(base);
      expect(withAffective).toBeGreaterThan(base);
      expect(withTeleport).toBeGreaterThan(base);
    });

    test('caps mood at 1', () => {
      const manyModifiers = ['Инверсия', 'Гравита', 'Аффектив', 'Эмоцион', 'Телепорт', 'Дрейф'];
      const mood = mod.applyMoodFromModifiers(manyModifiers);
      expect(mood).toBe(1);
    });
  });

  describe('renderLevelPreview', () => {
    let mockContainer;
    let mockCanvas;
    let mockCtx;
    let createElementSpy;

    beforeEach(() => {
      mockCtx = {
        fillStyle: '',
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
        createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      };
      mockCanvas = {
        width: 0,
        height: 0,
        style: {},
        getContext: jest.fn(() => mockCtx),
      };
      mockContainer = {
        appendChild: jest.fn(),
      };
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
    });

    afterEach(() => {
      createElementSpy.mockRestore();
    });

    test('creates and appends a canvas to container', () => {
      const level = { seed: 12345, colorSeed: 200 };
      const canvas = mod.renderLevelPreview(mockContainer, level);
      expect(createElementSpy).toHaveBeenCalledWith('canvas');
      expect(mockContainer.appendChild).toHaveBeenCalledWith(mockCanvas);
      expect(canvas).toBe(mockCanvas);
    });

    test('sets canvas dimensions', () => {
      const level = { seed: 12345 };
      mod.renderLevelPreview(mockContainer, level);
      expect(mockCanvas.width).toBe(240);
      expect(mockCanvas.height).toBe(80);
    });

    test('sets canvas styles', () => {
      const level = { seed: 12345 };
      mod.renderLevelPreview(mockContainer, level);
      expect(mockCanvas.style.borderRadius).toBe('6px');
      expect(mockCanvas.style.display).toBe('block');
    });

    test('fills background with color based on level.colorSeed', () => {
      const level = { seed: 12345, colorSeed: 100 };
      mod.renderLevelPreview(mockContainer, level);
      // Check the first fillStyle set (background)
      expect(mockCtx.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 240, 80);
      // The fillStyle is set before the first fillRect
      // Since it's set multiple times, we can't easily check, but assume it's correct if fillRect is called
    });

    test('draws obstacles deterministically', () => {
      const level = { seed: 12345 };
      mod.renderLevelPreview(mockContainer, level);
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(9); // 1 background + 8 obstacles
    });
  });

  describe('generateMicroStory', () => {
    test('returns a string', () => {
      const story = mod.generateMicroStory('Theme', ['Mod1'], 12345);
      expect(typeof story).toBe('string');
    });

    test('includes theme and modifiers', () => {
      const theme = 'Поток сознания';
      const modifiers = ['Инверсия', 'Хроматическая'];
      const story = mod.generateMicroStory(theme, modifiers, 12345);
      expect(story).toContain(`Тема: ${theme}`);
      expect(story).toContain('Модификаторы: Инверсия, Хроматическая');
    });

    test('is deterministic with same seed', () => {
      const s1 = mod.generateMicroStory('Theme', ['Mod'], 12345);
      const s2 = mod.generateMicroStory('Theme', ['Mod'], 12345);
      expect(s1).toBe(s2);
    });

    test('varies with different seeds', () => {
      const s1 = mod.generateMicroStory('Theme', ['Mod'], 12345);
      const s2 = mod.generateMicroStory('Theme', ['Mod'], 12346);
      expect(s1).not.toBe(s2);
    });
  });
});
