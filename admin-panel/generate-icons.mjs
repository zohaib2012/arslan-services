import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svg = path.join(__dirname, 'public/icons/app-icon.svg');
const out = path.join(__dirname, 'public/icons');

const jobs = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-maskable-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const j of jobs) {
  const img = sharp(svg);
  let png = img.resize(j.size, j.size);
  if (j.name.includes('maskable')) {
    png = png.resize(256, 256, { fit: 'cover' }).extend({
      top: 128, bottom: 128, left: 128, right: 128,
      background: { r: 0, g: 52, b: 27, alpha: 1 },
    }).resize(j.size, j.size);
  }
  await png.png().toFile(path.join(out, j.name));
  console.log('generated', j.name, j.size + 'x' + j.size);
}
