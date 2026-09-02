import type { Canvas } from "fabric";
import { getMeta, SERIALIZED_PROPERTIES } from "./meta";
import { applyLock } from "./layers";
import { createCardClipPath } from "./setup";

const MAX_ENTRIES = 50;

/**
 * Snapshot-based undo/redo.
 *
 * Every mutation serializes the whole scene. On a 3.5 × 2 in card the scene is
 * tiny, so full snapshots are simpler and safer than command-pattern deltas —
 * there is no operation that can be forgotten or inverted incorrectly.
 *
 * The bottom of the undo stack is the baseline (empty or loaded) state and is
 * never popped, so `canUndo` means "more than the baseline".
 */
export class HistoryManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private suspended = false;

  /** Notifies React that canUndo/canRedo may have changed. */
  onChange?: () => void;

  /**
   * False until a baseline exists. Each card side owns a manager, and a side
   * being shown again must keep the stack it already built — only a manager
   * that has never seen a canvas gets reset.
   */
  get hasBaseline(): boolean {
    return this.undoStack.length > 0;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private serialize(canvas: Canvas): string {
    return JSON.stringify(canvas.toObject(SERIALIZED_PROPERTIES));
  }

  /** Establishes the baseline; wipes both stacks. */
  reset(canvas: Canvas) {
    this.undoStack = [this.serialize(canvas)];
    this.redoStack = [];
    this.onChange?.();
  }

  capture(canvas: Canvas) {
    if (this.suspended) return;

    const snapshot = this.serialize(canvas);
    if (snapshot === this.undoStack[this.undoStack.length - 1]) return;

    this.undoStack.push(snapshot);
    if (this.undoStack.length > MAX_ENTRIES) this.undoStack.shift();
    this.redoStack = [];
    this.onChange?.();
  }

  async undo(canvas: Canvas) {
    // Flush any change still sitting in the capture debounce window, so the
    // undo applies to what the user actually sees.
    this.capture(canvas);
    if (!this.canUndo) return;

    const current = this.undoStack.pop();
    if (current) this.redoStack.push(current);

    const target = this.undoStack[this.undoStack.length - 1];
    if (target) await this.restore(canvas, target);
  }

  async redo(canvas: Canvas) {
    const next = this.redoStack.pop();
    if (!next) return;

    this.undoStack.push(next);
    await this.restore(canvas, next);
  }

  private async restore(canvas: Canvas, snapshot: string) {
    this.suspended = true;
    try {
      canvas.discardActiveObject();
      await canvas.loadFromJSON(snapshot);
      canvas.clipPath = createCardClipPath();
      rehydrateScene(canvas);
      canvas.requestRenderAll();
    } finally {
      this.suspended = false;
      this.onChange?.();
    }
  }
}

/**
 * Re-applies the per-object flags Fabric does not serialize: lock transforms,
 * background passivity and render caching. Also used when loading a saved
 * document, which is the same round-trip.
 */
export function rehydrateScene(canvas: Canvas) {
  canvas.getObjects().forEach((object) => {
    const meta = getMeta(object);
    if (!meta) return;

    object.set({ objectCaching: false });

    if (meta.kind === "background") {
      object.set({ selectable: false, evented: false, hoverCursor: "default" });
    } else if (meta.locked) {
      applyLock(object, true);
    }
  });
}
