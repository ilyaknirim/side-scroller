import AudioManager from '../src/systems/audio_manager.js';

test('AudioManager loads and setMood is safe without AudioContext', () => {
  const am = new AudioManager();
  expect(am).toBeDefined();
  expect(() => am.setMood(0.5)).not.toThrow();
  expect(() => am.pulseEvent()).not.toThrow();
});
