"use client";

import type { DragEvent } from "react";
import {
  CopyPlus,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Lock,
  QrCode,
  Shapes,
  Smile,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/components/i18n/I18nProvider";
import type { LayerItem } from "@/lib/canvas/layers";
import type { ElementKind } from "@/types/element";

const KIND_ICON: Record<ElementKind, LucideIcon> = {
  text: Type,
  shape: Shapes,
  icon: Smile,
  image: ImageIcon,
  qr: QrCode,
  group: Shapes,
  background: ImageIcon,
};

export interface LayerRowProps {
  layer: LayerItem;
  position: number;
  isSelected: boolean;
  isDropTarget: boolean;
  onSelect: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (position: number) => void;
  onDragOver: (event: DragEvent, position: number) => void;
  onDrop: (position: number) => void;
  onDragEnd: () => void;
}

export function LayerRow({
  layer,
  position,
  isSelected,
  isDropTarget,
  onSelect,
  onToggleLock,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: LayerRowProps) {
  const t = useT().editor.layers;
  const Icon = KIND_ICON[layer.kind];

  return (
    <li
      draggable
      onDragStart={() => onDragStart(position)}
      onDragOver={(event) => onDragOver(event, position)}
      onDrop={() => onDrop(position)}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition-colors",
        isSelected
          ? "border-brand-200 bg-brand-50"
          : "border-transparent hover:bg-ink-50",
        isDropTarget && "border-brand-400 border-dashed",
        !layer.visible && "opacity-55",
      )}
    >
      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-300" />

      <button
        type="button"
        onClick={() => onSelect(layer.id)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
      >
        <Icon className="h-4 w-4 shrink-0 text-ink-400" />
        <span className="truncate text-xs text-ink-800">{layer.name}</span>
      </button>

      <span className="flex shrink-0 items-center">
        <IconButton
          size="sm"
          label={layer.visible ? t.hide : t.show}
          onClick={() => onToggleVisibility(layer.id)}
          className={cn(!layer.visible && "text-brand-600")}
        >
          {layer.visible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </IconButton>

        <IconButton
          size="sm"
          label={layer.locked ? t.unlock : t.lock}
          onClick={() => onToggleLock(layer.id)}
          className={cn(layer.locked && "text-brand-600")}
        >
          {layer.locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Unlock className="h-3.5 w-3.5" />
          )}
        </IconButton>

        <span className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <IconButton
            size="sm"
            label={t.duplicate}
            disabled={layer.locked}
            onClick={() => onDuplicate(layer.id)}
          >
            <CopyPlus className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            size="sm"
            label={t.delete}
            disabled={layer.locked}
            onClick={() => onDelete(layer.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </span>
      </span>
    </li>
  );
}
