"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/inputs";
import { cn } from "@/lib/utils/cn";
import { useCanvas } from "@/components/editor/canvas/CanvasProvider";
import { useT } from "@/components/i18n/I18nProvider";
import { useEditorStore } from "@/store/editorStore";
import { getSideScene, isSceneEmpty } from "@/lib/document/sides";
import {
  DPI_PRESETS,
  exportCard,
  selectSides,
  type ExportFormat,
  type ExportScope,
} from "@/lib/export/exportCard";

const FORMATS: ExportFormat[] = ["png", "jpeg", "pdf"];
const SCOPES: ExportScope[] = ["front", "back", "both"];

export function DownloadMenu() {
  const dictionary = useT().editor;
  const t = dictionary.download;
  const { canvasRef, collectSides } = useCanvas();
  const documentName = useEditorStore((state) => state.documentName);

  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scope, setScope] = useState<ExportScope>("front");
  const [isBackEmpty, setIsBackEmpty] = useState(true);
  const [dpi, setDpi] = useState(300);
  const [transparent, setTransparent] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Opening the menu is the moment to ask what the card actually contains.
   * Offering "both sides" by default on a card whose back is still blank would
   * hand the user a second, empty file they never asked for.
   */
  useEffect(() => {
    if (!isOpen) return;
    const backIsEmpty = isSceneEmpty(getSideScene(collectSides(), "back"));
    setIsBackEmpty(backIsEmpty);
    setScope(backIsEmpty ? "front" : "both");
  }, [isOpen, collectSides]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isBusy) return;

    setIsBusy(true);
    setError(null);
    try {
      // Collected fresh rather than reused from open: the live canvas holds
      // whichever side is showing, and only collectSides knows the other one.
      await exportCard(selectSides(collectSides(), scope), {
        format,
        dpi,
        transparent,
        fileName: documentName,
      });
      setIsOpen(false);
    } catch {
      setError(t.failed);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative">
      <Button size="sm" onClick={() => setIsOpen((open) => !open)}>
        <Download className="h-4 w-4" />
        {dictionary.toolbar.download}
      </Button>

      {isOpen ? (
        <>
          {/* Click-away backdrop. */}
          <button
            type="button"
            aria-label={t.close}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-label={t.options}
            data-download-menu
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-hairline bg-panel p-4 shadow-pop"
          >
            <div className="space-y-2">
              {FORMATS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setFormat(entry)}
                  aria-pressed={format === entry}
                  data-format={entry}
                  className={cn(
                    "flex w-full items-baseline justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                    format === entry
                      ? "border-brand-400 bg-brand-50"
                      : "border-hairline hover:border-ink-300",
                  )}
                >
                  <span className="text-sm font-semibold text-ink-900">
                    {t[entry].label}
                  </span>
                  <span className="text-[11px] text-ink-500">{t[entry].hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              <Field label={t.scope} stacked>
                <Select
                  ariaLabel={t.scope}
                  value={scope}
                  options={SCOPES.map((entry) => ({
                    value: entry,
                    label: t.scopes[entry],
                  }))}
                  onChange={(value) => setScope(value as ExportScope)}
                />
              </Field>

              {isBackEmpty && scope !== "front" ? (
                <p className="text-xs text-ink-500">{t.backEmpty}</p>
              ) : null}

              {format !== "pdf" ? (
                <Field label={t.quality} stacked>
                  <Select
                    ariaLabel={t.resolution}
                    value={dpi}
                    options={DPI_PRESETS.map((preset) => ({
                      value: preset.dpi,
                      label: t[preset.labelKey],
                    }))}
                    onChange={(value) => setDpi(Number(value))}
                  />
                </Field>
              ) : null}

              {format === "png" ? (
                <label className="flex items-center gap-2 text-xs text-ink-600">
                  <input
                    type="checkbox"
                    checked={transparent}
                    onChange={(event) => setTransparent(event.target.checked)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  {t.transparent}
                </label>
              ) : null}

              {error ? (
                <p role="alert" className="text-xs text-danger-ink">
                  {error}
                </p>
              ) : null}

              <Button
                size="sm"
                className="w-full"
                disabled={isBusy}
                onClick={() => void download()}
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isBusy ? t.preparing : t.action(format.toUpperCase())}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
