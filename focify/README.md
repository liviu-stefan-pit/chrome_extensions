# Focify — YouTube Focus Mode (Private)

<div align="center">
  <img src="assets/icons/icon128.png" alt="Focify Icon" width="64" height="64">
  <h3>Focus on what matters on YouTube</h3>
</div>

MV3 Chrome extension to reduce YouTube distractions with smart filtering and focus modes.

## 🎯 Features

### **Modes**
- **Off** – Normal YouTube experience
- **Work** – Hide distractions while keeping core functionality

### **Smart Distraction Blocking**
- 🚫 **Shorts** – Blocks YouTube Shorts pages entirely
- 🏠 **Home Grid** – Hides recommended videos on homepage
- 👥 **Related Sidebar** – Removes suggested videos while watching
- 💬 **Comments** – Optional comment section hiding
- 🔚 **End Screens** – Blocks video end screens and overlays
- 📺 **Mini-player** – Disables floating mini-player
- ⏯️ **Autoplay** – Prevents automatic video playback

### **Smart Features**
- 🔄 **Shorts Redirect** – Converts Shorts links to regular video pages
- ⌨️ **Hotkeys** – `Alt+Shift+F` to cycle modes quickly
- 🍅 **Pomodoro Timer** – Built-in focus timer (coming in v0.2)

## 🚀 Installation

### Load as Unpacked Extension
1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `focify` folder
5. Pin the Focify extension to your toolbar

### Usage
- Click the Focify icon to open settings
- Use `Alt+Shift+F` to quickly cycle between modes
- Configure advanced settings via the Options page

## 🎨 Icon Design

The Focify icon features:
- **Abstract focus symbol** with concentric circles representing concentration
- **Radiating lines** symbolizing filtering and blocking distractions  
- **Purple gradient** for a modern, calming aesthetic
- **Multiple sizes** optimized for all Chrome extension contexts

### Icon Generation
Icons are generated using the included Python script:
```bash
cd assets/icons
python generate_icons.py
```

Or use the HTML generator: Open `assets/icons/icon-generator.html` in your browser.

## 🛠️ Development

### Project Structure
```
/focify/
├── manifest.json          # Extension configuration
├── rules/
│   └── dnr_static.json    # Static blocking rules
├── assets/
│   ├── yt-focus.css       # YouTube styling overrides
│   └── icons/             # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── background/        # Service worker
│   ├── common/           # Shared utilities
│   ├── content/          # YouTube page scripts
│   ├── popup/            # Extension popup UI
│   └── options/          # Settings page
└── README.md
```

### Technical Details
- **Manifest V3** with modern Chrome extension APIs
- **Declarative Net Request** for efficient blocking
- **CSS-first approach** for fast performance
- **Storage sync** for settings persistence across devices

## 🔐 Privacy

Focify is **completely private**:
- ✅ No data collection or tracking
- ✅ No external servers or analytics
- ✅ Settings stored locally in Chrome sync
- ✅ Open source and auditable

## 📋 Roadmap

### v0.2 (Next Release)
- 🍅 Pomodoro timer with break reminders
- 🎨 Enhanced "search-only" home page
- ⚙️ Advanced filtering options

### v0.3 (Future)
- 📊 Focus time analytics
- 🌙 Dark mode optimizations
- 📱 Mobile YouTube support
- 🔧 Custom CSS injection

## 🤝 Contributing

This is a private repository. For feature requests or bug reports, please create an issue.

## 📄 License

Private - All rights reserved.

---

<div align="center">
  <strong>Focus better. Browse smarter. Stay productive.</strong>
</div>

## Modes
- **Off** – no changes
- **Work** – hides selected distractions (configurable)

## Development Notes
- Static DNR in `rules/dnr_static.json`
- Dynamic DNR managed by `src/background/sw.js`
- CSS toggles via classes on `<html>`; content script listens for storage changes

## Roadmap
- Pomodoro overlay with `chrome.alarms` backup
  
- Better "search-only" home UI
