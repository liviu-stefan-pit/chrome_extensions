# 🎌 Otaku Tab

A sleek anime-themed Chrome extension that replaces your new tab page with a beautiful dashboard featuring today's airing anime schedule, search functionality, and anime discovery powered by the Jikan API.

![Otaku Tab Extension](icons/icon128.png)

## ✨ Features

- **🗓️ Daily Airing Schedule**: See what anime is airing today with episode times and cover art
- **🔍 Real-time Search**: Find any anime instantly with debounced search and preview results  
- **🎲 Discover Mode**: Random anime discovery with detailed information and scores
- **🌃 Dynamic Backgrounds**: Beautiful anime artwork backgrounds that change daily
- **🎨 Dark Theme**: Elegant dark UI optimized for anime fans
- **⚡ Performance**: Smart caching system reduces API calls and loads content fast
- **📱 Responsive**: Works perfectly on all screen sizes

## 🚀 Installation

### Chrome Web Store (Coming Soon)
*Extension will be available on the Chrome Web Store*

### Developer Mode (For Testing)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `otaku_tab` folder
5. Pin the extension and open a new tab to see Otaku Tab!

## 🛠️ Technology Stack

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Frontend**: Vanilla JavaScript (ES6+ modules), HTML5, CSS3
- **API**: [Jikan API v4](https://jikan.moe/) for MyAnimeList data
- **Storage**: Chrome Storage API for intelligent caching
- **Architecture**: Modular ES6 imports with clean separation of concerns

## 📁 Project Structure

```
otaku_tab/
├── manifest.json           # Extension configuration
├── index.html             # Main new tab page
├── dist/tailwind.css      # Built Tailwind CSS bundle
├── src/styles/tailwind.css # Tailwind source (design system)
├── package.json           # Project metadata
├── icons/                 # Extension icons
│   ├── generate_icons.py  # Icon generator script
│   ├── icon-generator.html # Browser-based icon generator
│   └── *.png             # Generated icons (16, 32, 48, 128px)
└── src/
    ├── main.js           # Entry point and initialization
    ├── api/
    │   └── jikan.js      # Jikan API client with caching
    ├── components/
    │   ├── background.js # Dynamic background loader
    │   ├── schedule.js   # Daily airing schedule
    │   ├── search.js     # Anime search functionality
    │   └── discover.js   # Random anime discovery
    └── utils/
        ├── debounce.js   # Debounce utility for search
        └── time.js       # Time/date helpers
```

## 🎨 Design System (Tailwind)

The UI is powered by Tailwind CSS with a custom forest palette defined in `tailwind.config.js` (`forest.50` → `forest.950`). Reusable component classes (prefixed `otk-`) are declared in the Tailwind component layer (`src/styles/tailwind.css`). These cover panels, cards, badges, highlights, discover modal, search results, buttons, inputs, and skeleton loaders.

Key advantages:
- Utility‑first workflow with small custom component abstractions
- Purge-safe build (content scan: `index.html`, `src/**/*.{js,html}`)
- Dark forest theme using gradient panels + soft shadows
- Accessible focus states via native outline + high‑contrast color choices
- Lightweight (only Tailwind + autoprefixer; no runtime framework)

## 🔧 Development

### Prerequisites
- Chrome/Chromium browser
- Python 3.6+ (for icon generation)
- `pip install Pillow` (for icon generation)

### Local Development
1. Clone the repository
2. Install dependencies (Tailwind build):
    ```bash
    npm install
    npm run build:css   # produces dist/tailwind.css
    # or for live editing
    npm run watch:css
    ```
3. Load the extension in Chrome Developer mode
4. Re-run `build:css` (or keep `watch:css` running) whenever you change files in `src/styles/`

### Generating Icons
```bash
# Using Python (recommended)
cd icons/
python generate_icons.py

# Or use the browser-based generator
open icons/icon-generator.html
```

### API Integration
The extension uses the free Jikan API v4. No API key required!

**Endpoints Used:**
- `GET /schedules/{day}` - Daily airing schedule
- `GET /top/anime?filter=airing` - Top airing anime for backgrounds
- `GET /anime?q={query}` - Search anime
- `GET /random/anime` - Random anime discovery

**Caching Strategy:**
- Schedule data: 6 hours
- Top anime list: 6 hours  
- Search results: No caching (real-time)
- Random anime: No caching (always fresh)

## 🌟 Contributing

We welcome contributions! Here are some ways you can help:

- 🐛 **Bug Reports**: Found an issue? Open a GitHub issue
- 💡 **Feature Requests**: Have an idea? Let's discuss it
- 🎨 **Design Improvements**: UI/UX enhancements are welcome
- 🔧 **Code Contributions**: Submit pull requests for improvements

### Development Guidelines
- Use ES6+ modules and modern JavaScript
- Follow the existing code style and structure
- Test changes with the Chrome Developer Tools
- Ensure responsive design across screen sizes
- Maintain performance with efficient API usage

## 📊 Performance

- **Load Time**: < 500ms on modern connections
- **Memory Usage**: < 50MB typical usage
- **API Calls**: Intelligently cached to respect rate limits
- **Bundle Size**: Minimal - no external frameworks

## 🔒 Privacy

Otaku Tab respects your privacy:
- ✅ No user data collection
- ✅ No analytics or tracking
- ✅ API calls go directly to Jikan/MyAnimeList
- ✅ Local storage only for caching anime data
- ✅ Open source and transparent

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Jikan API](https://jikan.moe/)** - Free MyAnimeList API
- **[MyAnimeList](https://myanimelist.net/)** - Anime database and community
- **[Inter Font](https://rsms.me/inter/)** - Beautiful typography
- **Anime Community** - For inspiration and feedback

## 🔗 Links

- [Chrome Web Store](#) *(Coming Soon)*
- [GitHub Repository](https://github.com/liviu-stefan-pit/chrome_extensions)
- [Jikan API Documentation](https://docs.api.jikan.moe/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)

---

Made with ❤️ for the anime community. Enjoy your new otaku-powered browser experience! 🎌✨
