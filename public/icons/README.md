# MovieStreamer PWA Icons

## Generated Icons

### PWA Icons
- icon-72x72.png (72x72)
- icon-96x96.png (96x96)
- icon-128x128.png (128x128)
- icon-144x144.png (144x144)
- icon-152x152.png (152x152)
- icon-192x192.png (192x192)
- icon-384x384.png (384x384)
- icon-512x512.png (512x512)

### Maskable Icons (Android)
- icon-192x192-maskable.png (192x192)
- icon-512x512-maskable.png (512x512)

### Favicon
- favicon-16x16.png (16x16)
- favicon-32x32.png (32x32)
- favicon-48x48.png (48x48)

### Apple Touch Icons
- apple-touch-icon-57x57.png (57x57)
- apple-touch-icon-60x60.png (60x60)
- apple-touch-icon-72x72.png (72x72)
- apple-touch-icon-76x76.png (76x76)
- apple-touch-icon-114x114.png (114x114)
- apple-touch-icon-120x120.png (120x120)
- apple-touch-icon-144x144.png (144x144)
- apple-touch-icon-152x152.png (152x152)
- apple-touch-icon-180x180.png (180x180)

### iOS Splash Screens
- splash-1125x2436.png (1125x2436) - iPhone X/XS
- splash-1242x2688.png (1242x2688) - iPhone XS Max
- splash-828x1792.png (828x1792) - iPhone XR
- splash-1170x2532.png (1170x2532) - iPhone 12/13 Pro
- splash-1284x2778.png (1284x2778) - iPhone 12/13 Pro Max
- splash-1080x2340.png (1080x2340) - iPhone 12 mini
- splash-750x1334.png (750x1334) - iPhone 8
- splash-1242x2208.png (1242x2208) - iPhone 8 Plus
- splash-1536x2048.png (1536x2048) - iPad
- splash-1668x2224.png (1668x2224) - iPad Pro 10.5"
- splash-1668x2388.png (1668x2388) - iPad Pro 11"
- splash-2048x2732.png (2048x2732) - iPad Pro 12.9"

## Manifest Icons JSON
```json
[
  {
    "src": "/icons/icon-72x72.png",
    "sizes": "72x72",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-96x96.png",
    "sizes": "96x96",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-128x128.png",
    "sizes": "128x128",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-144x144.png",
    "sizes": "144x144",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-152x152.png",
    "sizes": "152x152",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-384x384.png",
    "sizes": "384x384",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icons/icon-192x192-maskable.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "/icons/icon-512x512-maskable.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

## Usage in HTML
```html
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
```

## Notes
- Icons are currently generated as SVG placeholders
- For production, convert SVG to PNG using tools like sharp or imagemagick
- Maskable icons include safe area for Android adaptive icons
- Splash screens are optimized for various iOS devices
