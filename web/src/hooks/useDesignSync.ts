"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Canvas } from "fabric";
import { fetchDesign, listDesigns, saveDesign } from "@/lib/api/designs";
import { applyDocument } from "@/lib/document/applyDocument";
import { loadDocument, saveDocument } from "@/lib/storage/documentStorage";
import { useEditorStore } from "@/store/editorStore";
import type { CardDocument, CardSide } from "@/types/document";
import { useSession } from "./useSession";

/** Longer than the local autosave, so a burst of edits becomes one upload. */
const PUSH_DEBOUNCE_MS = 3000;

export type SyncStatus = "idle" | "syncing" | "synced" | "offline";

export interface DesignSyncState {
  syncStatus: SyncStatus;
}

const isNewer = (a: string, b: string) => Date.parse(a) > Date.parse(b);

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

  /*
   * Runs once the local copy is on the canvas, and again when the identity
   * changes: signing in has just handed this browser's designs to an account,
   * and signing out takes them away again.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isHydrated) return;

    let cancelled = false;

    const adopt = async (remote: CardDocument) => {
      await applyDocument(canvas, remote, seedSides);
      saveDocument(remote);
      pushedRef.current = remote.updatedAt;
    };

    const push = async (local: CardDocument) => {
      await saveDesign(local);
      pushedRef.current = local.updatedAt;
    };

    const reconcile = async () => {
      setSyncStatus("syncing");

      try {
        const local = loadDocument();

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

      setSyncStatus("syncing");
      saveDesign(local)
        .then(() => {
          pushedRef.current = local.updatedAt;
          setSyncStatus("synced");
        })
        .catch(() => setSyncStatus("offline"));
    }, PUSH_DEBOUNCE_MS);

    return () => window.clearTimeout(timerRef.current);
  }, [isHydrated, lastSavedAt]);

  return { syncStatus };
}
