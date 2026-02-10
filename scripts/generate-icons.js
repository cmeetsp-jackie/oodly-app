const sharp = require('sharp');
const fs = require('fs');

const sizes = [192, 512];

const createIcon = async (size) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#2563eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.24}" fill="url(#grad)"/>
      
      <!-- Diamond icon -->
      <g transform="translate(${size / 2}, ${size * 0.38})">
        <path d="M 0,-${size * 0.12} L ${size * 0.12},0 L 0,${size * 0.16} L -${size * 0.12},0 Z" 
              fill="white" opacity="0.95"/>
      </g>
      
      <!-- CirQl text -->
      <text x="${size / 2}" y="${size * 0.75}" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.22}" 
            font-weight="bold" 
            font-style="italic"
            fill="white" 
            text-anchor="middle"
            letter-spacing="${size * 0.005}">CirQL</text>
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
