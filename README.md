# Chrome Extensions Workspace

This workspace contains a collection of Chrome extensions ranging from basic to advanced implementations. Each extension demonstrates different Chrome Extension APIs, development patterns, and use cases.

## 📁 Workspace Structure

This workspace is organized to contain multiple Chrome extensions, each in its own directory with the following typical structure:

```
chrome_extensions/
├── extension-name/
│   ├── manifest.json          # Extension configuration
│   ├── popup.html            # Popup UI (if applicable)
│   ├── popup.js              # Popup logic
│   ├── content.js            # Content script
│   ├── background.js         # Background/Service worker
│   ├── options.html          # Options page
│   ├── options.js            # Options logic
│   ├── styles.css            # Styling
│   ├── icons/                # Extension icons
│   └── assets/               # Images, fonts, etc.
├── shared/                   # Shared utilities and components
└── docs/                     # Documentation and guides
```

## 🎯 Extension Categories

### Basic Extensions
- **Popup Extensions**: Simple UI interactions with popup windows
- **Content Script Extensions**: Page manipulation and data extraction
- **Background Script Extensions**: Event-driven functionality
- **Options Pages**: User configuration and settings

### Intermediate Extensions
- **Storage Extensions**: Local and sync storage implementations
- **Tab Management**: Working with browser tabs and windows
- **Bookmarks & History**: Browser data manipulation
- **Context Menus**: Custom right-click menu items

### Advanced Extensions
- **DevTools Extensions**: Browser developer tools integration
- **WebRequest Interceptors**: Network request modification
- **Declarative Net Request**: Modern content blocking
- **Enterprise Extensions**: Policy-driven corporate extensions
- **Cross-Extension Communication**: Message passing between extensions

## 🛠️ Development Setup

### Prerequisites
- Node.js (for build tools and package management)
- Chrome or Chromium browser
- Text editor or IDE with JavaScript support

### Common Development Tools
- **Build Systems**: Webpack, Rollup, or Vite for bundling
- **TypeScript**: For type-safe development
- **Testing**: Jest or similar for unit testing
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent code style

### Loading Extensions for Development
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select your extension directory
4. Make changes and click the refresh button to reload

## 📚 Learning Resources

Each extension includes:
- Detailed comments explaining Chrome Extension APIs
- README with specific setup instructions
- Example use cases and implementation notes
- Common patterns and best practices

## 🔧 Chrome Extension APIs Covered

- **Runtime API**: Extension lifecycle and messaging
- **Storage API**: Data persistence and synchronization
- **Tabs API**: Browser tab management
- **ActiveTab Permission**: Current tab access
- **Content Scripts**: Page interaction and modification
- **Background Scripts**: Event handling and background tasks
- **Popup UI**: Extension interface development
- **Options Pages**: User preference management
- **Context Menus**: Custom menu integration
- **WebRequest**: Network request interception
- **Declarative Net Request**: Content filtering
- **DevTools**: Developer tools extension
- **Bookmarks**: Bookmark management
- **History**: Browser history access
- **Commands**: Keyboard shortcuts
- **Notifications**: System notifications

## 📝 Contributing

When adding new extensions:
1. Create a new directory with a descriptive name
2. Include a manifest.json file following the latest Manifest V3 format
3. Add comprehensive comments and documentation
4. Include a README specific to that extension
5. Follow the established coding standards and patterns

## 🔒 Security Notes

- Never commit private keys or sensitive data
- Use environment variables for API keys
- Follow Chrome Extension security best practices
- Implement proper content security policies
- Validate all user inputs and external data

## 📖 Documentation

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
