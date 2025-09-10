#!/usr/bin/env node

/**
 * Icon Generation Script for MovieStreamer PWA
 * Generates all required icon sizes for PWA, iOS, Android, and favicon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes required for PWA
const iconSizes = [
  // PWA Standard sizes
  { size: 72, name: 'icon-72x72.png', purpose: 'any' },
  { size: 96, name: 'icon-96x96.png', purpose: 'any' },
  { size: 128, name: 'icon-128x128.png', purpose: 'any' },
  { size: 144, name: 'icon-144x144.png', purpose: 'any' },
  { size: 152, name: 'icon-152x152.png', purpose: 'any' },
  { size: 192, name: 'icon-192x192.png', purpose: 'any' },
  { size: 384, name: 'icon-384x384.png', purpose: 'any' },
  { size: 512, name: 'icon-512x512.png', purpose: 'any' },
  
  // Maskable icons for Android
  { size: 192, name: 'icon-192x192-maskable.png', purpose: 'maskable' },
  { size: 512, name: 'icon-512x512-maskable.png', purpose: 'maskable' },
  
  // Favicon sizes
  { size: 16, name: 'favicon-16x16.png', purpose: 'favicon' },
  { size: 32, name: 'favicon-32x32.png', purpose: 'favicon' },
  { size: 48, name: 'favicon-48x48.png', purpose: 'favicon' },
  
  // Apple Touch Icons
  { size: 57, name: 'apple-touch-icon-57x57.png', purpose: 'apple' },
  { size: 60, name: 'apple-touch-icon-60x60.png', purpose: 'apple' },
  { size: 72, name: 'apple-touch-icon-72x72.png', purpose: 'apple' },
  { size: 76, name: 'apple-touch-icon-76x76.png', purpose: 'apple' },
  { size: 114, name: 'apple-touch-icon-114x114.png', purpose: 'apple' },
  { size: 120, name: 'apple-touch-icon-120x120.png', purpose: 'apple' },
  { size: 144, name: 'apple-touch-icon-144x144.png', purpose: 'apple' },
  { size: 152, name: 'apple-touch-icon-152x152.png', purpose: 'apple' },
  { size: 180, name: 'apple-touch-icon-180x180.png', purpose: 'apple' }
];

// Generate SVG icon template
function generateSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
  
  <!-- Play button icon -->
  <path d="M${size * 0.35} ${size * 0.25}L${size * 0.75} ${size * 0.5}L${size * 0.35} ${size * 0.75}V${size * 0.25}Z" fill="white"/>
  
  <!-- Film strip decoration -->
  <rect x="${size * 0.1}" y="${size * 0.15}" width="${size * 0.8}" height="${size * 0.05}" fill="white" opacity="0.3"/>
  <rect x="${size * 0.1}" y="${size * 0.8}" width="${size * 0.8}" height="${size * 0.05}" fill="white" opacity="0.3"/>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
}

// Generate maskable SVG icon (with safe area)
function generateMaskableSVGIcon(size) {
  const safeArea = size * 0.8; // 80% safe area for maskable icons
  const offset = (size - safeArea) / 2;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (full size for maskable) -->
  <rect width="${size}" height="${size}" fill="url(#gradient)"/>
  
  <!-- Content in safe area -->
  <g transform="translate(${offset}, ${offset})">
    <!-- Play button icon -->
    <path d="M${safeArea * 0.35} ${safeArea * 0.25}L${safeArea * 0.75} ${safeArea * 0.5}L${safeArea * 0.35} ${safeArea * 0.75}V${safeArea * 0.25}Z" fill="white"/>
    
    <!-- Film strip decoration -->
    <rect x="${safeArea * 0.1}" y="${safeArea * 0.15}" width="${safeArea * 0.8}" height="${safeArea * 0.05}" fill="white" opacity="0.3"/>
    <rect x="${safeArea * 0.1}" y="${safeArea * 0.8}" width="${safeArea * 0.8}" height="${safeArea * 0.05}" fill="white" opacity="0.3"/>
  </g>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
}

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate placeholder icons (SVG format for now)
console.log('🎨 Generating PWA icons...');

iconSizes.forEach(({ size, name, purpose }) => {
  const iconPath = path.join(iconsDir, name);
  
  let svgContent;
  if (purpose === 'maskable') {
    svgContent = generateMaskableSVGIcon(size);
  } else {
    svgContent = generateSVGIcon(size);
  }
  
  // For now, save as SVG (in production, you'd convert to PNG)
  const svgName = name.replace('.png', '.svg');
  const svgPath = path.join(iconsDir, svgName);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generated ${svgName} (${size}x${size})`);
});

// Generate favicon.ico placeholder
const faviconContent = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
  <path d="M11 8L24 16L11 24V8Z" fill="white"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconContent);
console.log('✅ Generated favicon.svg');

// Generate iOS splash screens
const splashScreens = [
  { width: 1125, height: 2436, name: 'splash-1125x2436.png', device: 'iPhone X/XS' },
  { width: 1242, height: 2688, name: 'splash-1242x2688.png', device: 'iPhone XS Max' },
  { width: 828, height: 1792, name: 'splash-828x1792.png', device: 'iPhone XR' },
  { width: 1170, height: 2532, name: 'splash-1170x2532.png', device: 'iPhone 12/13 Pro' },
  { width: 1284, height: 2778, name: 'splash-1284x2778.png', device: 'iPhone 12/13 Pro Max' },
  { width: 1080, height: 2340, name: 'splash-1080x2340.png', device: 'iPhone 12 mini' },
  { width: 750, height: 1334, name: 'splash-750x1334.png', device: 'iPhone 8' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png', device: 'iPhone 8 Plus' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png', device: 'iPad' },
  { width: 1668, height: 2224, name: 'splash-1668x2224.png', device: 'iPad Pro 10.5"' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png', device: 'iPad Pro 11"' },
  { width: 2048, height: 2732, name: 'splash-2048x2732.png', device: 'iPad Pro 12.9"' }
];

function generateSplashScreen(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const iconSize = Math.min(width, height) * 0.15;
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Center icon -->
  <g transform="translate(${centerX - iconSize/2}, ${centerY - iconSize/2})">
    <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.2}" fill="url(#iconGradient)"/>
    <path d="M${iconSize * 0.35} ${iconSize * 0.25}L${iconSize * 0.75} ${iconSize * 0.5}L${iconSize * 0.35} ${iconSize * 0.75}V${iconSize * 0.25}Z" fill="white"/>
  </g>
  
  <!-- App name -->
  <text x="${centerX}" y="${centerY + iconSize/2 + 40}" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600">MovieStreamer</text>
  
  <!-- Gradients -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
}

console.log('\n📱 Generating iOS splash screens...');

splashScreens.forEach(({ width, height, name, device }) => {
  const splashContent = generateSplashScreen(width, height);
  const svgName = name.replace('.png', '.svg');
  const svgPath = path.join(iconsDir, svgName);
  
  fs.writeFileSync(svgPath, splashContent);
  console.log(`✅ Generated ${svgName} (${width}x${height}) for ${device}`);
});

// Generate manifest icons array
const manifestIcons = iconSizes
  .filter(icon => icon.purpose === 'any' || icon.purpose === 'maskable')
  .map(({ size, name, purpose }) => ({
    src: `/icons/${name}`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: purpose === 'maskable' ? 'maskable' : 'any'
  }));

// Generate icon documentation
const iconDocs = `# MovieStreamer PWA Icons

## Generated Icons

### PWA Icons
${iconSizes.filter(i => i.purpose === 'any').map(i => `- ${i.name} (${i.size}x${i.size})`).join('\n')}

### Maskable Icons (Android)
${iconSizes.filter(i => i.purpose === 'maskable').map(i => `- ${i.name} (${i.size}x${i.size})`).join('\n')}

### Favicon
${iconSizes.filter(i => i.purpose === 'favicon').map(i => `- ${i.name} (${i.size}x${i.size})`).join('\n')}

### Apple Touch Icons
${iconSizes.filter(i => i.purpose === 'apple').map(i => `- ${i.name} (${i.size}x${i.size})`).join('\n')}

### iOS Splash Screens
${splashScreens.map(s => `- ${s.name} (${s.width}x${s.height}) - ${s.device}`).join('\n')}

## Manifest Icons JSON
\`\`\`json
${JSON.stringify(manifestIcons, null, 2)}
\`\`\`

## Usage in HTML
\`\`\`html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-touch-icon-144x144.png">

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">
\`\`\`

## Notes
- Icons are currently generated as SVG placeholders
- For production, convert SVG to PNG using tools like sharp or imagemagick
- Maskable icons include safe area for Android adaptive icons
- Splash screens are optimized for various iOS devices
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), iconDocs);

console.log('\n🎉 Icon generation complete!');
console.log(`📁 Generated ${iconSizes.length} icons + ${splashScreens.length} splash screens`);
console.log('📋 Documentation saved to public/icons/README.md');
console.log('\n💡 Next steps:');
console.log('1. Convert SVG icons to PNG format for production');
console.log('2. Update manifest.json with generated icon paths');
console.log('3. Update index.html with favicon and apple-touch-icon links');
console.log('4. Test PWA installation on various devices');
