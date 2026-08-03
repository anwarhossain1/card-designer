"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const CONTROL =
  "h-8 rounded-md border border-hairline bg-panel px-2 text-xs text-ink-800 outline-none transition-colors focus:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100";

/** Numeric input that commits on blur/Enter so typing never fights the canvas. */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(round(value))), [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed)) return setDraft(String(round(value)));
    const clamped = Math.min(Math.max(parsed, min ?? -Infinity), max ?? Infinity);
    onChange(clamped);
    setDraft(String(round(clamped)));
  };

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <input
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className={cn(CONTROL, "w-full pr-6 [appearance:textfield]")}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-2 text-[10px] text-ink-400">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600"
    />
  );
}

export function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-hairline">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Colour"
          className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
        />
      </span>
      <span className="font-mono text-[11px] uppercase text-ink-500">
        {normalizeHex(value)}
      </span>
    </label>
  );
}

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (value: string) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(CONTROL, "w-full cursor-pointer", className)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T | null;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon: ReactNode }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-0.5 rounded-md bg-panel-muted p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "grid h-7 flex-1 place-items-center rounded-[5px] text-ink-600 transition-colors",
            "hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-brand-400",
            value === option.value && "bg-panel text-brand-700 shadow-sm",
          )}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Fabric fills may be rgb()/named colours; the colour input needs hex. */
function normalizeHex(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value.split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  const match = value.match(/\d+/g);
  if (match && match.length >= 3) {
    return `#${match
      .slice(0, 3)
      .map((part) => Number(part).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  return "#000000";
}
