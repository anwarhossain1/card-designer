"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { useDeleteTemplate, useUpdateTemplate } from "@/hooks/useAdmin";
import type { TemplateRecord } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/time";
import type { TemplateCategory } from "@/types/template";

const CATEGORIES: TemplateCategory[] = ["modern", "minimal", "corporate", "creative", "luxury"];

export const INPUT =
  "w-full rounded-md border border-hairline bg-panel px-2.5 py-1.5 text-sm text-ink-800 outline-none focus:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100";

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function EditForm({ template, onDone }: { template: TemplateRecord; onDone: () => void }) {
  const t = useI18n().t.admin;
  const update = useUpdateTemplate();
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [description, setDescription] = useState(template.description);
  const [tags, setTags] = useState(template.tags.join(", "));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(
      {
        slug: template.slug,
        changes: {
          name: name.trim(),
          category,
          description: description.trim(),
          tags: [...new Set(tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
        },
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-2.5 border-t border-hairline pt-3">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-600">{t.templates.fields.name}</span>
        <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-600">{t.templates.fields.category}</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as TemplateCategory)} className={INPUT}>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>{t.templates.categories[value]}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-600">{t.templates.fields.description}</span>
        <textarea rows={2} maxLength={240} value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-600">{t.templates.fields.tags}</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t.templates.fields.tagsHint} className={INPUT} />
      </label>
      {update.error ? <p role="alert" className="text-xs text-danger-ink">{errorText(update.error)}</p> : null}
      <div className="flex gap-1.5">
        <Button size="sm" type="submit" disabled={update.isPending}>
          {update.isPending ? t.common.saving : t.common.save}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onDone}>
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
}

export function TemplateItem({ template }: { template: TemplateRecord }) {
  const { t, locale } = useI18n();
  const copy = t.admin.templates;
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const update = useUpdateTemplate();
  const remove = useDeleteTemplate();
  const isBusy = update.isPending || remove.isPending;
  const error = update.error ?? remove.error;

  return (
    <li className="rounded-xl border border-hairline bg-panel p-3">
      <div className="aspect-[3.5/2] w-full overflow-hidden rounded-md bg-panel-muted">
        {template.thumbnail ? (
          // A data URL the editor rendered when the template was saved.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-ink-400">{copy.noPreview}</span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{template.name}</p>
          <p className="truncate font-mono text-[11px] text-ink-400">{template.slug}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
            template.published ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600",
          )}
        >
          {template.published ? copy.live : copy.draft}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        {copy.categories[template.category]} · {copy.updated(formatRelativeTime(template.updatedAt, locale))}
      </p>

      {mode === "edit" ? (
        <EditForm template={template} onDone={() => setMode("view")} />
      ) : mode === "confirm-delete" ? (
        <div className="mt-3 space-y-2 border-t border-hairline pt-3">
          <p className="text-xs text-ink-700">{copy.confirmRemove(template.name)}</p>
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => remove.mutate(template.slug)} disabled={isBusy}>
              {t.admin.users.confirm}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode("view")}>
              {t.admin.common.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={template.published ? "outline" : "primary"}
            disabled={isBusy}
            onClick={() => update.mutate({ slug: template.slug, changes: { published: !template.published } })}
          >
            {template.published ? copy.unpublish : copy.publish}
          </Button>
          <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => setMode("edit")}>
            {copy.edit}
          </Button>
          <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => setMode("confirm-delete")}>
            {copy.remove}
          </Button>
          {isBusy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin text-ink-400" /> : null}
        </div>
      )}

      {error && mode !== "edit" ? (
        <p role="alert" className="mt-2 text-xs text-danger-ink">{errorText(error)}</p>
      ) : null}
    </li>
  );
}
