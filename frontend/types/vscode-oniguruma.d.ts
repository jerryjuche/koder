// vscode-oniguruma ships types but no "types" field in package.json, so TypeScript
// cannot resolve the module on its own. Re-export the bundled declaration.
declare module "vscode-oniguruma" {
  export {
    loadWASM,
    createOnigScanner,
    createOnigString,
    OnigScanner,
    OnigString,
  } from "../node_modules/vscode-oniguruma/main";
}
