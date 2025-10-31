# Testing

Запуск тестов (локально):
```bash
npm ci
npm run test
npm run test:coverage
```
Структура тестов:
- `tests/setup.js` — настройка окружения Jest.
- `tests/*.test.js` — ручные и важные тесты.
- `tests/auto/` — автоматически сгенерированные заглушки; их нужно заменить реальными тестами.
