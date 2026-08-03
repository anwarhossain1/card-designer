"use client";

import type { ShapeVariant } from "@/types/element";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useT } from "@/components/i18n/I18nProvider";

/** Preview markup mirrors what `createShapeElement` produces. */
const PREVIEWS: Record<ShapeVariant, React.ReactNode> = {
  rect: <rect x="6" y="14" width="36" height="20" />,
  roundedRect: <rect x="6" y="14" width="36" height="20" rx="6" />,
  circle: <circle cx="24" cy="24" r="13" />,
  triangle: <polygon points="24,10 39,37 9,37" />,
  line: <rect x="6" y="23" width="36" height="2.5" rx="1.25" />,
};

const ORDER: ShapeVariant[] = [
  "rect",
  "roundedRect",
  "circle",
  "triangle",
  "line",
];

export function ShapesPanel() {
  const t = useT().editor.shapes;
  const { addShape } = useCanvasActions();

  return (
    <ul className="grid grid-cols-3 gap-2">
      {ORDER.map((variant) => (
        <li key={variant}>
          <button
            type="button"
            title={t[variant]}
            aria-label={t[variant]}
            data-shape={variant}
            onClick={() => addShape(variant)}
            className="grid aspect-square w-full place-items-center rounded-lg border border-hairline bg-panel text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <svg viewBox="0 0 48 48" fill="currentColor" className="h-9 w-9">
              {PREVIEWS[variant]}
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
