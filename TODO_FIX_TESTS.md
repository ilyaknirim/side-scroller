# Fix Failing Tests

## Current Issues
- [x] Dynamic imports in auto tests failing (Jest doesn't resolve them)
- [x] Incorrect import paths in concrete tests
- [x] Mismatches in world_generator.js (pseudoRandom return type, properties type, description format)
- [x] Missing source files for many auto tests

## Plan
- [x] Fix import paths in tests/utils.random.concrete.test.js
- [x] Change dynamic imports to static in tests/auto/src_utils_random.js.test.js
- [x] Update src/systems/world_generator.js to match test expectations
- [x] Add missing methods to audio_manager.js (setMood, pulseEvent)
- [ ] Create missing source files with stub implementations for auto tests
- [ ] Run tests to verify fixes

## Status
- 7 tests passing, 24 failing
- Failing tests are mostly auto-generated tests for unimplemented modules
- Need to create stub implementations for:
  - src/systems/seasonal_modifiers.js
  - src/systems/proprioceptive_drift.js
  - src/ui/app.js
  - src/systems/particles.js
  - src/systems/chromatic_adaptation.js
  - src/utils/constants.js
  - src/systems/noosphere_sync.js
  - src/systems/perception_shifts.js
  - src/systems/visuals.js
  - src/systems/level_generator.js
  - src/systems/mnemonic_anchors.js
  - src/systems/leaderboard.js
  - src/systems/adaptive_difficulty.js
  - src/systems/game_systems_integration.js
  - src/systems/cognitive_mechanics.js
  - src/systems/meditations.js
  - src/systems/character_generator.js
  - src/systems/emblem.js
  - src/systems/adaptive_soundscape.js
  - src/systems/integration.js
  - src/systems/gallery.js
