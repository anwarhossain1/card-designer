"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Layers,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useLayers } from "@/hooks/useLayers";
import type { MoveDirection } from "@/lib/canvas/layers";
import { LayerRow } from "./LayerRow";

const MOVE_ACTIONS: {
  direction: MoveDirection;
  label: string;
  icon: typeof ArrowUp;
}[] = [
  { direction: "front", label: "Bring to front", icon: ArrowUpToLine },
  { direction: "forward", label: "Bring forward", icon: ArrowUp },
  { direction: "backward", label: "Send backward", icon: ArrowDown },
  { direction: "back", label: "Send to back", icon: ArrowDownToLine },
];

export function LayersPanel() {
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

  /*
   * The drag origin lives in a ref, not state: dragstart and drop can land in
   * the same commit, and a state value would still read null on drop.
   */
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const activeId = layers.find((layer) => selectedIds.has(layer.id))?.id ?? null;

  const handleDragOver = (event: DragEvent, position: number) => {
    event.preventDefault();
    setDragOver(position);
  };

  const endDrag = () => {
    dragFrom.current = null;
    setDragOver(null);
  };

  const handleDrop = (position: number) => {
    if (dragFrom.current !== null) reorder(dragFrom.current, position);
    endDrag();
  };

  if (layers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-panel-muted px-4 py-10 text-center">
        <Layers className="h-6 w-6 text-ink-300" />
        <p className="text-sm text-ink-500">
          Nothing on the card yet. Add text, a shape or an icon and it will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-0.5 rounded-lg bg-panel-muted p-1">
        {MOVE_ACTIONS.map(({ direction, label, icon: Icon }) => (
          <IconButton
            key={direction}
            size="sm"
            label={label}
            disabled={!activeId}
            onClick={() => activeId && move(activeId, direction)}
          >
            <Icon className="h-4 w-4" />
          </IconButton>
        ))}
        <span className="ml-auto pr-1 text-[11px] text-ink-400">
          {layers.length} layer{layers.length > 1 ? "s" : ""}
        </span>
      </div>

      <ul className="space-y-0.5">
        {layers.map((layer, position) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            position={position}
            isSelected={selectedIds.has(layer.id)}
            isDropTarget={dragOver === position && dragFrom.current !== position}
            onSelect={select}
            onToggleLock={toggleLock}
            onToggleVisibility={toggleVisibility}
            onDuplicate={(id) => void duplicateLayer(id)}
            onDelete={deleteLayer}
            onDragStart={(origin) => {
              dragFrom.current = origin;
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={endDrag}
          />
        ))}
      </ul>

      <p className="px-1 text-[11px] leading-relaxed text-ink-400">
        Drag a layer to reorder. The top of this list is the front of the card.
      </p>
    </div>
  );
}
