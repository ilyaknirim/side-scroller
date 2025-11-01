# Руководство по развертыванию на GitHub Pages

## Обзор проекта

**Ноосфера** — это генератор психологических игровых сессий, построенный на современных веб-технологиях. Проект использует Vite для сборки, Jest для тестирования и GitHub Pages для хостинга.

## Предварительные требования

- Node.js (версия 16 или выше)
- npm (поставляется с Node.js)
- Git
- Аккаунт на GitHub

## Локальная разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm test -- --coverage

# Запуск тестов в режиме наблюдения
npm run test:watch
```

### Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут находиться в папке `dist/`

### Предварительный просмотр сборки

```bash
npm run preview
```

## Развертывание на GitHub Pages

### Шаг 1: Создание репозитория на GitHub

1. Создайте новый репозиторий на GitHub
2. Инициализируйте локальный git-репозиторий (если еще не инициализирован):

```bash
git init
git add .
git commit -m "Initial commit"
```

3. Свяжите локальный репозиторий с GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Шаг 2: Настройка GitHub Pages

#### Вариант A: Автоматическое развертывание через GitHub Actions (рекомендуется)

1. Создайте файл `.github/workflows/deploy.yml` в корне проекта:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. Зафиксируйте и отправьте изменения:

```bash
git add .
git commit -m "Add GitHub Actions workflow for deployment"
git push
```

3. В настройках репозитория на GitHub:
   - Перейдите в раздел "Settings" → "Pages"
   - В разделе "Source" выберите "GitHub Actions"

#### Вариант B: Развертывание через gh-pages (альтернативный способ)

1. Установите gh-pages глобально (если еще не установлено):

```bash
npm install -g gh-pages
```

2. В `package.json` уже добавлен скрипт `deploy`. Запустите его:

```bash
npm run deploy
```

3. В настройках репозитория на GitHub:
   - Перейдите в раздел "Settings" → "Pages"
   - В разделе "Source" выберите "Deploy from a branch"
   - Выберите ветку `gh-pages` и папку `/ (root)`

### Шаг 3: Проверка развертывания

После завершения развертывания ваше приложение будет доступно по адресу:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Структура проекта

```
side-scroller/
├── dist/                 # Собранные файлы (генерируется автоматически)
├── src/                  # Исходный код
│   ├── systems/          # Игровые системы
│   ├── ui/               # Пользовательский интерфейс
│   └── utils/            # Утилиты
├── tests/                # Тесты
├── docs/                 # Документация
├── index.html            # Главная HTML страница
├── package.json          # Конфигурация npm
├── vite.config.js        # Конфигурация Vite
└── README.md             # Основная документация
```

## Конфигурация Vite

Проект использует Vite с базовым путем `./` для корректной работы на GitHub Pages:

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
```

## Service Worker и PWA

Проект включает Service Worker для работы в оффлайн-режиме и манифест PWA. Убедитесь, что пути в `sw.js` и `manifest.json` корректны для GitHub Pages.

## Тестирование развернутого приложения

После развертывания рекомендуется проверить:

1. Загрузку главной страницы
2. Функциональность генерации контента
3. Работа PWA (установка, оффлайн-режим)
4. Корректность ссылок и ресурсов

## Устранение неполадок

### Проблема: Страница не загружается

**Решение:**
- Проверьте, что в `vite.config.js` установлен `base: './'`
- Убедитесь, что все пути в HTML и JS файлах относительные

### Проблема: Ресурсы не загружаются

**Решение:**
- Проверьте, что все импорты в JavaScript используют относительные пути
- Убедитесь, что файлы в `dist/` содержат корректные пути

### Проблема: GitHub Actions не запускается

**Решение:**
- Проверьте синтаксис YAML файла workflow
- Убедитесь, что файл находится в `.github/workflows/deploy.yml`

## Поддержка и развитие

Для вопросов и предложений создавайте issues в репозитории проекта.

## Лицензия

[Укажите лицензию проекта, если применимо]
