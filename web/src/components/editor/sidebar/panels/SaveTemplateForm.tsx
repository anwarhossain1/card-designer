"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useT } from "@/components/i18n/I18nProvider";
import { ADMIN_TEMPLATE_KEYS } from "@/hooks/useAdmin";
import { createTemplate } from "@/lib/api/admin";
import { collectFontFamilies } from "@/lib/canvas/persistence";
import { getSideScene, isSceneEmpty } from "@/lib/document/sides";
import { TEMPLATE_MAP } from "@/lib/templates";
import { renderThumbnail } from "@/lib/thumbnail";
import { useEditorStore } from "@/store/editorStore";
import type { TemplateCategory } from "@/types/template";

const CATEGORIES: TemplateCategory[] = ["modern", "minimal", "corporate", "creative", "luxury"];

const INPUT =
  "w-full rounded-md border border-hairline bg-panel px-2 py-1.5 text-xs text-ink-800 outline-none focus:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100";

/** "Rahman & Co. Gold" → "rahman-co-gold". Non-Latin names leave it to the admin. */
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * Turns the card on the canvas into a draft template. Admin-only: the panel
 * shows it only to admins, and the API refuses anyone else.
 *
 * Both sides are saved in the same `{ id, scene }` form autosave writes, so a
 * template is exactly a card someone designed — no separate authoring format.
 */
export function SaveTemplateForm() {
  const dictionary = useT();
  const t = dictionary.editor.templates.save;
  const categories = dictionary.admin.templates.categories;
  const { collectSides } = useCanvas();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState<TemplateCategory>("modern");
  const [description, setDescription] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const sides = collectSides();
      const front = getSideScene(sides, "front");
      if (isSceneEmpty(front)) throw new Error(t.empty);
      // The server refuses these too, but only with a generic "Validation failed".
      if (TEMPLATE_MAP.has(slug)) throw new Error(t.slugReserved);

      const fonts = [...new Set(sides.flatMap((side) => (side.scene ? collectFontFamilies(side.scene) : [])))];

      return createTemplate({
        slug,
        name: name.trim(),
        category,
        description: description.trim(),
        fonts,
        // An untouched back is left out rather than saved as a blank one.
        sides: sides.filter((side) => side.id === "front" || !isSceneEmpty(side.scene)),
        thumbnail: await renderThumbnail(front),
      });
    },
    onSuccess: (template) => {
      setSavedName(template.name);
      setIsOpen(false);
      ADMIN_TEMPLATE_KEYS.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }));
    },
  });

  const open = () => {
    const documentName = useEditorStore.getState().documentName;
    setName(documentName);
    setSlug(toSlug(documentName));
    setSlugTouched(false);
    setDescription("");
    setSavedName(null);
    save.reset();
    setIsOpen(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  if (!isOpen) {
    return (
      <div className="space-y-2">
        {savedName ? (
          <p role="status" className="flex items-start gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-[11px] leading-relaxed text-brand-700">
            <CheckCircle2 aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              {t.saved(savedName)}{" "}
              <Link href="/admin/templates" className="font-medium underline">
                {t.manage}
              </Link>
            </span>
          </p>
        ) : null}
        <Button size="sm" variant="outline" className="w-full" onClick={open}>
          <BookmarkPlus className="h-4 w-4" />
          {t.open}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5 rounded-lg border border-hairline bg-panel p-3">
      <div>
        <h3 className="text-xs font-semibold text-ink-900">{t.title}</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{t.hint}</p>
      </div>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-ink-600">{t.name}</span>
        <input
          required
          maxLength={80}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugTouched) setSlug(toSlug(event.target.value));
          }}
          className={INPUT}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-ink-600">{t.slug}</span>
        <input
          required
          minLength={3}
          maxLength={60}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value.toLowerCase());
          }}
          className={`${INPUT} font-mono`}
        />
        <span className="block text-[10px] text-ink-400">{t.slugHint}</span>
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-ink-600">{t.category}</span>
        <select value={category} onChange={(event) => setCategory(event.target.value as TemplateCategory)} className={INPUT}>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>{categories[value]}</option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-[11px] font-medium text-ink-600">{t.description}</span>
        <textarea rows={2} maxLength={240} value={description} onChange={(event) => setDescription(event.target.value)} className={INPUT} />
      </label>

      {save.error ? (
        <p role="alert" className="text-[11px] text-danger-ink">
          {save.error.message}
        </p>
      ) : null}

      <div className="flex gap-1.5">
        <Button size="sm" type="submit" disabled={save.isPending} className="flex-1">
          {save.isPending ? t.saving : t.submit}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setIsOpen(false)}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
