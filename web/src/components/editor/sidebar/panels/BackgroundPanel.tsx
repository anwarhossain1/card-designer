"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ColorInput, Slider } from "@/components/ui/inputs";
import { cn } from "@/lib/utils/cn";
import { useCanvasActions } from "@/hooks/useCanvasActions";
import { useUploads } from "@/hooks/useUploads";
import { useT } from "@/components/i18n/I18nProvider";
import { PATTERNS } from "@/lib/canvas/patterns";

type Tab = "solid" | "gradient" | "image" | "pattern";

const TABS: Tab[] = ["solid", "gradient", "image", "pattern"];

const SWATCHES = [
  "#ffffff", "#f7f7f8", "#11141c", "#1f2430", "#12325c",
  "#6c4cff", "#12b5da", "#0f766e", "#c9a44c", "#b91c1c",
];

export function BackgroundPanel() {
  const t = useT().editor.background;
  const { setBackground } = useCanvasActions();
  const { assets } = useUploads();

  const [tab, setTab] = useState<Tab>("solid");
  const [solid, setSolid] = useState("#ffffff");
  const [from, setFrom] = useState("#6c4cff");
  const [to, setTo] = useState("#12b5da");
  const [angle, setAngle] = useState(135);
  const [patternInk, setPatternInk] = useState("#11141c");
  const [patternBase, setPatternBase] = useState("#ffffff");

  return (
    <div className="space-y-4">
      <div className="flex gap-0.5 rounded-lg bg-panel-muted p-0.5">
        {TABS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            aria-pressed={tab === entry}
            data-tab={entry}
            className={cn(
              "flex-1 rounded-[6px] px-2 py-1.5 text-[11px] font-medium transition-colors",
              tab === entry
                ? "bg-panel text-brand-700 shadow-sm"
                : "text-ink-500 hover:text-ink-800",
            )}
          >
            {t[entry]}
          </button>
        ))}
      </div>

      {tab === "solid" ? (
        <div className="space-y-3">
          <ul className="grid grid-cols-5 gap-2">
            {SWATCHES.map((color) => (
              <li key={color}>
                <button
                  type="button"
                  aria-label={t.swatch(color)}
                  data-swatch={color}
                  onClick={() => {
                    setSolid(color);
                    setBackground({ kind: "solid", color });
                  }}
                  style={{ background: color }}
                  className="aspect-square w-full rounded-md border border-hairline transition-transform hover:scale-105"
                />
              </li>
            ))}
          </ul>
          <Field label={t.custom}>
            <ColorInput
              value={solid}
              onChange={(color) => {
                setSolid(color);
                setBackground({ kind: "solid", color });
              }}
            />
          </Field>
        </div>
      ) : null}

      {tab === "gradient" ? (
        <div className="space-y-3">
          <Field label={t.from}>
            <ColorInput value={from} onChange={setFrom} />
          </Field>
          <Field label={t.to}>
            <ColorInput value={to} onChange={setTo} />
          </Field>
          <Field label={t.angle} stacked>
            <div className="flex items-center gap-2">
              <Slider value={angle} min={0} max={360} step={15} onChange={setAngle} />
              <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-ink-500">
                {angle}°
              </span>
            </div>
          </Field>
          <div
            aria-hidden
            className="h-12 rounded-lg border border-hairline"
            style={{ backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` }}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={() => setBackground({ kind: "gradient", from, to, angle })}
          >
            {t.apply}
          </Button>
        </div>
      ) : null}

      {tab === "image" ? (
        assets.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() =>
                    setBackground({ kind: "image", dataUrl: asset.dataUrl })
                  }
                  className="flex aspect-[3.5/2] w-full items-center justify-center overflow-hidden rounded-lg border border-hairline bg-panel-muted transition-colors hover:border-brand-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.dataUrl}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-panel-muted p-3 text-xs leading-relaxed text-ink-500">
            {t.needUpload}
          </p>
        )
      ) : null}

      {tab === "pattern" ? (
        <div className="space-y-3">
          <ul className="grid grid-cols-2 gap-2">
            {PATTERNS.map((pattern) => (
              <li key={pattern.id}>
                <button
                  type="button"
                  onClick={() =>
                    setBackground({
                      kind: "pattern",
                      id: pattern.id,
                      background: patternBase,
                      foreground: patternInk,
                    })
                  }
                  data-pattern={pattern.id}
                  className="w-full rounded-lg border border-hairline px-2 py-3 text-[11px] text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50"
                >
                  {t.patterns[pattern.id]}
                </button>
              </li>
            ))}
          </ul>
          <Field label={t.base}>
            <ColorInput value={patternBase} onChange={setPatternBase} />
          </Field>
          <Field label={t.ink}>
            <ColorInput value={patternInk} onChange={setPatternInk} />
          </Field>
        </div>
      ) : null}

      <Button
        size="sm"
        variant="ghost"
        className="w-full"
        onClick={() => setBackground({ kind: "none" })}
      >
        <Ban className="h-4 w-4" />
        {t.none}
      </Button>
    </div>
  );
}
