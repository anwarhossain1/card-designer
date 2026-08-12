"use client";

import type { ReactNode } from "react";
import { Check, CloudOff, CloudUpload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/components/i18n/I18nProvider";
import { useEditorStore } from "@/store/editorStore";
import { useCanvas } from "../canvas/CanvasProvider";

interface Report {
  icon: ReactNode;
  label: string;
}

/**
 * One line of status for two layers of storage.
 *
 * The local save is what actually protects the work, so it is reported first:
 * until the card is safe on this device nothing else is worth saying. Only
 * after that does the label move on to whether the server copy has caught up —
 * and "saved on this device" is deliberately reassuring rather than an error,
 * because a failed upload has lost nobody anything.
 */
export function SaveStatus({ compact = false }: { compact?: boolean }) {
  const t = useT().editor.toolbar;
  const isDirty = useEditorStore((state) => state.isDirty);
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);
  const { syncStatus } = useCanvas();

  const iconClass = compact ? "h-4 w-4" : "h-3.5 w-3.5";

  const report = ((): Report | null => {
    if (isDirty) {
      return {
        icon: <CloudUpload className={cn(iconClass, "animate-pulse")} />,
        label: t.saving,
      };
    }
    if (syncStatus === "syncing") {
      return {
        icon: <RefreshCw className={cn(iconClass, "animate-spin")} />,
        label: t.syncing,
      };
    }
    if (syncStatus === "offline") {
      return { icon: <CloudOff className={iconClass} />, label: t.savedOnDevice };
    }
    if (lastSavedAt) {
      return { icon: <Check className={iconClass} />, label: t.saved };
    }
    return null;
  })();

  if (!report) return <span aria-hidden className={compact ? "w-6" : undefined} />;

  return (
    <span
      role="status"
      aria-label={report.label}
      className={cn(
        "shrink-0 items-center gap-1 text-xs text-ink-400",
        compact ? "grid w-6 place-items-center" : "hidden lg:flex",
      )}
    >
      {report.icon}
      {compact ? null : report.label}
    </span>
  );
}
