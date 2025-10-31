// Синхронизация ноосферы - имитация синхронизации данных

// Функция для публикации данных
export function syncPublish(data, channel = 'default') {
  try {
    // Имитация публикации - сохраняем в localStorage с префиксом канала
    const key = `noosphere_${channel}`;
    const existingData = JSON.parse(localStorage.getItem(key) || '[]');
    existingData.push({
      data,
      timestamp: Date.now(),
      id: Date.now().toString()
    });

    // Ограничение до 50 записей на канал
    if (existingData.length > 50) {
      existingData.splice(0, existingData.length - 50);
    }

    localStorage.setItem(key, JSON.stringify(existingData));
    return { success: true, id: existingData[existingData.length - 1].id };
  } catch (error) {
    console.error('Sync publish error:', error);
    return { success: false, error: error.message };
  }
}

// Функция для подписки на данные
export function syncSubscribe(channel = 'default', callback) {
  try {
    const key = `noosphere_${channel}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');

    if (typeof callback === 'function') {
      data.forEach(item => callback(item));
    }

    return { success: true, data };
  } catch (error) {
    console.error('Sync subscribe error:', error);
    return { success: false, error: error.message };
  }
}
