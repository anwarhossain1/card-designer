"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/store/uiStore";
import { useT } from "@/components/i18n/I18nProvider";
import { PANEL_MAP } from "./panelConfig";
import { PANEL_CONTENT } from "./panelContent";

/** Drawer beside the rail; each tool renders its own panel body. */
export function PanelDrawer() {
  const t = useT().editor.panels;
  const activePanel = useUiStore((state) => state.activePanel);
  const closePanel = useUiStore((state) => state.closePanel);

  if (!activePanel) return null;

  const panel = PANEL_MAP.get(activePanel);
  if (!panel) return null;

  const { icon: Icon } = panel;
  const Content = PANEL_CONTENT[activePanel];
  const label = t[activePanel];

  return (
    <aside
      aria-label={label}
      /* Stable hook for tests; the label itself is translated. */
      data-panel={activePanel}
      className="flex w-72 shrink-0 flex-col border-r border-hairline bg-panel"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-hairline px-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Icon className="h-4 w-4 text-ink-500" />
          {label}
        </h2>
        <IconButton size="sm" label={t.close} onClick={closePanel}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <Content />
      </div>
    </aside>
  );
}
