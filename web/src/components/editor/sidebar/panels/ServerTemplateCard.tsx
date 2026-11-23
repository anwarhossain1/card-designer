"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { useApplyServerTemplate } from "@/hooks/useServerTemplates";
import type { ServerTemplate } from "@/lib/api/templates";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/store/editorStore";

/**
 * An admin-made template in the picker. Its preview is the thumbnail saved
 * with it, so the list costs no scenes; the full template is fetched only
 * when picked.
 */
export function ServerTemplateCard({ template }: { template: ServerTemplate }) {
  const t = useT().editor.templates;
  const applyServerTemplate = useApplyServerTemplate();
  const activeTemplateId = useEditorStore((state) => state.templateId);
  const [state, setState] = useState<"idle" | "applying" | "failed">("idle");

  const isActive = activeTemplateId === template.slug;

  const pick = async () => {
    setState("applying");
    try {
      setState((await applyServerTemplate(template.slug)) ? "idle" : "failed");
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void pick()}
      disabled={state === "applying"}
      className={cn(
        "w-full rounded-lg border bg-panel p-2 text-left transition-colors",
        "hover:border-brand-300 focus-visible:outline-2 focus-visible:outline-brand-400",
        isActive ? "border-brand-400 ring-1 ring-brand-200" : "border-hairline",
      )}
    >
      <span className="relative block aspect-[3.5/2] w-full overflow-hidden rounded-md bg-panel-muted">
        {template.thumbnail ? (
          // A data URL rendered by the editor when the template was saved.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail}
            alt={`${template.name} template preview`}
            className="h-full w-full object-cover"
          />
        ) : null}
        {state === "applying" ? (
          <span className="absolute inset-0 grid place-items-center bg-panel/60">
            <Loader2 aria-hidden className="h-5 w-5 animate-spin text-ink-500" />
          </span>
        ) : null}
      </span>
      <span className="mt-2 block text-xs font-semibold text-ink-800">
        {template.name}
        {isActive ? (
          <span className="ml-1.5 font-normal text-brand-600">· {t.inUse}</span>
        ) : null}
      </span>
      {template.description ? (
        <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
          {template.description}
        </span>
      ) : null}
      {state === "failed" ? (
        <span role="alert" className="mt-1 block text-[11px] text-danger-ink">
          {t.applyFailed}
        </span>
      ) : null}
    </button>
  );
}
