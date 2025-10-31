// Галерея сессий - сохранение и просмотр прошлых сессий

// Функция для сохранения сессии в галерею
export function saveSessionToGallery(sessionData = {}, title = 'Untitled Session') {
  try {
    const gallery = loadGallery();
    const session = {
      id: Date.now().toString(),
      title,
      data: sessionData,
      timestamp: Date.now(),
      thumbnail: generateThumbnail(sessionData),
    };

    gallery.push(session);
    // Ограничение до 20 сессий
    if (gallery.length > 20) {
      gallery.shift();
    }

    localStorage.setItem('sessionGallery', JSON.stringify(gallery));
    return session.id;
  } catch (error) {
    console.error('Error saving session to gallery:', error);
    return null;
  }
}

// Функция для загрузки галереи
export function loadGallery() {
  try {
    const gallery = localStorage.getItem('sessionGallery');
    return gallery ? JSON.parse(gallery) : [];
  } catch (error) {
    console.error('Error loading gallery:', error);
    return [];
  }
}

// Вспомогательная функция для генерации миниатюры
function generateThumbnail() {
  // Для минимальной реализации возвращаем простой плейсхолдер
  return (
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg width="100" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="60" fill="#f0f0f0"/>
      <text x="50" y="35" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
        Session
      </text>
    </svg>
  `)
  );
}
