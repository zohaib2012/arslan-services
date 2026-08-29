import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, 'public/icons/logo.png');
const out = path.join(__dirname, 'public/icons');

async function makeIcon(size, name, containRatio, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
  const pad = Math.round((size * (1 - containRatio)) / 2);
  const inner = Math.round(size * containRatio);
  const img = sharp(src)
    .resize(inner, inner, { fit: 'contain', background })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background });
  await img.resize(size, size).png().toFile(path.join(out, name));
  console.log('generated', name, size + 'x' + size);
}

const brandGreen = { r: 0, g: 104, b: 55, alpha: 1 };
await makeIcon(192, 'icon-192.png', 0.92);
await makeIcon(512, 'icon-512.png', 0.92);
await makeIcon(512, 'icon-maskable-512.png', 0.7, brandGreen);
await makeIcon(180, 'apple-touch-icon.png', 0.92);
