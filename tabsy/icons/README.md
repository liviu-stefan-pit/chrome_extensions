# Tabsy Icon Generation

This folder contains a Python script to generate the forest-themed icon set used by Tabsy.

## Generate Icons

1. Ensure Python 3 and Pillow are installed.
2. Run the script:
   
   ```powershell
   pip install Pillow
   python icons/generate_icons.py
   ```
3. Generated files: `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png` (will be created in this directory or overwritten).
4. Copy (or replace) them into `images/` if you want to ship the regenerated variants.

## Design
A simple leaf glyph (stylized Unicode) with a green gradient circle background matching the extension's forest theme.

## Notes
- Source generation is deterministic; rerun to refresh.
- Keep resulting filenames consistent with `manifest.json`.
