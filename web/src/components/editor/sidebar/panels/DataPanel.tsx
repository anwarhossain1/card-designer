"use client";

import { useState, type FormEvent } from "react";
import { Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/I18nProvider";
import { useCanvasActions } from "@/hooks/useCanvasActions";

/** Slots a school roster almost always has; one tap instead of typing. */
const QUICK_KEYS = ["name", "roll", "class", "phone", "email"] as const;

/**
 * Data fields: text elements bound to roster columns.
 *
 * A field renders on the canvas as `{{key}}` in real, styleable text — the
 * batch wizard swaps the value in per row. Template elements with semantic
 * roles (name, phone…) are already bindable without any of this; the panel
 * exists for the columns templates don't know about, like roll and class.
 */
export function DataPanel() {
  const t = useT().editor.data;
  const { addDataField, addDataQr } = useCanvasActions();
  const [key, setKey] = useState("");

  const normalized = key.trim().replace(/\s+/g, "_").toLowerCase();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!normalized) return;
    void addDataField(normalized);
    setKey("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-ink-500">{t.intro}</p>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_KEYS.map((quick) => (
          <button
            key={quick}
            type="button"
            onClick={() => void addDataField(quick)}
            className="rounded-full border border-hairline bg-panel px-2.5 py-1 font-mono text-[11px] text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            {`{{${quick}}}`}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-2">
        <label
          htmlFor="data-field-key"
          className="block text-xs font-medium text-ink-700"
        >
          {t.customLabel}
        </label>
        <div className="flex gap-2">
          <input
            id="data-field-key"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder={t.customPlaceholder}
            className="h-9 w-full min-w-0 rounded-md border border-hairline bg-panel px-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-2 focus-visible:outline-brand-400"
          />
          <Button type="submit" size="sm" disabled={!normalized}>
            <Plus className="h-4 w-4" />
            {t.add}
          </Button>
        </div>
      </form>

      <div className="border-t border-hairline pt-3">
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          disabled={!normalized}
          onClick={() => {
            void addDataQr(normalized);
            setKey("");
          }}
        >
          <QrCode className="h-4 w-4" />
          {t.addQr}
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
          {t.qrHint}
        </p>
      </div>

      <p className="rounded-md bg-ink-100 px-3 py-2 text-[11px] leading-relaxed text-ink-500">
        {t.generateHint}
      </p>
    </div>
  );
}
