const sharp = require('sharp');
const fs = require('fs');

const sizes = [192, 512];

const createIcon = async (size) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)"/>
      <text x="${size / 2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle">CQ</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/icon-${size}.png`);
  
  console.log(`✅ Created icon-${size}.png`);
};

Promise.all(sizes.map(createIcon))
  .then(() => console.log('🎉 All icons generated!'))
  .catch(err => console.error('❌ Error:', err));
