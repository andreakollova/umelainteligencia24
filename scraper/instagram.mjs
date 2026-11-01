import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync, writeFileSync, readdirSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup fonts for sharp SVG rendering (needed on Linux/Vercel)
const fontsDir = resolve(__dirname, 'fonts');
if (existsSync(fontsDir)) {
  // Copy font to /tmp/fonts so fontconfig can find it
  const tmpFonts = '/tmp/fonts';
  if (!existsSync(tmpFonts)) mkdirSync(tmpFonts, { recursive: true });
  const fontFile = resolve(fontsDir, 'Inter.ttf');
  const confFile = resolve(fontsDir, 'fonts.conf');
  if (existsSync(fontFile)) copyFileSync(fontFile, resolve(tmpFonts, 'Inter.ttf'));
  if (existsSync(confFile)) copyFileSync(confFile, resolve(tmpFonts, 'fonts.conf'));
  process.env.FONTCONFIG_PATH = tmpFonts;
  process.env.FONTCONFIG_FILE = resolve(tmpFonts, 'fonts.conf');
}

// Load env
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const W = 1086;
const H = 1448;

// On Vercel serverless, use /tmp/ for output; locally use public/ig
function getOutputDir(subdir = '') {
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const base = isVercel ? '/tmp/ig' : resolve(__dirname, '../public/ig');
  const dir = subdir ? `${base}/${subdir}` : base;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// Wrap text into lines that fit within maxChars
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

// ============================================================
// ARTICLE CAROUSEL (3 slides)
// ============================================================

// Slide 1: article image FULL HEIGHT as base layer, template on top, title on top of everything
async function generateArticleSlide1(articleImageUrl, title, theme) {
  const templatePath = resolve(__dirname, `templates/${theme}/slide1.png`);
  const textColor = theme === 'modry' ? '#ffffff' : '#0c1a26';
  const bgColor = theme === 'modry' ? '#0c1a26' : '#ffffff';

  // Load article image (local path or URL)
  let articleImg = null;
  try {
    let imgBuf;
    if (articleImageUrl?.startsWith('/images/') || articleImageUrl?.startsWith('/ig-images/')) {
      // Load local file - check ig-images first for high quality
      const filename = articleImageUrl.split('/').pop();
      const igPath = resolve(__dirname, '..', 'public', 'ig-images', filename);
      const localPath = resolve(__dirname, '..', 'public', 'images', filename);
      if (existsSync(igPath)) imgBuf = readFileSync(igPath);
      else if (existsSync(localPath)) imgBuf = readFileSync(localPath);
    } else if (articleImageUrl) {
      const imgRes = await fetch(articleImageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      });
      if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image')) {
        imgBuf = Buffer.from(await imgRes.arrayBuffer());
      }
    }
    if (imgBuf) {
      // Full height cover, centered - but skip upscaling tiny images
      const meta = await sharp(imgBuf).metadata();
      if (meta.width >= 400) {
        articleImg = await sharp(imgBuf).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
      }
    }
  } catch {}

  // Title - auto-scale font based on length
  const titleLen = title.length;
  let fontSize = 92;
  let charsPerLine = 18;
  if (titleLen > 50) { fontSize = 80; charsPerLine = 20; }
  if (titleLen > 70) { fontSize = 68; charsPerLine = 24; }
  if (titleLen > 90) { fontSize = 60; charsPerLine = 28; }

  const titleLines = wrapText(title, charsPerLine);
  const lineHeight = Math.round(fontSize * 1.1);
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = H - 220 - titleBlockHeight;

  const titleSvg = titleLines.map((line, i) =>
    `<text x="85" y="${titleStartY + i * lineHeight + fontSize}" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="800" fill="${textColor}">${escapeXml(line)}</text>`
  ).join('\n');

  // Gradient from bottom going up - under the template graphic, over the photo
  const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="fade-bottom" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stop-color="#0c1a26" stop-opacity="0"/>
        <stop offset="0.7" stop-color="#0c1a26" stop-opacity="0.75"/>
        <stop offset="1" stop-color="#0c1a26" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fade-bottom)"/>
    ${titleSvg}
  </svg>`);

  // Require article image - don't generate slide without it
  if (!articleImg) {
    console.error('  IG: No valid article image found, skipping carousel generation');
    return null;
  }

  // Layer order: 1) image, 2) gradient over image, 3) template on top, 4) title on top
  const base = sharp(articleImg).resize(W, H);

  const composites = [
    { input: svgOverlay, top: 0, left: 0 },        // gradient + title under template
    { input: readFileSync(templatePath), top: 0, left: 0 }, // template graphics on top
  ];

  // Title needs to be on top of everything - render separately
  const titleOnlySvg = Buffer.from(`<svg width="${W}" height="${H}">${titleSvg}</svg>`);
  composites.push({ input: titleOnlySvg, top: 0, left: 0 });

  return base
    .composite(composites)
    .png()
    .toBuffer();
}

// Parse **bold** markers into word-level metadata, then wrap lines preserving bold info
// Returns array of { text, bold } word objects per line
function wrapTextWithBold(text, maxChars) {
  // First extract bold ranges by splitting on **
  const segments = [];
  const parts = text.split(/(\*\*)/g);
  let inBold = false;
  for (const part of parts) {
    if (part === '**') { inBold = !inBold; continue; }
    if (!part) continue;
    const words = part.split(' ').filter(w => w);
    for (const word of words) {
      segments.push({ text: word, bold: inBold });
    }
  }

  // Now wrap into lines
  const lines = [];
  let currentLine = [];
  let currentLen = 0;
  for (const seg of segments) {
    const addLen = (currentLen > 0 ? 1 : 0) + seg.text.length;
    if (currentLen + addLen > maxChars && currentLine.length > 0) {
      lines.push([...currentLine]);
      currentLine = [];
      currentLen = 0;
    }
    currentLine.push(seg);
    currentLen += (currentLen > 0 ? 1 : 0) + seg.text.length;
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

// Render a line of word segments (with bold metadata) as SVG text
function renderRichLine(wordSegments, x, y, size, color) {
  // Group consecutive words with same bold value into tspans
  let spans = '';
  let currentBold = null;
  let currentWords = [];

  function flush() {
    if (currentWords.length === 0) return;
    const text = escapeXml(currentWords.join(' '));
    const weight = currentBold ? '800' : '500';
    // Don't add space before punctuation
    if (spans && !text.match(/^[.,;:!?]/)) spans += ' ';
    spans += `<tspan font-weight="${weight}">${text}</tspan>`;
    currentWords = [];
  }

  for (const seg of wordSegments) {
    if (seg.bold !== currentBold) {
      flush();
      currentBold = seg.bold;
    }
    currentWords.push(seg.text);
  }
  flush();

  return `<text x="${x}" y="${y}" font-family="Inter, -apple-system, sans-serif" font-size="${size}" font-weight="500" fill="${color}" text-anchor="middle">${spans}</text>`;
}

// Slide 2 (and optionally 3): template + excerpt text + category label
// Returns array of page buffers (1 or 2 pages)
async function generateArticleExcerptPages(excerpt, theme, category) {
  const templatePath = resolve(__dirname, `templates/${theme}/slide2.png`);
  const textColor = theme === 'modry' ? '#ffffff' : '#0c1a26';
  const catLabel = category || 'Robotika';

  const fontSize = 50;
  const lineHeight = 66;
  const sentenceGap = 32;
  const maxContentHeight = H - 350;
  const contentStartY = 130;

  // Split into sentences
  const sentences = excerpt.split(/(?<=\.)\s+/).filter(s => s.trim());
  const sentenceGroups = sentences.map(s => wrapTextWithBold(s, 32));

  // Category label
  const catSvg = catLabel
    ? `<text x="115" y="132" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="700" fill="#cb1e26" dominant-baseline="central">${escapeXml(catLabel)}</text>`
    : '';

  // Split across pages - max 2 sentences per page (prevents logo overlap)
  const totalSentences = sentenceGroups.length;
  const pageGroupsList = [];
  for (let i = 0; i < totalSentences; i += 2) {
    pageGroupsList.push(sentenceGroups.slice(i, i + 2));
  }

  const pages = pageGroupsList.map(groups => {
    const items = [];
    groups.forEach((group, i) => {
      if (i > 0) items.push(null);
      group.forEach(line => items.push(line));
    });
    return items;
  });

  // Render each page
  const buffers = [];
  for (const pageItems of pages) {
    const totalHeight = pageItems.reduce((h, item) => h + (item === null ? sentenceGap : lineHeight), 0);
    const startY = Math.max(contentStartY, (H - 200 - totalHeight) / 2);

    let currentY = startY;
    const textSvg = pageItems.map((item) => {
      if (item === null) { currentY += sentenceGap; return ''; }
      currentY += lineHeight;
      return renderRichLine(item, W / 2, currentY, fontSize, textColor);
    }).join('\n');

    const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">${catSvg}${textSvg}</svg>`);
    const buf = await sharp(templatePath)
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .png()
      .toBuffer();
    buffers.push(buf);
  }

  return buffers;
}

