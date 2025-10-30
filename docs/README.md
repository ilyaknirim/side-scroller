
# Ноосфера — сборка для GitHub Pages (v6)

## Структура
- `src/` — исходники (systems, modes, ui, core, utils)
- `public/` — статические ресурсы (index.html, manifest, favicon)
- `dist/` — готовая сборка, готовая для публикации на GitHub Pages (в корне архива)
- `docs/` — документация и TODO
- `tests/` — unit-тесты (оставлены)

## Локальный запуск (готовая сборка)
```bash
# serve dist directory (пример)
python3 -m http.server 8000 --directory /mnt/data/sidegame_noosphere_v6_dist
# затем откройте http://localhost:8000
```

## Деплой на GitHub Pages
1. Загрузите содержимое `dist/` в репозиторий (ветка `gh-pages` или корень `main` + Pages enabled).
2. Используйте предоставленный GitHub Actions workflow, если хотите автоматизировать сборку и деплой.
