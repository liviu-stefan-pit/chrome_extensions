# Slang Tutor & Translator (MV3)

A Chrome Extension (Manifest V3) to understand and translate slang, idioms, and colloquial expressions in context. Focused on a modern, friendly UI and modular architecture.

## Goals (short)
- In-page slang detection and inline explanations.
- Quick translate via popup, context menu, and side panel.
- Multi-language support and customizable slang dictionaries.
- Polished UI using Tailwind CSS.

## Run steps (to be filled later)
1. Install dependencies (build tooling, Tailwind, etc). TODO
2. Build or watch the extension assets. TODO
3. In Chrome: open chrome://extensions, enable Developer mode, then Load unpacked and select this folder. TODO

## Structure
- MV3 service worker for background logic.
- Content script for on-page parsing and highlighting.
- Popup, Options, and Side Panel pages for UX flows.
- Modular services (translation, storage, messaging), utils, and UI components.
- i18n via _locales.
