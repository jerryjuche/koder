import { cpSync, existsSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = resolve(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const dest = resolve(root, 'public', 'vs');
const onigSrc = resolve(root, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm');

// Only the assets the app actually loads are worth deploying. Full min/vs is
// ~15.4 MB including a 7 MB TypeScript worker, CSS/HTML/JSON workers, and 14
// locale NLS bundles — none of which this app requests (Monaco mounts go,
// python, or plaintext only, always English). Regenerate the directory each
// run so a monaco upgrade that lands in node_modules is applied in full.
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

// Workers that are only spawned for their matching languages — never here.
// editor.worker (the base editor worker) is always required, so it survives.
const assetsDir = resolve(dest, 'assets');
if (existsSync(assetsDir)) {
  for (const file of readdirSync(assetsDir)) {
    if (/^(ts|css|html|json)\.worker-[\w-]+\.js$/.test(file)) {
      rmSync(resolve(assetsDir, file));
    }
  }
}

// NLS locale bundles other than English (`nls.messages.js.js` + loader).
for (const file of readdirSync(dest)) {
  if (/^nls\.messages\..+\.js\.js$/.test(file) && file !== 'nls.messages.js.js') {
    rmSync(resolve(dest, file));
  }
}

console.log('[copy-monaco] Pruned monaco-editor assets to app-required files');

// TextMate tokenization needs oniguruma's WASM at runtime. Copy it after the
// prune so upgrades land even when public/vs changes.
if (existsSync(onigSrc)) {
  cpSync(onigSrc, resolve(dest, 'onig.wasm'));
  console.log('[copy-monaco] Copied onig.wasm to public/vs/onig.wasm');
} else {
  console.warn('[copy-monaco] onig.wasm not found — TextMate tokenization will fall back to built-in');
}