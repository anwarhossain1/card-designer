"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Canvas } from "fabric";
import { fetchDesign, listDesigns, saveDesign } from "@/lib/api/designs";
import { applyDocument } from "@/lib/document/applyDocument";
import {
  getSideScene,
  isSceneEmpty,
  normalizeSides,
} from "@/lib/document/sides";
import {
  clearDocument,
  loadDocument,
  saveDocument,
} from "@/lib/storage/documentStorage";
import { renderThumbnail } from "@/lib/thumbnail";
import { useEditorStore } from "@/store/editorStore";
import type { CardDocument, CardSide } from "@/types/document";
import { useSession } from "./useSession";

/** Longer than the local autosave, so a burst of edits becomes one upload. */
const PUSH_DEBOUNCE_MS = 3000;

/** `?design=new` opens a blank card instead of fetching one. */
const NEW_DESIGN = "new";

export type SyncStatus = "idle" | "syncing" | "synced" | "offline";

export interface DesignSyncState {
  syncStatus: SyncStatus;
}

const isNewer = (a: string, b: string) => Date.parse(a) > Date.parse(b);

const isBlank = (doc: CardDocument) =>
  normalizeSides(doc.sides).every((side) => isSceneEmpty(side.scene));

/**
 * A card nobody has drawn on yet does not earn a row on the server.
 *
 * Starting a new design clears the canvas, and clearing it fires the same
 * events an edit does — so the blank card autosaves locally whether or not it
 * was ever touched. Uploading those would fill the designs list, and a guest's
 * ten-card allowance, with nothing.
 *
 * Only skipped before the first upload. A design that has been emptied on
 * purpose is a real change and must still be saved, or deleting everything
 * would silently fail to stick.
 */
const worthUploading = (doc: CardDocument, alreadyPushed: string | null) =>
  alreadyPushed !== null || !isBlank(doc);

const requestedDesign = () =>
  new URLSearchParams(window.location.search).get("design");

/**
 * Drops `?design=` once acted on, so a reload does not switch cards again and
 * a later reconcile does not undo whatever the user has done since.
 */
function forgetRequest(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("design");
  window.history.replaceState(null, "", url.toString());
}

/**
 * Keeps the server copy of the design in step with the local one.
 *
 * LocalStorage stays the real autosave: it is synchronous, so it still lands
 * when a tab closes, and a network that comes and goes never costs anyone the
 * twenty minutes they just spent on a card. The server sits on top as a copy
 * that follows them to the next device.
 *
 * That makes conflicts possible, and they resolve last-write-wins on the
 * document's own `updatedAt`. For one person editing one card that is exactly
 * right; it stops being enough the day two people share a design, which is why
 * the timestamps are the document's rather than the row's.
 *
 * Only the open card lives locally. Switching cards therefore uploads the
 * outgoing one before replacing it — the browser is about to forget it.
 */
export function useDesignSync(
  canvasRef: RefObject<Canvas | null>,
  isHydrated: boolean,
  seedSides: (sides: readonly CardSide[]) => void,
): DesignSyncState {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const timerRef = useRef<number | undefined>(undefined);
  /** The `updatedAt` already uploaded, so an unchanged document is not resent. */
  const pushedRef = useRef<string | null>(null);

  const { user } = useSession();
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);

  /* ------------------------------------------------------------- reconcile */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isHydrated) return;

    let cancelled = false;

    const push = async (local: CardDocument) => {
      if (!worthUploading(local, pushedRef.current)) return;
      const front = getSideScene(normalizeSides(local.sides), "front");
      await saveDesign(local, await renderThumbnail(front));
      pushedRef.current = local.updatedAt;
    };

    const adopt = async (remote: CardDocument) => {
      await applyDocument(canvas, remote, seedSides);
      saveDocument(remote);
      pushedRef.current = remote.updatedAt;
    };

    const startBlank = () => {
      clearDocument();
      canvas.discardActiveObject();
      canvas.remove(...canvas.getObjects());
      canvas.requestRenderAll();
      seedSides([]);
      // A fresh id and creation time. The autosave will still write this blank
      // card locally — clearing the canvas looks like an edit — but
      // worthUploading keeps it off the server until it holds something.
      useEditorStore.getState().reset();
      pushedRef.current = null;
    };

    const reconcile = async () => {
      setSyncStatus("syncing");

      try {
        const local = loadDocument();
        const requested = requestedDesign();

        if (requested && requested !== local?.id) {
          // The outgoing card is about to be replaced locally; bank it first.
          if (local) await push(local);
          if (cancelled) return;

          if (requested === NEW_DESIGN) {
            startBlank();
          } else {
            const remote = await fetchDesign(requested);
            if (cancelled) return;
            if (remote) await adopt(remote);
          }

          forgetRequest();
          if (!cancelled) setSyncStatus("synced");
          return;
        }

        if (requested) forgetRequest();

        if (local) {
          const remote = await fetchDesign(local.id);
          if (cancelled) return;

          if (!remote || isNewer(local.updatedAt, remote.updatedAt)) {
            await push(local);
          } else if (isNewer(remote.updatedAt, local.updatedAt)) {
            await adopt(remote);
          } else {
            pushedRef.current = local.updatedAt;
          }
        } else {
          /*
           * Nothing in this browser, but the account may have designs made
           * elsewhere — this is the path a second device takes. The list is
           * already newest-first, so the most recent card is the one to open.
           */
          const summaries = await listDesigns();
          const newest = summaries[0];
          if (cancelled || !newest) return;

          const remote = await fetchDesign(newest.id);
          if (cancelled || !remote) return;

          await adopt(remote);
        }

        if (!cancelled) setSyncStatus("synced");
      } catch {
        // Unreachable or refused. The card is safe locally either way, and the
        // next local save will try again.
        if (!cancelled) setSyncStatus("offline");
      }
    };

    void reconcile();

    return () => {
      cancelled = true;
    };
  }, [canvasRef, isHydrated, seedSides, user?.id]);

  /* ------------------------------------------------------------------ push */

  useEffect(() => {
    if (!isHydrated || !lastSavedAt) return;

    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const local = loadDocument();
      // Nothing new since the last upload — reconcile may have just sent it.
      if (!local || pushedRef.current === local.updatedAt) return;
      if (!worthUploading(local, pushedRef.current)) return;

      setSyncStatus("syncing");

      void (async () => {
        try {
          const front = getSideScene(normalizeSides(local.sides), "front");
          await saveDesign(local, await renderThumbnail(front));
          pushedRef.current = local.updatedAt;
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      })();
    }, PUSH_DEBOUNCE_MS);

    return () => window.clearTimeout(timerRef.current);
  }, [isHydrated, lastSavedAt]);

  return { syncStatus };
}
