import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor",
};

/** Placeholder — the editor shell is built in a later step. */
export default function EditorPage() {
  return (
    <main
      data-editor-root
      className="flex h-screen items-center justify-center bg-workspace text-ink-500"
    >
      Editor shell coming next.
    </main>
  );
}
