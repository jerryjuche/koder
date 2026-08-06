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

// TextMate tokenization needs oniguruma's WASM at runtime. Copy it
// unconditionally so upgrades land even when public/vs already exists.
const onigSrc = resolve(root, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm');
if (existsSync(onigSrc)) {
  cpSync(onigSrc, resolve(dest, 'onig.wasm'));
  console.log('[copy-monaco] Copied onig.wasm to public/vs/onig.wasm');
} else {
  console.warn('[copy-monaco] onig.wasm not found — TextMate tokenization will fall back to built-in');
}
