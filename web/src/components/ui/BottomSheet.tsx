"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Drag further than this and the sheet dismisses instead of snapping back. */
const DISMISS_THRESHOLD = 96;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Share of the viewport the sheet may occupy. */
  maxHeight?: string;
}

/**
 * Mobile panel container.
 *
 * Hand-rolled rather than pulled from a library: the only behaviour needed is
 * drag-to-dismiss with a snap-back, and pointer events give that in a few
 * lines while working for touch, pen and mouse alike.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = "72dvh",
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setDragY(0);
  }, [open]);

  if (!open) return null;

  const endDrag = () => {
    if (startY.current === null) return;
    startY.current = null;

    if (dragY > DISMISS_THRESHOLD) onClose();
    else setDragY(0);
  };

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-bottom-sheet
        style={{
          transform: `translateY(${dragY}px)`,
          maxHeight,
          transition: startY.current === null ? "transform 180ms ease-out" : "none",
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-hairline",
          "bg-panel shadow-pop",
          /* Clear the home indicator on gesture-nav phones. */
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <div
          onPointerDown={(event) => {
            startY.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (startY.current === null) return;
            setDragY(Math.max(0, event.clientY - startY.current));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 px-4 pb-2 pt-3 active:cursor-grabbing"
        >
          <span aria-hidden className="h-1 w-10 rounded-full bg-ink-200" />
          <h2 className="w-full text-center text-sm font-semibold text-ink-800">
            {title}
          </h2>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {children}
        </div>
      </div>
    </>
  );
}
