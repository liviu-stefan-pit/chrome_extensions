# Otaku Tab - Modern Anime New Tab Extension

A beautiful, modern Chrome extension that transforms your new tab into an anime discovery hub powered by the AniList API.

## ✨ Features

### 🎯 Core Features
- **Currently Airing Schedule** - View weekly anime schedule organized by day
- **Browse Current Season** - Discover the latest seasonal anime
- **Top Rated Anime** - Explore the highest-rated anime of all time
- **Smart Search** - Fast, debounced search with live results
- **Favorites System** - Save and organize your favorite anime
- **Random Anime** - Discover something new with the random button

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful frosted glass effects with subtle animations
- **Dark Theme** - Eye-friendly dark interface with purple/pink gradient accents
- **Responsive Layout** - Adapts beautifully to any screen size
- **Smooth Animations** - Polished transitions and loading states
- **Skeleton Loaders** - Professional loading experience

### ⚡ Technical Features
- **TypeScript** - Full type safety and better developer experience
- **Vite Build System** - Lightning-fast HMR and optimized production builds
- **Modern ES Modules** - Clean, modular architecture
- **Smart Caching** - 6-hour cache with automatic refresh
- **Retry Logic** - Automatic retry on API failures
- **Error Handling** - Graceful degradation and user-friendly error messages

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   cd otaku_tab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

### Development

For development with hot reload:

```bash
npm run dev
```

Then load the extension from the project root (not dist) in Chrome developer mode.

## 📁 Project Structure

```
otaku_tab/
├── src/
│   ├── components/          # UI components
│   │   ├── AnimeCard.ts     # Reusable anime card component
│   │   ├── AnimeModal.ts    # Anime detail modal
│   │   ├── BrowseView.ts    # Current season view
│   │   ├── FavoritesPanel.ts # Favorites sidebar
│   │   ├── ScheduleView.ts  # Weekly schedule view
│   │   ├── Search.ts        # Search functionality
│   │   └── TopView.ts       # Top rated view
│   ├── services/            # Business logic layer
│   │   ├── anilist.ts         # AniList API service with caching
│   │   ├── favorites.ts     # Favorites management
│   │   └── preferences.ts   # User preferences
│   ├── types/               # TypeScript type definitions
│   │   ├── anilist.ts         # AniList API types
│   │   ├── ui.ts            # UI state types
│   │   └── modules.d.ts     # Module declarations
│   ├── utils/               # Utility functions
│   │   ├── anime.ts         # Anime data helpers
│   │   ├── dom.ts           # DOM manipulation helpers
│   │   └── timing.ts        # Debounce/throttle utilities
│   ├── styles/
│   │   └── main.css         # Global styles with Tailwind
│   └── main.ts              # Application entry point
├── scripts/
│   └── copy-assets.js       # Build helper script
├── icons/                   # Extension icons
├── index.html               # Main HTML template
├── manifest.json            # Chrome extension manifest
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🛠️ NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production-ready extension |
| `npm run preview` | Preview production build |
| `npm run type-check` | Run TypeScript type checking |
| `npm run icons` | Generate icon sizes (requires Python + Pillow) |

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (`#a855f7` to `#ec4899`)
- **Accent**: Pink (`#ec4899`), Cyan (`#06b6d4`), Emerald (`#10b981`)
- **Dark Palette**: Deep navy blues (`#020617` to `#0f172a`)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Effects
- **Glass Cards**: Backdrop blur with subtle borders
- **Neon Shadows**: Purple/pink glows on interactive elements
- **Smooth Animations**: Scale, fade, slide transitions

## 🔌 API

This extension uses the [AniList API](https://jikan.moe/) v4, an unofficial MyAnimeList API.

### Endpoints Used
- `/top/anime` - Top rated anime
- `/seasons/now` - Current season anime
- `/schedules` - Weekly broadcast schedule
- `/anime?q=` - Search anime
- `/anime/{id}/full` - Detailed anime information
- `/random/anime` - Random anime

### Rate Limiting
- Client-side caching (6 hours) to minimize API calls
- Automatic retry with exponential backoff
- Respects AniList API rate limits

## 🔒 Privacy

This extension:
- ✅ Only stores data locally in Chrome storage
- ✅ No user tracking or analytics
- ✅ No external scripts except AniList API
- ✅ No permissions beyond storage and AniList API access
- ✅ Open source and fully auditable

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use Tailwind CSS utility classes
- Write meaningful commit messages

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details

## 🙏 Credits

- **AniList API** - [@jikan-me](https://github.com/jikan-me/jikan)
- **MyAnimeList** - Anime data source
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon set

## 🐛 Known Issues

- Search may be rate-limited during heavy usage
- Image loading depends on MyAnimeList CDN availability
- Very large favorites lists may impact performance

## 🗺️ Roadmap

- [ ] Manga support
- [ ] Character database
- [ ] Personalized recommendations
- [ ] Export/import favorites
- [ ] Multiple theme options
- [ ] Offline mode with IndexedDB
- [ ] Chrome Web Store publication

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [AniList API status](https://status.jikan.moe/)

---

**Made with ❤️ for the anime community**

