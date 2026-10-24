// Shrinks the player photos so the project is small enough to push to GitHub.
// Put this file in the "scripts" folder, then run:
//   npm install sharp --no-save
//   node scripts/shrink-photos.mjs
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'client/public/players';
let saved = 0, done = 0;
for (const f of fs.readdirSync(dir)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const p = path.join(dir, f);
  try {
    const before = fs.statSync(p).size;
    const img = sharp(fs.readFileSync(p)).resize({ width: 500, height: 500, fit: 'inside', withoutEnlargement: true });
    const ext = path.extname(f).toLowerCase();
    const buf = ext === '.png' ? await img.png({ palette: true, quality: 85, compressionLevel: 9 }).toBuffer()
      : ext === '.webp' ? await img.webp({ quality: 80 }).toBuffer()
      : await img.jpeg({ quality: 82 }).toBuffer();
    if (buf.length < before) { fs.writeFileSync(p, buf); saved += before - buf.length; }
    done++;
  } catch (e) {
    console.log('skipped', f, e.message);
  }
}
console.log(`Processed ${done} photos, saved ${Math.round(saved / 1024 / 1024)} MB`);
