"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Loader2 } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { useAdminTemplates } from "@/hooks/useAdmin";
import type { TemplateListQuery } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { INPUT, TemplateItem } from "./TemplateItem";

type Status = TemplateListQuery["status"];

export function TemplatesScreen() {
  const t = useT().admin;
  const copy = t.templates;
  const [status, setStatus] = useState<Status>("all");
  const [search, setSearch] = useState("");

  const { data, isPending, isError, refetch } = useAdminTemplates({
    status,
    search: search.trim() || undefined,
  });

  const tabs: { value: Status; label: string }[] = [
    { value: "all", label: copy.all },
    { value: "published", label: copy.published },
    { value: "draft", label: copy.drafts },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-ink-900">{copy.title}</h1>
        {data ? <p className="text-sm text-ink-500">{copy.count(data.length)}</p> : null}
      </div>

      {/* Templates are made by designing, not by filling in a form. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-hairline bg-panel px-3 py-2.5 text-sm text-ink-600">
        <Info aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />
        <p className="min-w-0 flex-1 basis-64">{copy.howToCreate}</p>
        <Link href="/editor" className="shrink-0">
          <Button size="sm" variant="outline">{copy.openEditor}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" className="flex rounded-md bg-panel-muted p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "rounded-[5px] px-3 py-1.5 text-sm transition-colors",
                status === tab.value ? "bg-panel font-medium text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="min-w-0 flex-1 basis-56">
          <span className="sr-only">{copy.search}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
            className={INPUT}
          />
        </label>
      </div>

      {isPending ? (
        <p className="flex items-center gap-2 text-sm text-ink-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.common.loading}
        </p>
      ) : isError ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-danger-ink">{t.common.failed}</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            {t.common.retry}
          </Button>
        </div>
      ) : data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline bg-panel px-6 py-10 text-center text-sm text-ink-500">
          {copy.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((template) => (
            <TemplateItem key={template.slug} template={template} />
          ))}
        </ul>
      )}
    </div>
  );
}
