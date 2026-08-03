"use client";

import { Field } from "@/components/ui/Field";
import { ColorInput, Slider } from "@/components/ui/inputs";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/components/i18n/I18nProvider";
import { QR_KINDS, type QrConfig, type QrVcard } from "@/lib/qr/config";
import type { QrDataKind } from "@/types/element";

const INPUT =
  "h-8 w-full rounded-md border border-hairline bg-panel px-2 text-xs text-ink-800 outline-none transition-colors focus:border-brand-400";

interface QrFormProps {
  value: QrConfig;
  onChange: (next: QrConfig) => void;
}

/**
 * One form, used by both the QR panel (before the code exists) and the
 * properties sidebar (after), so the fields can never drift apart.
 */
export function QrForm({ value, onChange }: QrFormProps) {
  const t = useT().editor.qr;

  const set = (patch: Partial<QrConfig>) => onChange({ ...value, ...patch });
  const setVcard = (patch: Partial<QrVcard>) =>
    onChange({ ...value, vcard: { ...value.vcard, ...patch } });

  const vcardFields: [keyof QrVcard, string][] = [
    ["title", t.jobTitle],
    ["company", t.company],
    ["phone", t.kinds.phone],
    ["email", t.kinds.email],
    ["website", t.website],
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 rounded-lg bg-panel-muted p-0.5">
        {QR_KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            aria-pressed={value.kind === kind.id}
            data-qr-kind={kind.id}
            onClick={() => set({ kind: kind.id as QrDataKind })}
            className={cn(
              "flex-1 rounded-[6px] px-1 py-1.5 text-[11px] font-medium transition-colors",
              value.kind === kind.id
                ? "bg-panel text-brand-700 shadow-sm"
                : "text-ink-500 hover:text-ink-800",
            )}
          >
            {t.kinds[kind.id]}
          </button>
        ))}
      </div>

      {value.kind === "website" ? (
        <Field label={t.url} stacked>
          <input
            className={INPUT}
            value={value.website}
            placeholder="northwind.co"
            onChange={(event) => set({ website: event.target.value })}
          />
        </Field>
      ) : null}

      {value.kind === "phone" ? (
        <Field label={t.phoneNumber} stacked>
          <input
            className={INPUT}
            value={value.phone}
            placeholder="+880 1712 345 678"
            onChange={(event) => set({ phone: event.target.value })}
          />
        </Field>
      ) : null}

      {value.kind === "email" ? (
        <Field label={t.emailAddress} stacked>
          <input
            className={INPUT}
            type="email"
            value={value.email}
            placeholder="hello@northwind.co"
            onChange={(event) => set({ email: event.target.value })}
          />
        </Field>
      ) : null}

      {value.kind === "vcard" ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Field label={t.firstName} stacked>
              <input
                className={INPUT}
                value={value.vcard.firstName}
                onChange={(event) => setVcard({ firstName: event.target.value })}
              />
            </Field>
            <Field label={t.lastName} stacked>
              <input
                className={INPUT}
                value={value.vcard.lastName}
                onChange={(event) => setVcard({ lastName: event.target.value })}
              />
            </Field>
          </div>
          {vcardFields.map(([key, label]) => (
            <Field key={key} label={label} stacked>
              <input
                className={INPUT}
                value={value.vcard[key]}
                onChange={(event) => setVcard({ [key]: event.target.value })}
              />
            </Field>
          ))}
        </div>
      ) : null}

      <Field label={t.colour}>
        <ColorInput
          value={value.darkColor}
          onChange={(color) => set({ darkColor: color })}
        />
      </Field>

      <Field label={t.background}>
        <label className="flex items-center gap-2 text-xs text-ink-600">
          <input
            type="checkbox"
            checked={value.transparentBackground}
            onChange={(event) =>
              set({ transparentBackground: event.target.checked })
            }
            className="h-4 w-4 accent-brand-600"
          />
          {t.transparent}
        </label>
      </Field>

      {!value.transparentBackground ? (
        <Field label={t.backgroundColour}>
          <ColorInput
            value={value.lightColor}
            onChange={(color) => set({ lightColor: color })}
          />
        </Field>
      ) : null}

      <Field label={t.quietZone} stacked>
        <div className="flex items-center gap-2">
          <Slider
            value={value.margin}
            min={0}
            max={6}
            onChange={(margin) => set({ margin })}
          />
          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
            {value.margin}
          </span>
        </div>
      </Field>
    </div>
  );
}
