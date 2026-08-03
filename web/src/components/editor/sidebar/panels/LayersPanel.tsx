"use client";

import { useLayerDrag } from "@/hooks/useLayerDrag";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Layers,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useLayers } from "@/hooks/useLayers";
import { useT } from "@/components/i18n/I18nProvider";
import type { MoveDirection } from "@/lib/canvas/layers";
import { LayerRow } from "./LayerRow";

const MOVE_ACTIONS: { direction: MoveDirection; icon: typeof ArrowUp }[] = [
  { direction: "front", icon: ArrowUpToLine },
  { direction: "forward", icon: ArrowUp },
  { direction: "backward", icon: ArrowDown },
  { direction: "back", icon: ArrowDownToLine },
];

const MOVE_LABEL_KEY = {
  front: "bringFront",
  forward: "bringForward",
  backward: "sendBackward",
  back: "sendBack",
} as const;

export function LayersPanel() {
  const t = useT().editor.layers;
  const {
    layers,
    selectedIds,
    select,
    toggleLock,
    toggleVisibility,
    move,
    reorder,
    duplicateLayer,
    deleteLayer,
  } = useLayers();

  const { fromIndex, overIndex, startDrag } = useLayerDrag(reorder);

  const activeId = layers.find((layer) => selectedIds.has(layer.id))?.id ?? null;

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-panel-muted px-4 py-10 text-center">
        <Layers className="h-6 w-6 text-ink-300" />
        <p className="text-sm text-ink-500">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-0.5 rounded-lg bg-panel-muted p-1">
        {MOVE_ACTIONS.map(({ direction, icon: Icon }) => (
          <IconButton
            key={direction}
            size="sm"
            label={t[MOVE_LABEL_KEY[direction]]}
            disabled={!activeId}
            onClick={() => activeId && move(activeId, direction)}
          >
            <Icon className="h-4 w-4" />
          </IconButton>
        ))}
        <span className="ml-auto pr-1 text-[11px] text-ink-400">
          {t.count(layers.length)}
        </span>
      </div>

      <ul className="space-y-0.5">
        {layers.map((layer, position) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            position={position}
            isSelected={selectedIds.has(layer.id)}
            isDropTarget={overIndex === position && fromIndex !== position}
            isDragging={fromIndex === position}
            onSelect={select}
            onToggleLock={toggleLock}
            onToggleVisibility={toggleVisibility}
            onDuplicate={(id) => void duplicateLayer(id)}
            onDelete={deleteLayer}
            onDragStart={startDrag}
          />
        ))}
      </ul>

      <p className="px-1 text-[11px] leading-relaxed text-ink-400">
        {t.dragHint}
      </p>
    </div>
  );
}
