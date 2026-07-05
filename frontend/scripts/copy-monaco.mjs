import { cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = resolve(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const dest = resolve(root, 'public', 'vs');

if (existsSync(dest)) {
  console.log('[copy-monaco] public/vs already exists, skipping copy');
} else {
  cpSync(src, dest, { recursive: true });
  console.log('[copy-monaco] Copied monaco-editor workers to public/vs');
}