// Slide 3: CTA template as-is
function generateArticleSlide3(theme) {
  const templatePath = resolve(__dirname, `templates/${theme}/slide3.png`);
  return readFileSync(templatePath);
}

// ============================================================
// GLOSSARY / "VIES CO JE" CAROUSEL
// ============================================================

// Slide 1: "Vieš, čo je to..." template + English term (big) + Slovak term (single line)
async function generateGlossarySlide1(termEN, termSK) {
  const templatePath = resolve(__dirname, 'templates/viescoaje/slide1.png');

  // English term - always single line, auto-size to fit, thick underline behind
  const maxTermWidth = W - 120;
  // Scale font to fit on one line
  let termFontSize = 110;
  const approxCharWidth = () => termFontSize * 0.58;
  while (termEN.length * approxCharWidth() > maxTermWidth && termFontSize > 50) {
    termFontSize -= 4;
  }

  const enY = 720;
  const textWidth = termEN.length * approxCharWidth();
  const lineX = W / 2 - textWidth / 2 - 10;

  const enText = `<text x="${W / 2}" y="${enY}" font-family="Inter, -apple-system, sans-serif" font-size="${termFontSize}" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(termEN)}</text>`;
  const enSvg = enText;

  // Slovak term - single line, below underline with spacing
  const skStartY = enY + 65;
  const skSvg = `<text x="${W / 2}" y="${skStartY}" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#ffffff" opacity="0.6" text-anchor="middle">${escapeXml(termSK)}</text>`;

  const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">${enSvg}${skSvg}</svg>`);

  return sharp(templatePath)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

// Glossary explanation page(s) - term in red next to bar, "Vysvetlenie" heading with icon, centered text with bold
async function generateGlossaryExplanationPages(termEN, explanation) {
  const templatePath = resolve(__dirname, 'templates/viescoaje/slide2.png');

  const fontSize = 50;
  const lineHeight = 66;
  const sentenceGap = 36;
  const maxContentHeight = H - 380;

  // Term name in red - to the right of red bar (bar at x:85-99, y:89-174, center y:132)
  const termSvg = `<text x="115" y="132" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="700" fill="#cb1e26" dominant-baseline="central">${escapeXml(termEN)}</text>`;

  // "Vysvetlenie" is NOT a separate heading - it's the first line of text content
  // Will be prepended as a bold larger line directly above the explanation text
  const headingY = 0; // not used as separate element
  const headingSvg = ''; // empty - handled inline below

  // Parse explanation with bold support, split into sentences
  const sentences = explanation.split(/(?<=\.)\s+/).filter(s => s.trim());
  const sentenceGroups = sentences.map(s => wrapTextWithBold(s, 32));

  // Calculate total height
  const totalContentHeight = sentenceGroups.reduce((h, group, i) => {
    return h + group.length * lineHeight + (i > 0 ? sentenceGap : 0);
  }, 0);

  // Always split evenly across 2 pages by sentences
  const mid = Math.ceil(sentenceGroups.length / 2);
  let pageGroups;
  if (sentenceGroups.length >= 2) {
    pageGroups = [sentenceGroups.slice(0, mid), sentenceGroups.slice(mid)];
  } else {
    pageGroups = [sentenceGroups];
  }

  const buffers = [];
  for (let p = 0; p < pageGroups.length; p++) {
    const groups = pageGroups[p];
    const isFirstPage = p === 0;

    // Build page items
    const pageItems = [];
    groups.forEach((group, i) => {
      if (i > 0) pageItems.push(null);
      group.forEach(line => pageItems.push(line));
    });

    const totalHeight = pageItems.reduce((h, item) => h + (item === null ? sentenceGap : lineHeight), 0);
    const contentTop = 130;

    // On first page, add "Vysvetlenie" as first bold line + gap
    const vysvetlenieHeight = isFirstPage ? 70 + sentenceGap : 0;
    const totalWithHeading = totalHeight + vysvetlenieHeight;
    const startY = Math.max(contentTop, contentTop + (maxContentHeight - totalWithHeading) / 2);

    let currentY = startY;
    let vysvetlenieSvg = '';
    if (isFirstPage) {
      currentY += 70;
      vysvetlenieSvg = `<text x="${W / 2}" y="${currentY}" font-family="Inter, -apple-system, sans-serif" font-size="56" font-weight="800" fill="#ffffff" text-anchor="middle">Vysvetlenie</text>`;
      currentY += sentenceGap;
    }

    const textSvg = pageItems.map((item) => {
      if (item === null) { currentY += sentenceGap; return ''; }
      currentY += lineHeight;
      return renderRichLine(item, W / 2, currentY, fontSize, '#ffffff');
    }).join('\n');

    const pageHeading = vysvetlenieSvg;
    const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">${termSvg}${pageHeading}${textSvg}</svg>`);
    const buf = await sharp(templatePath)
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .png()
      .toBuffer();
    buffers.push(buf);
  }

  return buffers;
}

// Last slide: "Uloz si / posli kamosovi" template as-is
function generateGlossaryLastSlide() {
  const templatePath = resolve(__dirname, 'templates/viescoaje/slide3.png');
  return readFileSync(templatePath);
}

// ============================================================
// COMPANY / "POZNAS TUTO FIRMU?" CAROUSEL
// ============================================================

// Slide 1: template + company logo centered
async function generateCompanySlide1(logoPath) {
  const templatePath = resolve(__dirname, 'templates/poznasfirmu/slide1.png');

  const logoBuf = readFileSync(logoPath);
  const logoResized = await sharp(logoBuf)
    .resize(620, 310, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const logoX = Math.round((W - 620) / 2);
  const logoY = 540;

  return sharp(templatePath)
    .composite([{ input: logoResized, top: logoY, left: logoX }])
    .png()
    .toBuffer();
}

// Slide 2+: company description pages - small logo + text
async function generateCompanyDescPages(companyName, description, logoPath) {
  const templatePath = resolve(__dirname, 'templates/poznasfirmu/slide2.png');
  const textColor = '#0c1a26';

  const fontSize = 46;
  const lineHeight = 60;
  const sentenceGap = 34;

  // Centered logo above text
  let logoComposite = null;
  const logoW = 280;
  const logoH = 80;
  if (logoPath && existsSync(logoPath)) {
    const logoBuf = readFileSync(logoPath);
    logoComposite = await sharp(logoBuf)
      .resize(logoW, logoH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
  }

  const nameSvg = '';

  const sentences = description.split(/(?<=\.)\s+/).filter(s => s.trim());
  const sentenceGroups = sentences.map(s => wrapTextWithBold(s, 38));

  // Split evenly across 3 pages
  const totalSentences = sentenceGroups.length;
  let pageGroups;
  if (totalSentences >= 3) {
    const t1 = Math.ceil(totalSentences / 3);
    const t2 = Math.ceil((totalSentences * 2) / 3);
    pageGroups = [sentenceGroups.slice(0, t1), sentenceGroups.slice(t1, t2), sentenceGroups.slice(t2)];
    pageGroups = pageGroups.filter(g => g.length > 0);
  } else if (totalSentences >= 2) {
    pageGroups = [sentenceGroups.slice(0, 1), sentenceGroups.slice(1)];
  } else {
    pageGroups = [sentenceGroups];
  }

  const buffers = [];
  for (const groups of pageGroups) {
    const pageItems = [];
    groups.forEach((group, i) => {
      if (i > 0) pageItems.push(null);
      group.forEach(line => pageItems.push(line));
    });

    const totalHeight = pageItems.reduce((h, item) => h + (item === null ? sentenceGap : lineHeight), 0);
    const logoSpace = logoComposite ? logoH + 40 : 0;
    const contentTop = 130 + logoSpace;
    const maxContentHeight = H - 380 - logoSpace;
    const startY = Math.max(contentTop, contentTop + (maxContentHeight - totalHeight) / 2);

    let currentY = startY;
    const textSvg = pageItems.map((item) => {
      if (item === null) { currentY += sentenceGap; return ''; }
      currentY += lineHeight;
      return renderRichLine(item, W / 2, currentY, fontSize, textColor);
    }).join('\n');

    const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">${textSvg}</svg>`);
    const composites = [{ input: svgOverlay, top: 0, left: 0 }];
    if (logoComposite) {
      composites.push({ input: logoComposite, top: 130, left: Math.round((W - logoW) / 2) });
    }
    const buf = await sharp(templatePath)
      .composite(composites)
      .png()
      .toBuffer();
    buffers.push(buf);
  }

  return buffers;
}

// Generate company carousel
export async function generateCompanyCarousel(company) {
  const outputDir = getOutputDir('company');

  const slug = company.slug || company.name.toLowerCase().replace(/\s+/g, '-');
  const prefix = `${outputDir}/${slug}`;
  const logoPath = resolve(__dirname, `templates/poznasfirmu/loga/${company.logo}`);
  const lastSlidePath = resolve(__dirname, 'templates/poznasfirmu/slide3.png');

  console.log(`  IG Company: Generating carousel for: ${company.name}...`);

  try {
    const slide1 = await generateCompanySlide1(logoPath);
    const descPages = await generateCompanyDescPages(company.name, company.description, logoPath);
    const lastSlide = readFileSync(lastSlidePath);

    const slides = [];
    writeFileSync(`${prefix}-1.png`, slide1);
    slides.push(`${prefix}-1.png`);

    descPages.forEach((page, i) => {
      const path = `${prefix}-${i + 2}.png`;
      writeFileSync(path, page);
      slides.push(path);
    });

    const lastPath = `${prefix}-${slides.length + 1}.png`;
    writeFileSync(lastPath, lastSlide);
    slides.push(lastPath);

    console.log(`  IG Company: Saved ${slides.length} slides to /public/ig/company/${slug}-*.png`);
    return { slug, slides };
  } catch (err) {
    console.error(`  IG Company: Error: ${err.message}`);
    return null;
  }
}

// ============================================================
// STORY (1080x1920) - article image + template overlay + title lower third
// ============================================================

const SW = 1080;
const SH = 1920;

export async function generateStory(articleImageUrl, title) {
  const templatePath = resolve(__dirname, 'templates/story/template.png');

  // Load article image as full background
  let bgBuf;
  try {
    let raw;
    if (articleImageUrl?.startsWith('/images/') || articleImageUrl?.startsWith('/ig-images/')) {
      const filename = articleImageUrl.split('/').pop();
      const igPath = resolve(__dirname, '..', 'public', 'ig-images', filename);
      const localPath = resolve(__dirname, '..', 'public', 'images', filename);
      if (existsSync(igPath)) raw = readFileSync(igPath);
      else if (existsSync(localPath)) raw = readFileSync(localPath);
    } else if (articleImageUrl) {
      const imgRes = await fetch(articleImageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      });
      if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image')) {
        raw = Buffer.from(await imgRes.arrayBuffer());
      }
    }
    if (raw) bgBuf = await sharp(raw).resize(SW, SH, { fit: 'cover', position: 'centre' }).toBuffer();
  } catch {}

  // If no image, use solid dark bg
  if (!bgBuf) {
    bgBuf = await sharp({ create: { width: SW, height: SH, channels: 4, background: { r: 12, g: 26, b: 38, alpha: 1 } } }).png().toBuffer();
  }

  // Template overlay (resized to 1080x1920)
  const templateBuf = await sharp(templatePath).resize(SW, SH, { fit: 'cover' }).toBuffer();

  // Title - bottom left, below template graphic
  const titleLines = wrapText(title, 28);
  const lineHeight = 58;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = SH - 140 - titleBlockHeight;

  const titleSvg = titleLines.map((line, i) =>
    `<text x="80" y="${titleStartY + i * lineHeight + 54}" font-family="Inter, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`
  ).join('\n');

  const overlaySvg = Buffer.from(`<svg width="${SW}" height="${SH}">${titleSvg}</svg>`);

  // Layer: 1) article image, 2) template, 3) gradient+title on top
  return sharp(bgBuf)
    .composite([
      { input: templateBuf, top: 0, left: 0 },
      { input: overlaySvg, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

// ============================================================
// COMPANY INFO SLIDE (before CTA)
// ============================================================

const companyData = {
  'EPFL News': { name: 'EPFL', country: 'Švajčiarsko', countryCode: 'ch', info: 'EPFL je jedna z najlepších technických univerzít v Európe. Sídli v Lausanne vo Švajčiarsku a patrí medzi svetových lídrov vo výskume robotiky a AI. Na EPFL pôsobí viac ako 380 laboratórií.' },
  '1X Technologies': { name: '1X Technologies', country: 'Nórsko', countryCode: 'no', info: '1X Technologies je nórska spoločnosť vyvíjajúca humanoidného robota NEO pre domácnosti. Podporuje ju OpenAI a Samsung. Prvá séria 10 000 kusov sa vypredala za päť dní.' },
  'Comau': { name: 'Comau', country: 'Taliansko', countryCode: 'it', info: 'Comau je talianska spoločnosť so sídlom v Turíne špecializujúca sa na priemyselnú automatizáciu a robotiku. Vznikla v roku 1973 a pôsobí vo viac ako 13 krajinách.' },
  'ABB': { name: 'ABB', country: 'Švajčiarsko / Švédsko', countryCode: 'ch', info: 'ABB je švajčiarsko-švédska korporácia so sídlom v Zürichu. Patrí medzi svetových lídrov v robotike a automatizácii s viac ako 105 000 zamestnancami.' },
  'KUKA': { name: 'KUKA', country: 'Nemecko', countryCode: 'de', info: 'KUKA je nemecký výrobca priemyselných robotov so sídlom v Augsburgu. Firma bola založená v roku 1898 a patrí medzi najväčších výrobcov robotov na svete.' },
  'Avular': { name: 'Avular', country: 'Holandsko', countryCode: 'nl', info: 'Avular je holandská robotická spoločnosť z Eindhovenu vyvíjajúca autonómne roboty pre vonkajšie prostredie v stavebníctve, údržbe a poľnohospodárstve.' },
  'AutoStore': { name: 'AutoStore', country: 'Nórsko', countryCode: 'no', info: 'AutoStore je nórska spoločnosť z Nedre Vats, svetový líder v automatizovaných skladových systémoch. Jej kubická mriežka s robotmi umožňuje 4-násobne vyššiu hustotu skladovania.' },
  'NEURA Robotics': { name: 'NEURA Robotics', country: 'Nemecko', countryCode: 'de', info: 'NEURA Robotics je nemecká spoločnosť z Metzingenu vyvíjajúca kognitívne roboty s AI. Jej humanoid 4NE1 manipuluje s predmetmi do 100 kg. Firma získala investíciu 1,7 miliardy dolárov.' },
  'Agility Robotics': { name: 'Agility', country: 'USA', countryCode: 'us', info: 'Agility Robotics je americká spoločnosť z Oregonu, ktorá vyvinula humanoidného robota Digit. Medzi jej zákazníkov patria Amazon, GXO Logistics a Mercado Libre. Digit premiestnil viac ako 100 000 prepraviek.' },
};

async function generateCompanyInfoSlide(sourceName, theme) {
  const company = companyData[sourceName];
  if (!company) return null;

  const templatePath = resolve(__dirname, `templates/${theme}/slide2.png`);

  // Download flag
  let flagBuf = null;
  try {
    const flagRes = await fetch(`https://flagcdn.com/w160/${company.countryCode}.png`);
    if (flagRes.ok) flagBuf = Buffer.from(await flagRes.arrayBuffer());
  } catch {}

  // "O spoločnosti" label
  const headingSvg = `<text x="${W / 2}" y="300" font-family="Inter, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#ffffff" text-anchor="middle" opacity="0.5">O spoločnosti</text>`;

  // Company name - big
  const nameSvg = `<text x="${W / 2}" y="400" font-family="Inter, -apple-system, sans-serif" font-size="72" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(company.name)}</text>`;

  // Country
  const countrySvg = `<text x="${W / 2}" y="460" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#ffffff" text-anchor="middle" opacity="0.5">${escapeXml(company.country)}</text>`;

  // Info text - split into sentences, 2 sentences + gap + rest
  const sentences = company.info.split(/(?<=\.)\s+/);
  const group1 = sentences.slice(0, 2).join(' ');
  const group2 = sentences.slice(2).join(' ');

  const fontSize = 36;
  const lineHeight = 48;
  const sentenceGap = 28;
  let currentY = 530;

  // Render group 1
  const g1Lines = wrapText(group1, 44);
  const g1Svg = g1Lines.map((line) => {
    currentY += lineHeight;
    return `<text x="${W / 2}" y="${currentY}" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="400" fill="#ffffff" text-anchor="middle">${escapeXml(line)}</text>`;
  }).join('\n');

  // Gap between groups
  currentY += sentenceGap;

  // Render group 2
  const g2Lines = group2 ? wrapText(group2, 44) : [];
  const g2Svg = g2Lines.map((line) => {
    currentY += lineHeight;
    return `<text x="${W / 2}" y="${currentY}" font-family="Inter, -apple-system, sans-serif" font-size="${fontSize}" font-weight="400" fill="#ffffff" text-anchor="middle">${escapeXml(line)}</text>`;
  }).join('\n');

  const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">${headingSvg}${nameSvg}${countrySvg}${g1Svg}${g2Svg}</svg>`);

  const composites = [{ input: svgOverlay, top: 0, left: 0 }];

  // Add flag centered above heading
  if (flagBuf) {
    const flag = await sharp(flagBuf).resize(100, 66, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    composites.push({ input: flag, top: 185, left: Math.round((W - 100) / 2) });
  }

  return sharp(templatePath)
    .composite(composites)
    .png()
    .toBuffer();
}

// ============================================================
// PUBLIC EXPORTS
// ============================================================

// Generate article carousel (3 slides: image+title, excerpt, CTA)
export async function generateCarousel(article, postIndex) {
  const theme = 'modry';
  const outputDir = getOutputDir();

  const slug = article.slug || 'post';
  const prefix = `${outputDir}/${slug}`;

  console.log(`  IG: Generating ${theme} carousel for: ${article.title.substring(0, 50)}...`);

  try {
    const slide1 = await generateArticleSlide1(article.image_url, article.title, theme);
    if (!slide1) {
      console.error(`  IG: Skipping carousel - no valid image for: ${article.title.substring(0, 50)}`);
      return null;
    }
    const categoryLabel = article.categories?.name || 'Robotika';
    const excerptPages = await generateArticleExcerptPages(article.excerpt || article.title, theme, categoryLabel);
    const lastSlide = generateArticleSlide3(theme);

    // Company info slide (if source is a known company)
    const companySlide = article.source_name ? await generateCompanyInfoSlide(article.source_name, theme) : null;

    const slides = [];
    writeFileSync(`${prefix}-1.png`, slide1);
    slides.push(`${prefix}-1.png`);

    excerptPages.forEach((page, i) => {
      const path = `${prefix}-${i + 2}.png`;
      writeFileSync(path, page);
      slides.push(path);
    });

    // Add company info slide before CTA
    if (companySlide) {
      const companyPath = `${prefix}-${slides.length + 1}.png`;
      writeFileSync(companyPath, companySlide);
      slides.push(companyPath);
    }

    const lastPath = `${prefix}-${slides.length + 1}.png`;
    writeFileSync(lastPath, lastSlide);
    slides.push(lastPath);

    // Generate story
    let storyPath = null;
    try {
      const storyBuf = await generateStory(article.image_url, article.title);
      storyPath = `${prefix}-story.png`;
      writeFileSync(storyPath, storyBuf);
      console.log(`  IG: Story saved to /public/ig/${slug}-story.png`);
    } catch (storyErr) {
      console.error(`  IG: Story error: ${storyErr.message}`);
    }

    console.log(`  IG: Saved ${slides.length} slides to /public/ig/${slug}-*.png`);
    return { theme, slug, slides, storyPath };
  } catch (err) {
    console.error(`  IG: Error generating carousel: ${err.message}`);
    throw err;
  }
}

// Generate glossary carousel (slide1: term, slide2+: explanation, last: CTA)
export async function generateGlossaryCarousel(term) {
  const outputDir = getOutputDir('glossary');

  const slug = term.slug || term.en.toLowerCase().replace(/\s+/g, '-');
  const prefix = `${outputDir}/${slug}`;

  console.log(`  IG Glossary: Generating carousel for: ${term.en}...`);

  try {
    const slide1 = await generateGlossarySlide1(term.en, term.sk);
    const explanationPages = await generateGlossaryExplanationPages(term.en, term.explanation);
    const lastSlide = generateGlossaryLastSlide();

    const slides = [];
    writeFileSync(`${prefix}-1.png`, slide1);
    slides.push(`${prefix}-1.png`);

    explanationPages.forEach((page, i) => {
      const path = `${prefix}-${i + 2}.png`;
      writeFileSync(path, page);
      slides.push(path);
    });

    const lastPath = `${prefix}-${slides.length + 1}.png`;
    writeFileSync(lastPath, lastSlide);
    slides.push(lastPath);

    console.log(`  IG Glossary: Saved ${slides.length} slides to /public/ig/glossary/${slug}-*.png`);
    return { slug, slides };
  } catch (err) {
    console.error(`  IG Glossary: Error generating carousel: ${err.message}`);
    return null;
  }
}
