/**
 * LiveScores App Icon Generator
 *
 * Generates all required Expo icon assets from SVG source.
 * Run with:  node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.resolve(__dirname, '../assets');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BG        = '#060d1c';   // Deep navy
const SURFACE   = '#0e1a2e';   // Card surface
const BORDER    = '#1c2e44';   // Border
const BLUE      = '#4da6ff';   // Electric blue (winning score)
const WHITE     = '#f0f6ff';   // Primary text
const RED       = '#ff3b5c';   // Live indicator
const MUTED     = '#4d6c86';   // Muted text / separator

// ─── SVG Builder ─────────────────────────────────────────────────────────────

/**
 * Builds the icon SVG at a given size.
 * @param {number} size  Canvas dimensions (square)
 * @param {Object} opts  { rounded: boolean }  – rounded=false for Android foreground
 */
function buildIconSvg(size, { rounded = true } = {}) {
  const r = size * 0.18;           // corner radius
  const padX = size * 0.08;
  const padY = size * 0.12;

  // Scoreboard card geometry
  const cardX = padX;
  const cardY = size * 0.28;
  const cardW = size - padX * 2;
  const cardH = size * 0.44;
  const cardR = size * 0.06;

  // Score positions
  const scoreY = cardY + cardH * 0.66;
  const scoreSize = size * 0.28;
  const leftX  = cardX + cardW * 0.22;
  const rightX = cardX + cardW * 0.78;
  const midX   = size / 2;

  // LIVE badge
  const badgeY  = size * 0.18;
  const dotR    = size * 0.025;
  const dotX    = size / 2 - size * 0.085;
  const dotY    = badgeY + size * 0.002;
  const liveX   = size / 2 - size * 0.025;
  const liveSize = size * 0.065;

  // Period label
  const periodY = cardY + cardH * 0.92;
  const periodSize = size * 0.065;

  // Bottom "LIVESCORES" wordmark
  const wordY = size - padY * 0.45;
  const wordSize = size * 0.072;

  const bg = rounded
    ? `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${BG}"/>`
    : `<rect width="${size}" height="${size}" fill="${BG}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  ${bg}

  <!-- Subtle top glow -->
  <radialGradient id="topGlow" cx="50%" cy="0%" r="70%">
    <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
  </radialGradient>
  <rect width="${size}" height="${size}" ${rounded ? `rx="${r}" ry="${r}"` : ''} fill="url(#topGlow)"/>

  <!-- Scoreboard card -->
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}"
        rx="${cardR}" ry="${cardR}"
        fill="${SURFACE}" stroke="${BORDER}" stroke-width="${size * 0.004}"/>

  <!-- Blue left accent bar on card -->
  <rect x="${cardX}" y="${cardY + cardH * 0.15}" width="${size * 0.008}" height="${cardH * 0.7}"
        rx="${size * 0.004}"
        fill="${BLUE}"/>

  <!-- Separator line between scores -->
  <line x1="${midX}" y1="${cardY + cardH * 0.25}" x2="${midX}" y2="${cardY + cardH * 0.85}"
        stroke="${BORDER}" stroke-width="${size * 0.004}"/>

  <!-- Away score (left) – white -->
  <text x="${leftX}" y="${scoreY}"
        font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        font-size="${scoreSize}" font-weight="900"
        fill="${WHITE}" text-anchor="middle" dominant-baseline="auto">21</text>

  <!-- Home score (right) – electric blue (winning) -->
  <text x="${rightX}" y="${scoreY}"
        font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        font-size="${scoreSize}" font-weight="900"
        fill="${BLUE}" text-anchor="middle" dominant-baseline="auto">28</text>

  <!-- Period label -->
  <text x="${midX}" y="${periodY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${periodSize}" font-weight="600"
        fill="${MUTED}" text-anchor="middle">Q3 · 8:42</text>

  <!-- LIVE pill (dot + text) -->
  <circle cx="${dotX}" cy="${dotY}" r="${dotR}" fill="${RED}"/>
  <text x="${liveX}" y="${badgeY + dotR * 0.5}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${liveSize}" font-weight="800" letter-spacing="1"
        fill="${RED}" text-anchor="start" dominant-baseline="middle">LIVE</text>

  <!-- Bottom wordmark -->
  <text x="${midX}" y="${wordY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${wordSize}" font-weight="700" letter-spacing="2"
        fill="${MUTED}" text-anchor="middle">LIVESCORES</text>
</svg>`;
}

