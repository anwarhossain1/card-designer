"use client";

import Link from "next/link";
import { ChevronLeft, Redo2, Undo2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { DownloadMenu } from "@/components/editor/toolbar/DownloadMenu";
import { SaveStatus } from "@/components/editor/toolbar/SaveStatus";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useEditorStore } from "@/store/editorStore";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * Phone top bar: navigation, history and export only. Element actions live in
 * the bottom bar, within thumb reach.
 */
export function MobileTopBar() {
  const t = useT().editor.toolbar;
  const documentName = useEditorStore((state) => state.documentName);
  const setDocumentName = useEditorStore((state) => state.setDocumentName);
  const { undo, redo, canUndo, canRedo } = useCanvas();

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-hairline bg-panel px-2">
      <Link
        href="/"
        aria-label={t.back}
        className="grid h-11 w-9 shrink-0 place-items-center rounded-md text-ink-600 active:bg-ink-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <input
        value={documentName}
        onChange={(event) => setDocumentName(event.target.value)}
        aria-label={t.designName}
        spellCheck={false}
        className="h-11 min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-ink-800 outline-none focus:border-brand-400"
      />

      <SaveStatus compact />

      <IconButton
        label={t.undo}
        disabled={!canUndo}
        onClick={() => void undo()}
        className="h-11 w-10 shrink-0"
      >
        <Undo2 className="h-5 w-5" />
      </IconButton>
      <IconButton
        label={t.redo}
        disabled={!canRedo}
        onClick={() => void redo()}
        className="h-11 w-10 shrink-0"
      >
        <Redo2 className="h-5 w-5" />
      </IconButton>

      <DownloadMenu />
    </header>
  );
}
