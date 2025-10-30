
# Деплой на GitHub Pages

## Вариант A — Публикация в ветке `gh-pages`
1. Создайте репозиторий на GitHub и клонируйте его:
   ```bash
   git clone <repo-url>
   cp -r * <repo-dir>
   cd <repo-dir>
   git add .
   git commit -m "Initial site"
   git push origin main
   ```
2. Создайте workflow для автоматического деплоя (пример ниже) или вручную переключите Pages в settings -> Pages -> branch: `gh-pages` / root.

### Пример GitHub Actions (deploy.yml)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```
