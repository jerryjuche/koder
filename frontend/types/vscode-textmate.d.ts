// vscode-textmate ships types but no "types" field in package.json, so TypeScript
// cannot resolve the module on its own. Re-export the bundled declaration.
declare module "vscode-textmate" {
  export {
    Registry,
    INITIAL,
    IRawGrammar,
    IRawTheme,
    Grammar,
    StateStack,
    IOnigLib,
    parseRawGrammar,
  } from "../node_modules/vscode-textmate/types/vscode-textmate";
}
