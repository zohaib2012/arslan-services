import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'public/icons/logo.png');
const outDir = path.join(__dirname, 'public/store');

const brandGreen = { r: 0, g: 104, b: 55, alpha: 1 };

const FONT = 'Arial, Helvetica, sans-serif';

// ---- Play Store App Icon: 512x512, full-bleed, no alpha ----
async function makeAppIcon() {
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00341B"/>
        <stop offset="55%" stop-color="#006837"/>
        <stop offset="100%" stop-color="#0F9D5F"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#g)"/>
  </svg>`;
  const logo = await sharp(logoPath).resize(330, 330, { fit: 'contain' }).toBuffer();
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, gravity: 'center' }])
    .flatten({ background: brandGreen })
    .png()
    .toFile(path.join(outDir, 'play-store-icon-512.png'));
  console.log('OK play-store-icon-512.png');
}

// ---- Feature Graphic: 1024x500 ----
async function makeFeatureGraphic() {
  const svg = `<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00341B"/>
        <stop offset="55%" stop-color="#006837"/>
        <stop offset="100%" stop-color="#0F9D5F"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.8" cy="0.2" r="0.7">
        <stop offset="0%" stop-color="#0F9D5F" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#0F9D5F" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="500" fill="url(#bg)"/>
    <rect width="1024" height="500" fill="url(#glow)"/>
    <circle cx="120" cy="420" r="200" fill="#34B27D" opacity="0.14"/>
    <circle cx="950" cy="80" r="150" fill="#F5A623" opacity="0.18"/>
    <text x="512" y="205" font-family="${FONT}" font-size="72" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Easy service</text>
    <text x="512" y="270" font-family="${FONT}" font-size="30" font-weight="normal" fill="#F5A623" text-anchor="middle">HOME SERVICES MADE EASY</text>
    <text x="512" y="380" font-family="${FONT}" font-size="26" fill="#FFFFFF" opacity="0.85" text-anchor="middle">Plumbers • Electricians • AC Technicians • Cleaners</text>
  </svg>`;

  const logo = await sharp(logoPath)
    .resize(240, 240, { fit: 'contain' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: logo, gravity: 'south', left: 512 - 120, top: 40 }])
    .png()
    .toFile(path.join(outDir, 'feature-graphic-1024x500.png'));
  console.log('OK feature-graphic-1024x500.png');
}

await makeAppIcon();
await makeFeatureGraphic();
