// Лидерборд - сохранение и загрузка лучших результатов

// Функция для сохранения результата
export function saveScore(score, playerName = 'Anonymous') {
  try {
    const leaderboard = loadScores();
    const newScore = {
      score,
      playerName,
      timestamp: Date.now(),
    };

    leaderboard.push(newScore);
    // Сортировка по убыванию и ограничение до 10 лучших
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
      leaderboard.splice(10);
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}

// Функция для загрузки результатов
export function loadScores() {
  try {
    const leaderboard = localStorage.getItem('leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
}
