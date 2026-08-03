"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Download,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { useEditorStore } from "@/store/editorStore";
import { useCanvas } from "../canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";

/**
 * Top bar. Undo/redo and clipboard render disabled until the history feature
 * lands — better an honest disabled control than one that silently does
 * nothing.
 */
export function Toolbar() {
  const documentName = useEditorStore((state) => state.documentName);
  const setDocumentName = useEditorStore((state) => state.setDocumentName);
  const { selected } = useCanvas();
  const { remove, duplicate } = useCanvasActions();

  const hasSelection = selected.length > 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-panel px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex h-9 items-center gap-1 rounded-md pl-1 pr-2 text-sm text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          <ChevronLeft className="h-4 w-4" />
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-accent-500 text-[11px] font-bold text-white"
          >
            C
          </span>
        </Link>

        <input
          value={documentName}
          onChange={(event) => setDocumentName(event.target.value)}
          aria-label="Design name"
          spellCheck={false}
          className="h-9 w-52 truncate rounded-md border border-transparent px-2 text-sm font-medium text-ink-800 outline-none transition-colors hover:border-hairline focus:border-brand-400 focus:bg-panel"
        />
      </div>

      <div className="flex items-center gap-0.5">
        <IconButton label="Undo (Ctrl+Z)" disabled>
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo (Ctrl+Y)" disabled>
          <Redo2 className="h-4 w-4" />
        </IconButton>

        <span aria-hidden className="mx-1.5 h-5 w-px bg-hairline" />

        <IconButton label="Copy (Ctrl+C)" disabled>
          <Copy className="h-4 w-4" />
        </IconButton>
        <IconButton label="Paste (Ctrl+V)" disabled>
          <ClipboardPaste className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Duplicate (Ctrl+D)"
          disabled={!hasSelection}
          onClick={() => void duplicate()}
        >
          <CopyPlus className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Delete (Del)"
          disabled={!hasSelection}
          onClick={remove}
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </header>
  );
}
