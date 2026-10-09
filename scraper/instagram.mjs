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
  const textColor = theme === 'modry' ? '#ffffff' : '#052136';
  const bgColor = theme === 'modry' ? '#052136' : '#ffffff';

  // Download article image
  let articleImg = null;
  try {
    const imgRes = await fetch(articleImageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image')) {
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      // Full size - covers entire canvas
      articleImg = await sharp(imgBuf)
        .resize(W, H, { fit: 'cover', position: 'center' })
        .toBuffer();
    }
  } catch {}

  // Title - big, left-aligned with red bar (~x:45), lower third
  const titleLines = wrapText(title, 20);
  const lineHeight = 88;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = H - 240 - titleBlockHeight;

  const titleSvg = titleLines.map((line, i) =>
    `<text x="85" y="${titleStartY + i * lineHeight + 78}" font-family="Inter, -apple-system, sans-serif" font-size="80" font-weight="800" fill="${textColor}">${escapeXml(line)}</text>`
  ).join('\n');

  // Gradient from bottom going up - under the template graphic, over the photo
  const svgOverlay = Buffer.from(`<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="fade-bottom" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stop-color="#052136" stop-opacity="0"/>
        <stop offset="0.7" stop-color="#052136" stop-opacity="0.75"/>
        <stop offset="1" stop-color="#052136" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fade-bottom)"/>
    ${titleSvg}
  </svg>`);

  // Layer order: 1) image, 2) gradient over image, 3) template on top, 4) title on top
  const base = articleImg
    ? sharp(articleImg).resize(W, H)
    : sharp(templatePath);

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
  const textColor = theme === 'modry' ? '#ffffff' : '#052136';
  const catLabel = category || '';

  const fontSize = 54;
  const lineHeight = 70;
  const sentenceGap = 40;
  const maxContentHeight = H - 350;
  const contentStartY = 130;

  // Split into sentences, wrap each with bold preservation - wider lines
  const sentences = excerpt.split(/(?<=\.)\s+/).filter(s => s.trim());

  // Each sentence group = array of lines, each line = array of {text, bold} segments
  const sentenceGroups = sentences.map(s => wrapTextWithBold(s, 34));

  // Category label - to the right of red bar (bar at x:85-99, y:89-174, center y:132)
  const catSvg = catLabel
    ? `<text x="115" y="132" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="700" fill="#37b3f2" dominant-baseline="central">${escapeXml(catLabel)}</text>`
    : '';

  // Calculate total height of all content
  const totalContentHeight = sentenceGroups.reduce((h, group, i) => {
    return h + group.length * lineHeight + (i > 0 ? sentenceGap : 0);
  }, 0);

  // Always split across 3 pages
  const totalSentences = sentenceGroups.length;
  const pageGroupsList = [];
  if (totalSentences >= 3) {
    const t1 = Math.ceil(totalSentences / 3);
    const t2 = Math.ceil((totalSentences * 2) / 3);
    pageGroupsList.push(sentenceGroups.slice(0, t1), sentenceGroups.slice(t1, t2), sentenceGroups.slice(t2));
  } else if (totalSentences >= 2) {
    pageGroupsList.push(sentenceGroups.slice(0, 1), sentenceGroups.slice(1));
  } else {
    pageGroupsList.push(sentenceGroups);
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
  const termSvg = `<text x="115" y="132" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="700" fill="#37b3f2" dominant-baseline="central">${escapeXml(termEN)}</text>`;

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
  const textColor = '#052136';

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

  // Download article image as full background
  let bgBuf;
  try {
    const imgRes = await fetch(articleImageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image')) {
      const raw = Buffer.from(await imgRes.arrayBuffer());
      bgBuf = await sharp(raw).resize(SW, SH, { fit: 'cover', position: 'center' }).toBuffer();
    }
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
// PUBLIC EXPORTS
// ============================================================

// Generate article carousel (3 slides: image+title, excerpt, CTA)
export async function generateCarousel(article, postIndex) {
  const theme = postIndex % 2 === 0 ? 'modry' : 'biely';
  const outputDir = getOutputDir();

  const slug = article.slug || 'post';
  const prefix = `${outputDir}/${slug}`;

  console.log(`  IG: Generating ${theme} carousel for: ${article.title.substring(0, 50)}...`);

  try {
    const slide1 = await generateArticleSlide1(article.image_url, article.title, theme);
    const excerptPages = await generateArticleExcerptPages(article.excerpt || article.title, theme, article.category);
    const lastSlide = generateArticleSlide3(theme);

    const slides = [];
    writeFileSync(`${prefix}-1.png`, slide1);
    slides.push(`${prefix}-1.png`);

    excerptPages.forEach((page, i) => {
      const path = `${prefix}-${i + 2}.png`;
      writeFileSync(path, page);
      slides.push(path);
    });

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
