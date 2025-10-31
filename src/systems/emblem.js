// Генератор эмблем - создание SVG эмблем для сессий

// Функция для генерации SVG эмблемы
export function generateEmblemSVG(seed = Math.random(), size = 64) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const shapes = ['circle', 'square', 'triangle', 'diamond'];

  const random = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const primaryColor = colors[Math.floor(random(seed) * colors.length)];
  const secondaryColor = colors[Math.floor(random(seed + 1) * colors.length)];
  const shape = shapes[Math.floor(random(seed + 2) * shapes.length)];

  let shapeElement = '';
  switch (shape) {
    case 'circle':
      shapeElement = `<circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="${primaryColor}"/>`;
      break;
    case 'square':
      shapeElement = `<rect x="${size/6}" y="${size/6}" width="${size*2/3}" height="${size*2/3}" fill="${primaryColor}"/>`;
      break;
    case 'triangle':
      const points = `${size/2},${size/6} ${size/6},${size*5/6} ${size*5/6},${size*5/6}`;
      shapeElement = `<polygon points="${points}" fill="${primaryColor}"/>`;
      break;
    case 'diamond':
      const dPoints = `${size/2},${size/6} ${size/6},${size/2} ${size/2},${size*5/6} ${size*5/6},${size/2}`;
      shapeElement = `<polygon points="${dPoints}" fill="${primaryColor}"/>`;
      break;
  }

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${secondaryColor}" rx="${size/8}"/>
      ${shapeElement}
    </svg>
  `;

  return svg.trim();
}

// Функция для конвертации эмблемы в data URL
export function emblemToDataUrl(svgString) {
  return 'data:image/svg+xml;base64,' + btoa(svgString);
}
