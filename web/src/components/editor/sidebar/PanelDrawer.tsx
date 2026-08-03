"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/store/uiStore";
import { PANEL_MAP } from "./panelConfig";
import { TextPanel } from "./panels/TextPanel";
import { ShapesPanel } from "./panels/ShapesPanel";
import { IconsPanel } from "./panels/IconsPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { UploadsPanel } from "./panels/UploadsPanel";
import { BackgroundPanel } from "./panels/BackgroundPanel";
import { QrPanel } from "./panels/QrPanel";

/**
 * Drawer beside the rail. Panels are registered here as their features land;
 * the rest state what will live in them.
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
        {activePanel === "text" ? (
          <TextPanel />
        ) : activePanel === "shapes" ? (
          <ShapesPanel />
        ) : activePanel === "icons" ? (
          <IconsPanel />
        ) : activePanel === "layers" ? (
          <LayersPanel />
        ) : activePanel === "uploads" ? (
          <UploadsPanel />
        ) : activePanel === "background" ? (
          <BackgroundPanel />
        ) : activePanel === "qr" ? (
          <QrPanel />
        ) : (
          <p className="rounded-lg bg-panel-muted p-3 text-sm leading-relaxed text-ink-500">
            {summary}
          </p>
        )}
      </div>
    </aside>
  );
}