/** Solid navy square for Android adaptive icon background */
function buildAndroidBgSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
</svg>`;
}

/** Foreground: just the scoreboard card, no background (transparent) */
function buildAndroidFgSvg(size) {
  const pad = size * 0.15;
  const cardX = pad;
  const cardY = pad;
  const cardW = size - pad * 2;
  const cardH = size - pad * 2;
  const cardR = size * 0.08;
  const midX = size / 2;
  const scoreY = cardY + cardH * 0.62;
  const scoreSize = size * 0.24;
  const leftX = cardX + cardW * 0.22;
  const rightX = cardX + cardW * 0.78;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}"
        rx="${cardR}" ry="${cardR}"
        fill="${SURFACE}" stroke="${BORDER}" stroke-width="${size * 0.005}"/>
  <text x="${leftX}" y="${scoreY}"
        font-family="'Arial Black', Arial, sans-serif"
        font-size="${scoreSize}" font-weight="900"
        fill="${WHITE}" text-anchor="middle">21</text>
  <text x="${rightX}" y="${scoreY}"
        font-family="'Arial Black', Arial, sans-serif"
        font-size="${scoreSize}" font-weight="900"
        fill="${BLUE}" text-anchor="middle">28</text>
  <circle cx="${midX - size * 0.09}" cy="${cardY + cardH * 0.18}" r="${size * 0.028}" fill="${RED}"/>
  <text x="${midX - size * 0.045}" y="${cardY + cardH * 0.195}"
        font-family="Arial, sans-serif"
        font-size="${size * 0.07}" font-weight="800"
        fill="${RED}" text-anchor="start" dominant-baseline="middle">LIVE</text>
</svg>`;
}

// ─── Render Helpers ───────────────────────────────────────────────────────────

async function renderSvgToPng(svgString, outputPath, size) {
  await sharp(Buffer.from(svgString))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✓  ${path.relative(process.cwd(), outputPath)}  (${size}×${size})`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨  Generating LiveScores icons…\n');

  // Main icon (1024×1024, rounded corners shown by OS)
  await renderSvgToPng(buildIconSvg(1024), path.join(ASSETS, 'icon.png'), 1024);

  // Splash screen icon (centred on splash background)
  await renderSvgToPng(buildIconSvg(512), path.join(ASSETS, 'splash-icon.png'), 512);

  // Web favicon
  await renderSvgToPng(buildIconSvg(64), path.join(ASSETS, 'favicon.png'), 64);

  // Android adaptive icon – background (solid colour layer)
  await renderSvgToPng(buildAndroidBgSvg(1024), path.join(ASSETS, 'android-icon-background.png'), 1024);

  // Android adaptive icon – foreground (content layer, ~66% safe zone)
  await renderSvgToPng(buildAndroidFgSvg(1024), path.join(ASSETS, 'android-icon-foreground.png'), 1024);

  // Android monochrome (white-on-transparent for themed icons)
  const monoSvg = buildAndroidFgSvg(1024)
    .replace(new RegExp(SURFACE.replace('#', '\\#'), 'g'), 'white')
    .replace(new RegExp(WHITE.replace('#', '\\#'), 'g'), 'white')
    .replace(new RegExp(BLUE.replace('#', '\\#'), 'g'), 'white')
    .replace(new RegExp(RED.replace('#', '\\#'), 'g'), 'white')
    .replace(new RegExp(BORDER.replace('#', '\\#'), 'g'), '#cccccc')
    .replace(new RegExp(MUTED.replace('#', '\\#'), 'g'), '#aaaaaa');
  await renderSvgToPng(monoSvg, path.join(ASSETS, 'android-icon-monochrome.png'), 1024);

  console.log('\n✅  All icons generated successfully!\n');
}

main().catch(err => {
  console.error('❌  Icon generation failed:', err.message);
  process.exit(1);
});
