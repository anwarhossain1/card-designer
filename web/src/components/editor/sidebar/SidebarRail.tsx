"use client";

import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/uiStore";
import { PANELS } from "./panelConfig";

/** The always-visible icon rail that switches the panel drawer. */
export function SidebarRail() {
  const activePanel = useUiStore((state) => state.activePanel);
  const togglePanel = useUiStore((state) => state.togglePanel);

  return (
    <nav
      aria-label="Editor tools"
      className="flex w-[72px] shrink-0 flex-col gap-1 border-r border-hairline bg-panel px-2 py-3"
    >
      {PANELS.map(({ id, label, icon: Icon }) => {
        const isActive = activePanel === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => togglePanel(id)}
            aria-pressed={isActive}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium",
              "transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-brand-400",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-500 hover:bg-ink-100 hover:text-ink-800",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
