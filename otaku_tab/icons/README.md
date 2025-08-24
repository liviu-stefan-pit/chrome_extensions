# Otaku Tab Icons

This directory contains the icon assets for the Otaku Tab Chrome extension.

## 🎨 Icon Design

The Otaku Tab icons feature a modern, anime-inspired aesthetic that matches the extension's dark theme:

- **Base Colors**: Dark theme (#1a1a2e, #1f2241) matching the app
- **Accent Color**: Vibrant pink/red (#e94560) for highlights
- **Design Element**: Stylized "O" for "Otaku" in a modern donut shape
- **Decorations**: Anime-style sparkle elements for larger icons
- **Effects**: Gradient backgrounds and subtle glow for depth

## 📁 Icon Sizes

The extension includes icons in all required Chrome extension sizes:

- `icon16.png` - 16×16 pixels (toolbar small)
- `icon32.png` - 32×32 pixels (Windows small icon)
- `icon48.png` - 48×48 pixels (extension management)
- `icon128.png` - 128×128 pixels (Chrome Web Store)

## 🛠️ Generation Methods

### Method 1: Python Script (Recommended)
```bash
python generate_icons.py
```

**Requirements**: `pip install Pillow`

**Features**:
- High-quality programmatic generation
- Precise color control and gradients
- Anti-aliased shapes and effects
- Batch generation of all sizes

### Method 2: HTML Generator (Browser-based)
Open `icon-generator.html` in any modern web browser.

**Features**:
- No dependencies required
- Visual preview of icons
- Individual download per size
- Canvas-based generation

## 🎯 Design Philosophy

The icons embody the "Otaku" aesthetic while maintaining professional appearance:

1. **Modern Minimalism**: Clean, geometric shapes
2. **Anime Inspiration**: Subtle sparkle effects and vibrant colors
3. **Dark Theme Integration**: Colors that complement the app UI
4. **Scalability**: Clear visibility from 16px to 128px
5. **Brand Consistency**: Recognizable "O" motif across all sizes

## 📋 Usage

The generated icons are automatically referenced in `manifest.json`:

```json
{
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png", 
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## 🔄 Regeneration

To update the icons:

1. Modify the design in `generate_icons.py` or `icon-generator.html`
2. Run the generation script
3. Replace the existing PNG files
4. Reload the extension in Chrome

## 🎨 Color Reference

```css
/* Extension Theme Colors */
--color-bg: #1a1a2e;        /* Main background */
--color-surface: #1f2241;    /* Card/panel background */
--color-accent: #e94560;     /* Accent/highlight color */
--color-text: #f5f6fa;       /* Primary text */
--color-text-dim: #c8c9d1;   /* Secondary text */
```

The icons use these exact colors to ensure perfect integration with the extension's visual design.
