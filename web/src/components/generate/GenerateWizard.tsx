"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/I18nProvider";
import { useSession } from "@/hooks/useSession";
import { collectMergeFields, type MergeField } from "@/lib/batch/fields";
import {
  previewSides,
  renderBatch,
  type BatchRow,
} from "@/lib/batch/generate";
import { buildFileNames, downloadPdf, downloadZip } from "@/lib/batch/output";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_BYTES,
  MAX_ROWS,
  parseRoster,
  RosterError,
  suggestHeader,
  type Roster,
} from "@/lib/batch/roster";
import { renderScene } from "@/lib/export/exportCard";
import { loadDocument } from "@/lib/storage/documentStorage";
import type { CardDocument } from "@/types/document";

type Step = "upload" | "map" | "review" | "output";

const STEP_ORDER: Step[] = ["upload", "map", "review", "output"];

/** header index per field key; null = leave the element's designed text alone. */
type Mapping = Record<string, number | null>;

export function GenerateWizard() {
  const t = useT().generate;
  const router = useRouter();
  const { user, isPending } = useSession();

  const [doc, setDoc] = useState<CardDocument | null | undefined>(undefined);
  const [step, setStep] = useState<Step>("upload");
  const [roster, setRoster] = useState<Roster | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [nameColumn, setNameColumn] = useState(0);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<"zip" | "pdf">("zip");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [finished, setFinished] = useState<number | null>(null);
  const cancelled = useRef(false);

  // The roster holds other people's personal data; being signed in is the
  // least a batch feature should ask.
  useEffect(() => {
    if (!isPending && !user) router.replace("/sign-in?next=/generate");
  }, [isPending, user, router]);

  // localStorage only exists client-side; undefined = still looking.
  useEffect(() => {
    setDoc(loadDocument());
  }, []);

  const fields = useMemo<MergeField[]>(
    () => (doc ? collectMergeFields(doc.sides) : []),
    [doc],
  );

  const acceptRoster = useCallback(
    (file: File) => {
      setUploadError(null);

      const name = file.name.toLowerCase();
      if (name.endsWith(".pdf")) {
        setUploadError(t.upload.pdfRejected);
        return;
      }
      if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        setUploadError(t.upload.unreadable);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadError(t.upload.tooLarge);
        return;
      }

      void file.arrayBuffer().then((buffer) => {
        try {
          const parsed = parseRoster(buffer);
          setRoster(parsed);
          // Pre-map what can be guessed; the admin fixes the rest.
          const guessed: Mapping = {};
          for (const field of fields) {
            guessed[field.key] = suggestHeader(field.key, parsed.headers);
          }
          setMapping(guessed);
          setNameColumn(
            guessed[fields[0]?.key ?? ""] ??
              suggestHeader("name", parsed.headers) ??
              0,
          );
          setExcluded(new Set());
          setStep("map");
        } catch (error) {
          if (error instanceof RosterError) {
            setUploadError(
              error.reason === "empty" ? t.upload.empty : t.upload.unreadable,
            );
          } else {
            setUploadError(t.upload.unreadable);
          }
        }
      });
    },
    [fields, t],
  );

  const rowWarnings = useMemo(() => {
    if (!roster) return new Set<number>();
    const mappedColumns = Object.values(mapping).filter(
      (index): index is number => index !== null,
    );
    const flagged = new Set<number>();
    roster.rows.forEach((row, rowIndex) => {
      if (mappedColumns.some((column) => !row[column]?.trim())) {
        flagged.add(rowIndex);
      }
    });
    return flagged;
  }, [roster, mapping]);

  const selectedRows = useMemo(() => {
    if (!roster) return [];
    return roster.rows
      .map((row, index) => ({ row, index }))
      .filter(({ index }) => !excluded.has(index));
  }, [roster, excluded]);

  const run = useCallback(async () => {
    if (!doc || !roster) return;
    cancelled.current = false;
    setFinished(null);

    const rows: BatchRow[] = selectedRows.map(({ row }) => ({
      values: Object.fromEntries(
        Object.entries(mapping)
          .filter((entry): entry is [string, number] => entry[1] !== null)
          .map(([key, column]) => [key, row[column] ?? ""]),
      ),
      fileName: "",
    }));

    buildFileNames(
      selectedRows.map(({ row }) => row[nameColumn] ?? ""),
      "card",
    ).forEach((name, index) => {
      const row = rows[index];
      if (row) row.fileName = name;
    });

    setProgress({ done: 0, total: rows.length });
    try {
      const cards = await renderBatch({
        sides: doc.sides,
        fields,
        rows,
        format: format === "zip" ? "png" : "pdf",
        onProgress: (done, total) => setProgress({ done, total }),
        isCancelled: () => cancelled.current,
      });

      if (cancelled.current || cards.length === 0) return;

      if (format === "zip") await downloadZip(cards, doc.name);
      else await downloadPdf(cards, doc.name);
      setFinished(cards.length);
    } finally {
      setProgress(null);
    }
  }, [doc, roster, selectedRows, mapping, nameColumn, fields, format]);

  if (isPending || !user || doc === undefined) {
    return (
      <Shell>
        <div className="grid min-h-64 place-items-center text-ink-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (!doc) {
    return (
      <Shell>
        <EmptyState title={t.noDocument.title} body={t.noDocument.body}>
          <Button onClick={() => router.push("/editor")}>{t.noDocument.cta}</Button>
        </EmptyState>
      </Shell>
    );
  }

  if (fields.length === 0) {
    return (
      <Shell>
        <EmptyState title={t.noFields.title} body={t.noFields.body}>
          <Button onClick={() => router.push("/editor")}>{t.noFields.cta}</Button>
        </EmptyState>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-xl font-semibold text-ink-900">{t.title}</h1>
        <p className="mt-1 text-sm text-ink-500">{t.subtitle(doc.name)}</p>
      </header>

      <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs">
        {STEP_ORDER.map((id, index) => {
          const state =
            id === step
              ? "current"
              : STEP_ORDER.indexOf(step) > index
                ? "done"
                : "todo";
          return (
            <li key={id} className="flex items-center gap-2">
              {index > 0 ? <span className="text-ink-300">—</span> : null}
              <span
                className={
                  state === "current"
                    ? "rounded-full bg-brand-600 px-3 py-1 font-medium text-white"
                    : state === "done"
                      ? "rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700"
                      : "rounded-full bg-ink-100 px-3 py-1 text-ink-500"
                }
              >
                {t.steps[id]}
              </span>
            </li>
          );
        })}
      </ol>

      {step === "upload" ? (
        <UploadStep error={uploadError} truncated={roster?.truncated} onFile={acceptRoster} />
      ) : null}

      {step === "map" && roster ? (
        <MapStep
          doc={doc}
          fields={fields}
          roster={roster}
          mapping={mapping}
          nameColumn={nameColumn}
          onMapping={setMapping}
          onNameColumn={setNameColumn}
          onBack={() => setStep("upload")}
          onNext={() => setStep("review")}
        />
      ) : null}

      {step === "review" && roster ? (
        <ReviewStep
          roster={roster}
          mapping={mapping}
          warnings={rowWarnings}
          excluded={excluded}
          onExcluded={setExcluded}
          selectedCount={selectedRows.length}
          onBack={() => setStep("map")}
          onNext={() => setStep("output")}
        />
      ) : null}

      {step === "output" ? (
        <OutputStep
          format={format}
          onFormat={setFormat}
          progress={progress}
          finished={finished}
          count={selectedRows.length}
          onBack={() => setStep("review")}
          onRun={() => void run()}
          onCancel={() => {
            cancelled.current = true;
          }}
        />
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const t = useT().generate;
  return (
    <main className="min-h-dvh bg-canvas px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/editor"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.noFields.cta}
        </Link>
        <div className="rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-10 text-center">
      <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{body}</p>
      <div className="mt-6 flex justify-center">{children}</div>
    </div>
  );
}

function UploadStep({
  error,
  truncated,
  onFile,
}: {
  error: string | null;
  truncated: boolean | undefined;
  onFile: (file: File) => void;
}) {
  const t = useT().generate.upload;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`grid w-full place-items-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-hairline hover:border-brand-200 hover:bg-brand-50/40"
        }`}
      >
        <FileSpreadsheet className="h-8 w-8 text-brand-600" />
        <span className="text-sm font-medium text-ink-800">{t.prompt}</span>
        <span className="text-xs text-ink-400">{t.formats}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={pick}
      />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-danger-ink/30 bg-danger-ink/5 px-3 py-2 text-sm text-danger-ink"
        >
          {error}
        </p>
      ) : null}
      {truncated ? (
        <p className="mt-4 text-xs text-ink-500">{t.truncated(MAX_ROWS)}</p>
      ) : null}

      <p className="mt-6 flex items-start gap-2 rounded-md bg-ink-100 px-3 py-2.5 text-xs leading-relaxed text-ink-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        {t.privacy}
      </p>
    </div>
  );
}

