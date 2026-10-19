// Save article image to public/images/ instead of Supabase Storage
// Images are served by Vercel CDN = unlimited bandwidth, no Supabase egress
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imgDir = resolve(__dirname, '../public/images');
if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

export async function saveArticleImage(imageUrl, slug) {
  try {
    const res = await fetch(imageUrl, { redirect: 'follow' });
    if (!res.ok) return null;

    const rawBuf = Buffer.from(await res.arrayBuffer());

    // Skip if too small (likely a logo placeholder)
    if (rawBuf.length < 5000) return null;

    const buf = await sharp(rawBuf)
      .resize(800, 500, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    const filename = slug.substring(0, 80) + '.jpg';
    writeFileSync(resolve(imgDir, filename), buf);
    console.log(`  Image saved to public/images/${filename} (${Math.round(buf.length / 1024)}KB)`);

    return `/images/${filename}`;
  } catch (err) {
    console.error('  Image save error:', err.message);
    return null;
  }
}
