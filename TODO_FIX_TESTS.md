# TODO: Fix Failing Tests

## Failing Tests Summary
- **0 failed**, 227 passed, 16 todo, 243 total tests
- **0 failed test suites** ✅
- **All test suites passing**

## Issues Fixed

### 1. Proprioceptive Drift Test: "exports sanity check" ✅
- **File**: `tests/auto/src_systems_proprioceptive_drift.js.test.js`
- **Issue**: `expect(mod.ProprioceptiveDrift).toBeDefined()` failed because the export is `ProprioceptiveDriftSystem`, not `ProprioceptiveDrift`
- **Fix**: Updated test to expect `ProprioceptiveDriftSystem` instead of `ProprioceptiveDrift`

## Current Failing Tests

### 1. Mental Rotations System (`tests/mental_rotations.test.js`) - 0 failed tests ✅
- **Status**: All tests passing

### 2. Cognitive Load System (`tests/cognitive_load.test.js`) - 0 failed tests ✅
- **Status**: All tests passing
- **Fixes Applied**: Corrected parameter handling in createCognitiveTask, fixed time calculations in update method, added missing cognitive load update after task completion

## Remaining TODOs from TODO.md

### Tasks to Complete
- [x] Удалить неиспользуемый файл `src/utils/games/breakout.js` (file not found, may already deleted)
- [x] Удалить неиспользуемый файл `src/utils/main.js` (file not found, may already deleted)
- [x] Исправить конфигурацию Jest для поддержки ES-модулей
- [x] Оптимизировать структуру `app.js`, разбив на модули
- [x] Оптимизировать импорты и экспорты

## Next Steps
1. Fix failing implementations in `src/systems/mental_rotations.js` and `src/systems/cognitive_load.js`
2. Run tests again to verify fixes
3. Address remaining TODO items from main TODO.md
4. Run full test suite periodically to ensure no regressions
