
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Запускаем Jest
try {
  console.log('Запуск тестов...');
  execSync('npx jest', { 
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });
} catch (error) {
  console.error('Ошибка при запуске тестов:', error.message);
  process.exit(1);
}