function MapStep({
  doc,
  fields,
  roster,
  mapping,
  nameColumn,
  onMapping,
  onNameColumn,
  onBack,
  onNext,
}: {
  doc: CardDocument;
  fields: MergeField[];
  roster: Roster;
  mapping: Mapping;
  nameColumn: number;
  onMapping: (next: Mapping) => void;
  onNameColumn: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useT().generate;
  const [preview, setPreview] = useState<string | null>(null);

  // First-row preview so a wrong mapping is visible before 500 cards render.
  useEffect(() => {
    let stale = false;
    const firstRow = roster.rows[0];
    if (!firstRow) return;

    const values = Object.fromEntries(
      Object.entries(mapping)
        .filter((entry): entry is [string, number] => entry[1] !== null)
        .map(([key, column]) => [key, firstRow[column] ?? ""]),
    );

    const front = previewSides(doc.sides, fields, values).find(
      (side) => side.id === "front",
    );
    if (!front?.scene) return;

    void renderScene(front.scene, { transparent: false, format: "png" }).then(
      (canvas) => {
        if (!stale) setPreview(canvas.toDataURL({ multiplier: 1.5 }));
        void canvas.dispose();
      },
    );

    return () => {
      stale = true;
    };
  }, [doc, fields, roster, mapping]);

  const select = (fieldKey: string, value: string) => {
    onMapping({ ...mapping, [fieldKey]: value === "" ? null : Number(value) });
  };

  return (
    <div>
      <p className="mb-4 text-sm text-ink-600">{t.map.intro}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="pb-2 pr-3 font-medium">{t.map.fieldHeader}</th>
              <th className="pb-2 font-medium">{t.map.columnHeader}</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={`${field.source}:${field.key}`} className="border-t border-hairline">
                <td className="py-2.5 pr-3">
                  <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-brand-700">
                    {field.source === "field" ? `{{${field.key}}}` : field.key}
                  </code>
                  {field.source === "role" ? (
                    <span className="ml-2 text-[11px] text-ink-400">
                      {t.map.fromRole}
                    </span>
                  ) : null}
                </td>
                <td className="py-2.5">
                  <select
                    value={mapping[field.key] ?? ""}
                    onChange={(event) => select(field.key, event.target.value)}
                    className="h-9 w-full rounded-md border border-hairline bg-panel px-2 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-400"
                  >
                    <option value="">{t.map.unmapped}</option>
                    {roster.headers.map((header, index) => (
                      <option key={index} value={index}>
                        {header}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="lg:w-64">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
            {t.map.preview}
          </p>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={t.map.preview}
              className="w-full rounded-lg border border-hairline shadow-sm"
            />
          ) : (
            <div className="grid aspect-[7/4] w-full place-items-center rounded-lg border border-hairline bg-ink-100">
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
            </div>
          )}

          <label className="mt-4 block text-xs font-medium text-ink-700">
            {t.map.nameColumnLabel}
            <select
              value={nameColumn}
              onChange={(event) => onNameColumn(Number(event.target.value))}
              className="mt-1 h-9 w-full rounded-md border border-hairline bg-panel px-2 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              {roster.headers.map((header, index) => (
                <option key={index} value={index}>
                  {header}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          {t.review.back}
        </Button>
        <Button onClick={onNext}>{t.map.next}</Button>
      </div>
    </div>
  );
}

function ReviewStep({
  roster,
  mapping,
  warnings,
  excluded,
  onExcluded,
  selectedCount,
  onBack,
  onNext,
}: {
  roster: Roster;
  mapping: Mapping;
  warnings: Set<number>;
  excluded: Set<number>;
  onExcluded: (next: Set<number>) => void;
  selectedCount: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useT().generate.review;
  const back = useT().generate.review.back;

  // Only mapped columns are shown: they are the ones that will hit the card.
  const shownColumns = useMemo(() => {
    const mapped = [
      ...new Set(
        Object.values(mapping).filter((v): v is number => v !== null),
      ),
    ];
    return mapped.length > 0 ? mapped : roster.headers.map((_, i) => i).slice(0, 4);
  }, [mapping, roster]);

  const allSelected = excluded.size === 0;

  const toggle = (index: number) => {
    const next = new Set(excluded);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    onExcluded(next);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium text-ink-800">
          {t.selected(selectedCount, roster.rows.length)}
        </span>
        {warnings.size > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-danger-ink text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t.warnings(warnings.size)}
          </span>
        ) : null}
      </div>

      <div className="max-h-[420px] overflow-auto rounded-lg border border-hairline">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-panel">
            <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label={t.allToggle}
                  checked={allSelected}
                  onChange={() =>
                    onExcluded(
                      allSelected
                        ? new Set(roster.rows.map((_, i) => i))
                        : new Set(),
                    )
                  }
                />
              </th>
              {shownColumns.map((column) => (
                <th key={column} className="px-3 py-2 font-medium">
                  {roster.headers[column]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.rows.map((row, index) => (
              <tr
                key={index}
                className={`border-t border-hairline ${
                  excluded.has(index) ? "opacity-40" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!excluded.has(index)}
                    onChange={() => toggle(index)}
                    aria-label={`${index + 1}`}
                  />
                </td>
                {shownColumns.map((column) => (
                  <td key={column} className="px-3 py-2 text-ink-800">
                    {row[column] || (
                      warnings.has(index) ? (
                        <span title={t.emptyCell}>
                          <AlertTriangle className="h-3.5 w-3.5 text-danger-ink" />
                        </span>
                      ) : null
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          {back}
        </Button>
        <Button onClick={onNext} disabled={selectedCount === 0}>
          {t.next}
        </Button>
      </div>
    </div>
  );
}

function OutputStep({
  format,
  onFormat,
  progress,
  finished,
  count,
  onBack,
  onRun,
  onCancel,
}: {
  format: "zip" | "pdf";
  onFormat: (format: "zip" | "pdf") => void;
  progress: { done: number; total: number } | null;
  finished: number | null;
  count: number;
  onBack: () => void;
  onRun: () => void;
  onCancel: () => void;
}) {
  const t = useT().generate.output;
  const back = useT().generate.review.back;
  const busy = progress !== null;

  if (finished !== null) {
    return (
      <div className="py-6 text-center">
        <h2 className="text-lg font-semibold text-ink-900">{t.done(finished)}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">{t.doneBody}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            {back}
          </Button>
          <Button onClick={onRun}>{t.again}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-ink-600">{t.intro}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            { id: "zip", label: t.zip, hint: t.zipHint },
            { id: "pdf", label: t.pdf, hint: t.pdfHint },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={busy}
            onClick={() => onFormat(option.id)}
            aria-pressed={format === option.id}
            className={`rounded-xl border px-4 py-4 text-left transition-colors ${
              format === option.id
                ? "border-brand-400 bg-brand-50"
                : "border-hairline hover:border-brand-200"
            }`}
          >
            <span className="block text-sm font-semibold text-ink-900">
              {option.label}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-500">
              {option.hint}
            </span>
          </button>
        ))}
      </div>

      {busy && progress ? (
        <div className="mt-6">
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
            <span>{t.generating(progress.done, progress.total)}</span>
            <button
              type="button"
              onClick={onCancel}
              className="font-medium text-ink-600 hover:text-ink-900"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={busy}>
          {back}
        </Button>
        <Button onClick={onRun} disabled={busy || count === 0}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t.generate}
        </Button>
      </div>
    </div>
  );
}
