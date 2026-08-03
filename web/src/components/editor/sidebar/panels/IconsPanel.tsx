"use client";

import { ICONS, type IconDefinition, type IconGroup } from "@/lib/icons/registry";
import { useCanvasActions } from "@/hooks/useCanvasActions";

const GROUPS: { id: IconGroup; title: string }[] = [
  { id: "contact", title: "Contact" },
  { id: "social", title: "Social" },
];

function IconButton({ icon }: { icon: IconDefinition }) {
  const { addIcon } = useCanvasActions();

  return (
    <button
      type="button"
      title={icon.label}
      aria-label={icon.label}
      onClick={() => void addIcon(icon.id)}
      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-hairline bg-panel text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-400"
    >
      {/* Same markup the canvas element is built from. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        dangerouslySetInnerHTML={{ __html: icon.body }}
      />
      <span className="text-[10px] text-ink-500">{icon.label}</span>
    </button>
  );
}

export function IconsPanel() {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <section key={group.id}>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
            {group.title}
          </h3>
          <ul className="grid grid-cols-3 gap-2">
            {ICONS.filter((icon) => icon.group === group.id).map((icon) => (
              <li key={icon.id}>
                <IconButton icon={icon} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
