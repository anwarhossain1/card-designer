"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/store/uiStore";
import { PANEL_MAP } from "./panelConfig";

/**
 * Drawer beside the rail. Each panel's real content arrives with its own
 * feature; until then the drawer states what will live here.
 */
export function PanelDrawer() {
  const activePanel = useUiStore((state) => state.activePanel);
  const closePanel = useUiStore((state) => state.closePanel);

  if (!activePanel) return null;

  const panel = PANEL_MAP.get(activePanel);
  if (!panel) return null;

  const { icon: Icon, label, summary } = panel;

  return (
    <aside
      aria-label={`${label} panel`}
      className="flex w-72 shrink-0 flex-col border-r border-hairline bg-panel"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Icon className="h-4 w-4 text-ink-500" />
          {label}
        </h2>
        <IconButton size="sm" label="Close panel" onClick={closePanel}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <p className="rounded-lg bg-panel-muted p-3 text-sm leading-relaxed text-ink-500">
          {summary}
        </p>
      </div>
    </aside>
  );
}
