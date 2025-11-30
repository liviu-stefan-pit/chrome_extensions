// Script to copy manifest and icons to dist folder after build
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
console.log('Copying manifest.json...');
copyFileSync(
  join(rootDir, 'manifest.json'),
  join(distDir, 'manifest.json')
);

// Copy icons directory
console.log('Copying icons...');
const iconsDistDir = join(distDir, 'icons');
if (!existsSync(iconsDistDir)) {
  mkdirSync(iconsDistDir, { recursive: true });
}

const iconSizes = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
iconSizes.forEach(icon => {
  const sourcePath = join(rootDir, 'icons', icon);
  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, join(iconsDistDir, icon));
  }
});

console.log('✅ Build assets copied successfully!');
