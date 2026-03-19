/**
 * LiveScores App Icon Generator
 * Run with:  node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path  = require('path');

const ASSETS = path.resolve(__dirname, '../assets');

// ─── SVG Builder ──────────────────────────────────────────────────────────────
function buildIconSvg(size, { rounded = true } = {}) {
  const rx = rounded ? size * 0.18 : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${size}" height="${size}" viewBox="0 0 1000 1000">
<defs>
  <!-- Background blue gradient -->
  <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%"   stop-color="#2278e8"/>
    <stop offset="100%" stop-color="#0d3ea8"/>
  </linearGradient>
  <!-- Centre glow -->
  <radialGradient id="bgGlow" cx="50%" cy="44%" r="54%">
    <stop offset="0%"   stop-color="#3a8fff" stop-opacity="0.38"/>
    <stop offset="100%" stop-color="#0d3ea8" stop-opacity="0"/>
  </radialGradient>

  <!-- Metallic silver for arc (aligned to arc direction) -->
  <linearGradient id="arcMetal" x1="0" y1="900" x2="900" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#b0c0dc"/>
    <stop offset="30%"  stop-color="#e8f0fa"/>
    <stop offset="60%"  stop-color="#c0cce0"/>
    <stop offset="100%" stop-color="#7888a8"/>
  </linearGradient>

  <!-- Metallic silver for figures -->
  <linearGradient id="figMetal" x1="150" y1="350" x2="820" y2="730" gradientUnits="userSpaceOnUse">
    <stop offset="0%"   stop-color="#eef4fc"/>
    <stop offset="40%"  stop-color="#c4d2e8"/>
    <stop offset="80%"  stop-color="#8898bc"/>
    <stop offset="100%" stop-color="#5a6e94"/>
  </linearGradient>
  <!-- Highlight overlay for figures (lighter top edge) -->
  <linearGradient id="figHi" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="white" stop-opacity="0.45"/>
    <stop offset="45%"  stop-color="white" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
  </linearGradient>

  <!-- Red ball -->
  <radialGradient id="redBall" cx="35%" cy="28%" r="58%">
    <stop offset="0%"   stop-color="#ff8888"/>
    <stop offset="42%"  stop-color="#dd1010"/>
    <stop offset="100%" stop-color="#660000"/>
  </radialGradient>
  <!-- Ball outer glow -->
  <radialGradient id="ballHalo" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#ff2020" stop-opacity="0.7"/>
    <stop offset="55%"  stop-color="#ff0000" stop-opacity="0.2"/>
    <stop offset="100%" stop-color="#ff0000" stop-opacity="0"/>
  </radialGradient>

  <!-- Flame -->
  <linearGradient id="flOut" x1="0.1" y1="1" x2="0.2" y2="0">
    <stop offset="0%"   stop-color="#ff3d00"/>
    <stop offset="55%"  stop-color="#ff9900"/>
    <stop offset="100%" stop-color="#ffee44" stop-opacity="0.6"/>
  </linearGradient>
  <linearGradient id="flIn" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%"   stop-color="#ffaa00"/>
    <stop offset="100%" stop-color="#ffff88" stop-opacity="0.85"/>
  </linearGradient>

  <!-- Text extrude filter -->
  <filter id="txtFx" x="-8%" y="-8%" width="120%" height="135%">
    <feDropShadow dx="0" dy="6" stdDeviation="3" flood-color="#081e5a" flood-opacity="1"/>
  </filter>
  <!-- Glow filter for ball -->
  <filter id="glowBall" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>

<!-- ═══ Background ══════════════════════════════════════════════════════════ -->
<rect width="1000" height="1000" rx="${rx}" ry="${rx}" fill="url(#bg)"/>
<rect width="1000" height="1000" rx="${rx}" ry="${rx}" fill="url(#bgGlow)"/>

<!-- ═══ Metallic swoosh arc ═════════════════════════════════════════════════ -->
<!-- Back dark shadow -->
<path d="M -15 990 C 130 580 390 262 748 142 C 848 106 958 115 1025 158"
      stroke="#203870" stroke-width="110" fill="none" stroke-linecap="round" opacity="0.45"/>
<!-- Main silver body -->
<path d="M -15 990 C 130 580 390 262 748 142 C 848 106 958 115 1025 158"
      stroke="url(#arcMetal)" stroke-width="96" fill="none" stroke-linecap="round"/>
<!-- Top bright highlight stripe -->
<path d="M -15 990 C 130 580 390 262 748 142 C 848 106 958 115 1025 158"
      stroke="white" stroke-width="24" fill="none" stroke-linecap="round" opacity="0.58"/>
<!-- Bottom darker edge -->
<path d="M -15 990 C 130 580 390 262 748 142 C 848 106 958 115 1025 158"
      stroke="#243c7c" stroke-width="24" fill="none" stroke-linecap="round" opacity="0.35"/>

<!-- ═══ SOCCER PLAYER (left) ════════════════════════════════════════════════ -->
<!-- head -->
<circle cx="206" cy="412" r="37" fill="url(#figMetal)"/>
<circle cx="206" cy="412" r="37" fill="url(#figHi)"/>
<!-- torso -->
<path d="M 182 448 C 178 490 175 528 178 558 L 234 558 C 237 528 234 490 230 448 Z"
      fill="url(#figMetal)"/>
<path d="M 182 448 C 178 490 175 528 178 558 L 234 558 C 237 528 234 490 230 448 Z"
      fill="url(#figHi)"/>
<!-- neck -->
<rect x="193" y="448" width="26" height="18" rx="8" fill="url(#figMetal)"/>
<!-- left arm (back + down) -->
<path d="M 186 462 C 164 485 146 512 136 542"
      stroke="url(#figMetal)" stroke-width="26" fill="none" stroke-linecap="round"/>
<!-- right arm (forward/up for balance) -->
<path d="M 226 460 C 252 448 276 442 298 440"
      stroke="url(#figMetal)" stroke-width="26" fill="none" stroke-linecap="round"/>
<!-- left leg (plant, straight down) -->
<path d="M 188 556 C 178 598 166 640 154 678"
      stroke="url(#figMetal)" stroke-width="28" fill="none" stroke-linecap="round"/>
<!-- right leg (kicking forward) -->
<path d="M 224 556 C 264 566 330 568 392 554 C 412 548 430 544 444 542"
      stroke="url(#figMetal)" stroke-width="28" fill="none" stroke-linecap="round"/>
<!-- boot -->
<ellipse cx="455" cy="539" rx="28" ry="16" fill="url(#figMetal)"
         transform="rotate(-10 455 539)"/>

<!-- Soccer ball at right foot -->
<circle cx="478" cy="564" r="29" fill="#7888b0"/>
<circle cx="478" cy="564" r="29" fill="none" stroke="#a0aec8" stroke-width="5"/>
<!-- ball pentagons -->
<polygon points="478,535 493,547 488,564 468,564 463,547" fill="#5060888" opacity="0.65"/>
<polygon points="463,547 448,553 450,570 463,564" fill="#5060888" opacity="0.45"/>
<polygon points="493,547 508,553 506,570 493,564" fill="#5060888" opacity="0.45"/>

<!-- ═══ BASKETBALL PLAYER (centre) ══════════════════════════════════════════ -->
<!-- head -->
<circle cx="480" cy="368" r="39" fill="url(#figMetal)"/>
<circle cx="480" cy="368" r="39" fill="url(#figHi)"/>
<!-- torso -->
<path d="M 452 406 C 446 450 443 498 446 535 L 514 535 C 517 498 514 450 508 406 Z"
      fill="url(#figMetal)"/>
<path d="M 452 406 C 446 450 443 498 446 535 L 514 535 C 517 498 514 450 508 406 Z"
      fill="url(#figHi)"/>
<!-- neck -->
<rect x="466" y="406" width="28" height="20" rx="9" fill="url(#figMetal)"/>
<!-- left arm reaching up -->
<path d="M 455 416 C 434 386 418 354 408 322"
      stroke="url(#figMetal)" stroke-width="28" fill="none" stroke-linecap="round"/>
<!-- right arm reaching up -->
<path d="M 505 414 C 526 382 542 350 550 318"
      stroke="url(#figMetal)" stroke-width="28" fill="none" stroke-linecap="round"/>
<!-- left leg -->
<path d="M 458 533 C 446 578 436 624 426 666"
      stroke="url(#figMetal)" stroke-width="30" fill="none" stroke-linecap="round"/>
<!-- right leg -->
<path d="M 502 533 C 516 578 526 624 534 666"
      stroke="url(#figMetal)" stroke-width="30" fill="none" stroke-linecap="round"/>

<!-- Basketball (above player) -->
<circle cx="480" cy="300" r="46" fill="#8090b8"/>
<circle cx="480" cy="300" r="46" fill="none" stroke="#a8b8d0" stroke-width="6"/>
<!-- seam lines -->
<path d="M 434 300 Q 480 284 526 300 Q 480 316 434 300" stroke="#6070a0" stroke-width="3.5" fill="none"/>
<line x1="480" y1="254" x2="480" y2="346" stroke="#6070a0" stroke-width="3.5"/>
<!-- highlight -->
<ellipse cx="460" cy="282" rx="15" ry="11" fill="white" opacity="0.34" transform="rotate(-20 460 282)"/>

<!-- ═══ CRICKET BATSMAN (right) ═════════════════════════════════════════════ -->
<!-- head + helmet -->
<circle cx="704" cy="396" r="37" fill="url(#figMetal)"/>
<circle cx="704" cy="396" r="37" fill="url(#figHi)"/>
<!-- helmet grill/visor -->
<path d="M 678 412 C 675 426 681 440 696 445 L 724 441 C 738 430 740 413 726 404 Z"
      fill="#4a5a80" opacity="0.78"/>
<!-- torso (slight lean) -->
<path d="M 677 433 C 672 476 668 520 671 556 L 737 556 C 740 520 736 476 731 433 Z"
      fill="url(#figMetal)"/>
<path d="M 677 433 C 672 476 668 520 671 556 L 737 556 C 740 520 736 476 731 433 Z"
      fill="url(#figHi)"/>
<!-- neck -->
<rect x="690" y="432" width="28" height="20" rx="9" fill="url(#figMetal)"/>
<!-- left arm (guiding bat downward) -->
<path d="M 681 442 C 660 454 640 466 622 474"
      stroke="url(#figMetal)" stroke-width="26" fill="none" stroke-linecap="round"/>
<!-- right arm (swinging bat up) -->
<path d="M 727 440 C 758 424 786 410 816 400"
      stroke="url(#figMetal)" stroke-width="28" fill="none" stroke-linecap="round"/>
<!-- front left leg -->
<path d="M 679 554 C 664 598 652 644 640 682"
      stroke="url(#figMetal)" stroke-width="30" fill="none" stroke-linecap="round"/>
<!-- back right leg -->
<path d="M 729 554 C 744 598 754 644 762 682"
      stroke="url(#figMetal)" stroke-width="30" fill="none" stroke-linecap="round"/>

<!-- Bat grip/handle -->
<path d="M 810 396 C 838 380 860 362 876 342"
      stroke="url(#figMetal)" stroke-width="15" fill="none" stroke-linecap="round"/>
<!-- Bat blade (flat paddle shape) -->
<path d="M 870 336 C 885 314 896 288 888 270 C 880 252 862 256 850 272
         C 838 288 828 314 824 336 C 838 330 856 326 870 336 Z"
      fill="url(#figMetal)"/>
<!-- Bat edge highlight -->
<path d="M 863 333 C 876 313 886 289 880 274"
      stroke="white" stroke-width="4" fill="none" opacity="0.42" stroke-linecap="round"/>

<!-- ═══ FLAME on bat tip ═══════════════════════════════════════════════════ -->
<path d="M 882 268 C 872 250 874 228 884 212 C 892 226 896 216 894 204
         C 906 220 912 237 908 252 C 916 240 922 226 920 214
         C 928 232 926 252 920 266 C 926 254 932 242 932 230
         C 934 250 930 272 922 284 C 914 298 898 304 883 302
         C 871 297 866 285 872 272 Z"
      fill="url(#flOut)" opacity="0.96"/>
<path d="M 886 270 C 878 255 880 238 886 224 C 892 236 894 228 892 218
         C 901 230 906 244 903 256 C 909 246 913 236 911 226
         C 917 240 915 256 911 268 C 915 258 918 248 918 238
         C 920 254 918 272 912 282 C 906 294 893 298 882 295
         C 873 290 871 279 877 270 Z"
      fill="url(#flIn)" opacity="0.9"/>
<ellipse cx="895" cy="214" rx="7" ry="11" fill="#fffaaa" opacity="0.72"/>

<!-- ═══ BALL GLOW + RAYS + SPHERE ═══════════════════════════════════════════ -->
<!-- Outer halo -->
<circle cx="562" cy="175" r="96" fill="url(#ballHalo)"/>
<!-- Rays -->
<g stroke="#ff3030" stroke-linecap="round" opacity="0.84">
  <line x1="562" y1="175" x2="562" y2="56"   stroke-width="10"/>
  <line x1="562" y1="175" x2="646" y2="91"   stroke-width="9"/>
  <line x1="562" y1="175" x2="681" y2="175"  stroke-width="8"/>
  <line x1="562" y1="175" x2="646" y2="259"  stroke-width="7"/>
  <line x1="562" y1="175" x2="478" y2="91"   stroke-width="9"/>
  <line x1="562" y1="175" x2="443" y2="175"  stroke-width="8"/>
  <line x1="562" y1="175" x2="478" y2="259"  stroke-width="7"/>
  <line x1="562" y1="175" x2="617" y2="64"   stroke-width="7"/>
  <line x1="562" y1="175" x2="507" y2="64"   stroke-width="7"/>
</g>
<!-- Ball -->
<circle cx="562" cy="175" r="52" fill="url(#redBall)" filter="url(#glowBall)"/>
<!-- Specular highlight -->
<ellipse cx="543" cy="157" rx="16" ry="11" fill="white" opacity="0.36"
         transform="rotate(-25 543 157)"/>

<!-- ═══ "90'+4" badge ════════════════════════════════════════════════════════ -->
<text x="484" y="275" text-anchor="middle"
      font-family="'Arial Black','Impact',sans-serif"
      font-size="46" font-weight="900" letter-spacing="0"
      fill="#ffdd00" opacity="0.94"
      filter="url(#txtFx)">90'+4</text>

<!-- ═══ TEXT — SPORTS LIVE ══════════════════════════════════════════════════ -->
<!-- "SPORTS" extrusion layers (navy → white) -->
<text x="492" y="756" text-anchor="end"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="#081e5a">SPORTS</text>
<text x="492" y="752" text-anchor="end"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="#1540a0">SPORTS</text>
<text x="492" y="748" text-anchor="end"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="white">SPORTS</text>

<!-- "LIVE" extrusion layers (dark orange → bright orange) -->
<text x="508" y="756" text-anchor="start"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="#6e2c00">LIVE</text>
<text x="508" y="752" text-anchor="start"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="#c05a00">LIVE</text>
<text x="508" y="748" text-anchor="start"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="104" font-weight="900" fill="#ff8c00">LIVE</text>

<!-- ═══ TEXT — LIVE SCORES ═══════════════════════════════════════════════════ -->
<text x="500" y="870" text-anchor="middle"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="86" font-weight="900" letter-spacing="3"
      fill="#081e5a">LIVE SCORES</text>
<text x="500" y="866" text-anchor="middle"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="86" font-weight="900" letter-spacing="3"
      fill="#1540a0">LIVE SCORES</text>
<text x="500" y="862" text-anchor="middle"
      font-family="'Arial Black','Impact','Helvetica Neue',sans-serif"
      font-size="86" font-weight="900" letter-spacing="3"
      fill="white">LIVE SCORES</text>

<!-- ═══ 4-pointed sparkle star (bottom-right) ═══════════════════════════════ -->
<path d="M 932 942 L 942 958 L 958 942 L 942 926 Z
         M 932 942 L 916 942 L 932 958 L 948 942 Z"
      fill="white" opacity="0.70"/>

</svg>`;
}

// ─── Android helpers ──────────────────────────────────────────────────────────

function buildAndroidBgSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2278e8"/>
      <stop offset="100%" stop-color="#0d3ea8"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
</svg>`;
}

function buildAndroidFgSvg(size) {
  return buildIconSvg(size, { rounded: false })
    .replace(/<rect[^>]*fill="url\(#bg\)"[^>]*\/>/g, '')
    .replace(/<rect[^>]*fill="url\(#bgGlow\)"[^>]*\/>/g, '');
}

// ─── Render ───────────────────────────────────────────────────────────────────

async function renderSvgToPng(svgString, outputPath, size) {
  await sharp(Buffer.from(svgString)).resize(size, size).png().toFile(outputPath);
  console.log(`✓  ${path.relative(process.cwd(), outputPath)}  (${size}×${size})`);
}

async function main() {
  console.log('\n🎨  Generating LiveScores icons…\n');
  await renderSvgToPng(buildIconSvg(1024), path.join(ASSETS, 'icon.png'), 1024);
  await renderSvgToPng(buildIconSvg(512),  path.join(ASSETS, 'splash-icon.png'), 512);
  await renderSvgToPng(buildIconSvg(64),   path.join(ASSETS, 'favicon.png'), 64);
  await renderSvgToPng(buildAndroidBgSvg(1024), path.join(ASSETS, 'android-icon-background.png'), 1024);
  await renderSvgToPng(buildAndroidFgSvg(1024), path.join(ASSETS, 'android-icon-foreground.png'), 1024);

  const monoSvg = buildAndroidFgSvg(1024)
    .replace(/fill="url\(#figMetal\)"/g, 'fill="white"')
    .replace(/stroke="url\(#figMetal\)"/g, 'stroke="white"')
    .replace(/fill="url\(#arcMetal\)"/g, 'fill="white"')
    .replace(/fill="url\(#redBall\)"/g,  'fill="white"')
    .replace(/fill="url\(#flOut\)"/g,    'fill="#dddddd"')
    .replace(/fill="url\(#flIn\)"/g,     'fill="#eeeeee"')
    .replace(/fill="url\(#figHi\)"/g,    'fill="none"')
    .replace(/#8090b8/g, '#cccccc')
    .replace(/#7888b0/g, '#cccccc')
    .replace(/#ff8c00/g, '#cccccc');
  await renderSvgToPng(monoSvg, path.join(ASSETS, 'android-icon-monochrome.png'), 1024);

  console.log('\n✅  All icons generated successfully!\n');
}

main().catch(err => {
  console.error('❌  Icon generation failed:', err.message);
  process.exit(1);
});
