"use client";

import dynamic from "next/dynamic";

/**
 * The editor is client-only: Fabric touches `window` and `document` at import
 * time, and there is nothing meaningful to prerender for a canvas.
 */
const EditorShell = dynamic(
  () => import("./EditorShell").then((mod) => mod.EditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-screen place-items-center bg-workspace text-sm text-ink-400">
        Loading editor…
      </div>
    ),
  },
);

export function EditorClient() {
  return <EditorShell />;
}
