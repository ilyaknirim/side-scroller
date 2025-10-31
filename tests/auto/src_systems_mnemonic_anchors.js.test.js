// Behavior tests for src/systems/mnemonic_anchors.js
describe('src/systems/mnemonic_anchors.js', () => {
  test('module can be imported', async () => {
    const mod = await import('../../src/systems/mnemonic_anchors.js');
    expect(mod).toBeDefined();
  });

  test('exports sanity check', async () => {
    const mod = await import('../../src/systems/mnemonic_anchors.js');
    expect(mod.MnemonicAnchors).toBeDefined();
    expect(mod.createMnemonicAnchors).toBeDefined();
  });

  test('createMnemonicAnchors creates instance with default maxAnchors', async () => {
    const { createMnemonicAnchors, MnemonicAnchors } = await import(
      '../../src/systems/mnemonic_anchors.js'
    );

    const anchors = createMnemonicAnchors();
    expect(anchors).toBeInstanceOf(MnemonicAnchors);
    expect(anchors.maxAnchors).toBe(3); // default value
  });

  test('createMnemonicAnchors creates instance with custom maxAnchors', async () => {
    const { createMnemonicAnchors, MnemonicAnchors } = await import(
      '../../src/systems/mnemonic_anchors.js'
    );

    const anchors = createMnemonicAnchors(5);
    expect(anchors).toBeInstanceOf(MnemonicAnchors);
    expect(anchors.maxAnchors).toBe(5);
  });

  test('MnemonicAnchors constructor initializes correctly', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors(2);
    expect(anchors.maxAnchors).toBe(2);
    expect(anchors.anchors).toEqual([]);
  });

  test('createAnchor creates anchor with correct properties', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { position: { x: 10, y: 20 }, health: 100 };
    anchors.createAnchor(state, 'Test Anchor');

    expect(anchors.anchors).toHaveLength(1);
    const anchorId = anchors.anchors[0].id;
    expect(typeof anchorId).toBe('string');
    expect(anchors.anchors).toHaveLength(1);

    const anchor = anchors.anchors[0];
    expect(anchor.id).toBe(anchorId);
    expect(anchor.label).toBe('Test Anchor');
    expect(anchor.state).toEqual(state);
    expect(anchor.state).not.toBe(state); // Deep copy
    expect(typeof anchor.timestamp).toBe('number');
  });

  test('createAnchor uses default label', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { health: 50 };
    anchors.createAnchor(state);

    const anchor = anchors.anchors[0];
    expect(anchor.label).toBe('Anchor');
  });

  test('createAnchor limits number of anchors', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors(2);
    const state = { health: 100 };

    // Create 3 anchors
    anchors.createAnchor(state, 'Anchor 1');
    anchors.createAnchor(state, 'Anchor 2');
    anchors.createAnchor(state, 'Anchor 3');

    expect(anchors.anchors).toHaveLength(2);
    expect(anchors.anchors[0].label).toBe('Anchor 2'); // Oldest removed
    expect(anchors.anchors[1].label).toBe('Anchor 3');
  });

  test('restoreAnchor returns deep copy of state', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { position: { x: 10, y: 20 }, health: 100 };
    const anchorId = anchors.createAnchor(state);

    const restoredState = anchors.restoreAnchor(anchorId);
    expect(restoredState).toEqual(state);
    expect(restoredState).not.toBe(state); // Different reference
    expect(restoredState.position).not.toBe(state.position); // Deep copy
  });

  test('restoreAnchor returns null for non-existent anchor', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const restoredState = anchors.restoreAnchor('non-existent-id');
    expect(restoredState).toBeNull();
  });

  test('getAnchors returns copy of anchors array', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { health: 100 };
    anchors.createAnchor(state, 'Test');

    const anchorsList = anchors.getAnchors();
    expect(anchorsList).toHaveLength(1);
    expect(anchorsList).not.toBe(anchors.anchors); // Different reference
  });

  test('removeAnchor removes specific anchor', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { health: 100 };

    // Mock Date.now to ensure unique IDs
    const originalDateNow = Date.now;
    let timeCounter = 1000;
    Date.now = jest.fn(() => timeCounter++);

    anchors.createAnchor(state, 'Anchor 1');
    anchors.createAnchor(state, 'Anchor 2');

    expect(anchors.anchors).toHaveLength(2);
    const id1 = anchors.anchors[0].id;
    const id2 = anchors.anchors[1].id;
    expect(id1).not.toBe(id2); // Ensure IDs are different

    anchors.removeAnchor(id1);
    expect(anchors.anchors).toHaveLength(1);
    expect(anchors.anchors[0].id).toBe(id2);

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('removeAnchor handles removing non-existent anchor', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { health: 100 };

    anchors.createAnchor(state, 'Anchor 1');
    anchors.createAnchor(state, 'Anchor 2');

    expect(anchors.anchors).toHaveLength(2);

    anchors.removeAnchor('non-existent-id');
    expect(anchors.anchors).toHaveLength(2); // Should remain unchanged
  });

  test('clearAnchors removes all anchors', async () => {
    const { MnemonicAnchors } = await import('../../src/systems/mnemonic_anchors.js');

    const anchors = new MnemonicAnchors();
    const state = { health: 100 };

    anchors.createAnchor(state);
    anchors.createAnchor(state);
    expect(anchors.anchors).toHaveLength(2);

    anchors.clearAnchors();
    expect(anchors.anchors).toHaveLength(0);
  });
});
