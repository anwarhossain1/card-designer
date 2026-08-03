"use client";

import { CopyPlus, MoreHorizontal, SlidersHorizontal, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/uiStore";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useT } from "@/components/i18n/I18nProvider";
import { PANELS } from "@/components/editor/sidebar/panelConfig";

const TAP = "min-h-[56px] min-w-[64px]";

/**
 * Bottom bar, thumb height.
 *
 * With nothing selected it lists the tools; with a selection it swaps to
 * contextual actions, so duplicate and delete are one tap rather than buried
 * in a sheet — the hover-revealed desktop affordances have no touch analogue.
 */
export function MobileToolBar() {
  const t = useT().editor;
  const { selected } = useCanvas();
  const { remove, duplicate, deselect } = useCanvasActions();
  const activePanel = useUiStore((state) => state.activePanel);
  const openPanel = useUiStore((state) => state.openPanel);
  const openSheet = useUiStore((state) => state.openSheet);

  const showTool = (panel: (typeof PANELS)[number]["id"]) => {
    openPanel(panel);
    openSheet("panel");
  };

  if (selected.length > 0) {
    return (
      <nav
        aria-label={t.properties.title}
        className="flex shrink-0 items-stretch justify-around gap-1 border-t border-hairline bg-panel px-2 pb-[env(safe-area-inset-bottom)]"
      >
        <ToolButton
          label={t.mobileUi.editProperties}
          icon={<SlidersHorizontal className="h-5 w-5" />}
          onClick={() => openSheet("properties")}
          active
        />
        <ToolButton
          label={t.toolbar.duplicate.replace(/\s*\(.*\)/, "")}
          icon={<CopyPlus className="h-5 w-5" />}
          onClick={() => void duplicate()}
        />
        <ToolButton
          label={t.toolbar.delete.replace(/\s*\(.*\)/, "")}
          icon={<Trash2 className="h-5 w-5" />}
          onClick={remove}
        />
        <ToolButton
          label={t.mobileUi.closeSheet}
          icon={<X className="h-5 w-5" />}
          onClick={deselect}
        />
      </nav>
    );
  }

  return (
    <nav
      aria-label={t.panels.toolsLabel}
      className="scrollbar-thin flex shrink-0 items-stretch gap-1 overflow-x-auto border-t border-hairline bg-panel px-2 pb-[env(safe-area-inset-bottom)]"
    >
      {PANELS.map(({ id, icon: Icon }) => (
        <ToolButton
          key={id}
          label={t.panels[id]}
          icon={<Icon className="h-5 w-5" />}
          active={activePanel === id}
          onClick={() => showTool(id)}
        />
      ))}
      <ToolButton
        label={t.mobileUi.more}
        icon={<MoreHorizontal className="h-5 w-5" />}
        onClick={() => openSheet("more")}
      />
    </nav>
  );
}

function ToolButton({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        TAP,
        "flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2",
        "text-[11px] font-medium leading-tight transition-colors",
        active ? "text-brand-700" : "text-ink-500 active:bg-ink-100",
      )}
    >
      {icon}
      <span className="max-w-[72px] truncate">{label}</span>
    </button>
  );
}
