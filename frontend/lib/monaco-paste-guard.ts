type MonacoEditor = {
  getDomNode(): HTMLElement | null;
  addCommand(
    keybinding: number,
    handler: (...args: unknown[]) => void,
    context?: string,
  ): string | number;
  removeCommand(commandId: string | number): void;
  updateOptions(options: Record<string, unknown>): void;
  onDidDispose(listener: () => void): { dispose(): void };
};

type MonacoApi = {
  KeyMod: { CtrlCmd: number; Shift: number };
  KeyCode: { KeyV: number; Insert: number };
};

export interface PasteGuardOptions {
  /** Called whenever a paste attempt is intercepted and blocked (throttled). */
  onBlocked?: () => void;
  /** Minimum gap in ms between `onBlocked` callbacks. Defaults to 5000. */
  feedbackCooldownMs?: number;
}

/**
 * Strictly disables pasting into a Monaco editor instance.
 *
 * Monaco registers its built-in `paste` action with keybindings and its own
 * context menu, so no single interception point is bulletproof. This layers
 * defense-in-depth:
 *
 *  1. Keybindings — `Ctrl/Cmd+V` and `Shift+Insert` are overridden with
 *     no-op commands. The last-registered keybinding for a chord wins, so the
 *     built-in paste action never fires.
 *  2. Context menu — the DOM `contextmenu` event is swallowed at the editor
 *     root (capture phase, before Monaco's handler), so neither Monaco's menu
 *     nor the browser's default menu (which contains a native Paste item) can
 *     appear.
 *  3. DOM `paste` — any paste event reaching the browser pipeline (X11
 *     middle-click paste, autofill, extensions, drag insert) is prevented.
 *  4. Drag & drop — the `dragAndDrop` option is disabled and the raw
 *     `dragover`/`drop` events are suppressed, so text can no longer be
 *     dragged into the editor.
 *
 * Normal typing, `Ctrl/Cmd+C/X/A`, and Monaco commands are unaffected. Returns
 * a dispose function; it also runs automatically when the editor is disposed
 * (e.g. on unmount or a language-toggle remount).
 */
export function blockPaste(
  editor: MonacoEditor,
  monaco: MonacoApi,
  options: PasteGuardOptions = {},
): () => void {
  const disposers: Array<() => void> = [];
  const cooldownMs = options.feedbackCooldownMs ?? 5000;
  let lastBlockedAt = 0;
  let disposed = false;

  const handleBlocked = () => {
    const now = Date.now();
    if (now - lastBlockedAt < cooldownMs) return;
    lastBlockedAt = now;
    options.onBlocked?.();
  };

  const track = (disposer: () => void) => {
    disposers.push(disposer);
  };

  // Layer 1: swallow the paste keybindings.
  const pasteChords = [
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
    monaco.KeyMod.Shift | monaco.KeyCode.Insert,
  ];
  for (const chord of pasteChords) {
    let commandId: string | number | undefined;
    try {
      commandId = editor.addCommand(chord, handleBlocked);
    } catch {
      commandId = undefined;
    }
    if (commandId !== undefined) {
      track(() => {
        try {
          editor.removeCommand(commandId);
        } catch {
          // Editor already disposed — commands are cleaned up with it.
        }
      });
    }
  }

  // Layer 4 (option half): external drag insertion is rejected by Monaco
  // itself when the option is off.
  try {
    editor.updateOptions({ dragAndDrop: false });
  } catch {
    // updateOptions is safe at mount; ignore if the editor is gone.
  }

  const domNode = editor.getDomNode();

  // Layers 2 + 3 + 4 (event half): block the raw browser events at the editor
  // root in the capture phase, before any Monaco/browser handler can act.
  if (domNode) {
    const block = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      handleBlocked();
    };

    const onContextMenu = block;
    const onPaste = block;
    const onDragOver = block;
    const onDrop = block;

    domNode.addEventListener("contextmenu", onContextMenu, true);
    domNode.addEventListener("paste", onPaste, true);
    domNode.addEventListener("dragover", onDragOver, true);
    domNode.addEventListener("drop", onDrop, true);

    track(() => {
      domNode.removeEventListener("contextmenu", onContextMenu, true);
      domNode.removeEventListener("paste", onPaste, true);
      domNode.removeEventListener("dragover", onDragOver, true);
      domNode.removeEventListener("drop", onDrop, true);
    });
  }

  // Free everything if Monaco disposes the editor before our caller does.
  let didDispose: { dispose(): void } | undefined;
  try {
    didDispose = editor.onDidDispose(() => dispose());
  } catch {
    didDispose = undefined;
  }
  if (didDispose) {
    track(() => didDispose?.dispose());
  }

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const disposer of disposers.splice(0)) {
      try {
        disposer();
      } catch {
        // Cleanup must never throw.
      }
    }
  };

  return dispose;
}
