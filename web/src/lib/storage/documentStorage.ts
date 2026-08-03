import type { CardDocument } from "@/types/document";
import { SCHEMA_VERSION } from "@/config/document";

/**
 * LocalStorage persistence adapter.
 *
 * The MVP keeps one active document. The interface (save/load/clear a
 * `CardDocument`) is what a future API-backed store will implement, so
 * swapping LocalStorage for user accounts touches only this file.
 */
const STORAGE_KEY = "cardcraft.document";
/** Holds a document this build cannot read, so a newer build can recover it. */
const BACKUP_KEY = "cardcraft.document.unreadable";

/**
 * Per-version migrations, applied in order when loading an older document.
 * v1 is the first shipped format, so the map starts empty.
 */
const MIGRATIONS: Record<number, (doc: CardDocument) => CardDocument> = {};

function migrate(doc: CardDocument): CardDocument {
  let current = doc;
  for (let v = doc.schemaVersion; v < SCHEMA_VERSION; v += 1) {
    const step = MIGRATIONS[v];
    if (!step) return current;
    current = { ...step(current), schemaVersion: v + 1 };
  }
  return current;
}

function isCardDocument(value: unknown): value is CardDocument {
  if (typeof value !== "object" || value === null) return false;
  const doc = value as Partial<CardDocument>;
  return (
    typeof doc.id === "string" &&
    typeof doc.schemaVersion === "number" &&
    Array.isArray(doc.sides)
  );
}

export function saveDocument(doc: CardDocument): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    return true;
  } catch {
    // Quota exceeded or storage disabled — the design lives on in memory.
    return false;
  }
}

export function loadDocument(): CardDocument | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isCardDocument(parsed)) return null;

    // Saved by a newer build than this one. Refuse rather than corrupt it, and
    // set it aside so editing here cannot silently destroy the original.
    if (parsed.schemaVersion > SCHEMA_VERSION) {
      localStorage.setItem(BACKUP_KEY, raw);
      return null;
    }

    return migrate(parsed);
  } catch {
    return null;
  }
}

export function clearDocument(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — storage may be unavailable entirely.
  }
}
