"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils/cn";

interface Day {
  date: string;
  count: number;
}

/** "2026-11-23" → "23 Nov", in the reader's language. */
const formatDay = (date: string, locale: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(
    locale === "bn" ? "bn-BD" : "en-GB",
    { day: "numeric", month: "short", timeZone: "UTC" },
  );

/**
 * One series, so one colour and no legend: the heading names what is plotted.
 * Bars grow from a single hairline baseline with a 2px gap between them; each
 * column is a hover/focus target taller than its bar, so a zero-day is still
 * something you can point at. A visually hidden table carries the same data
 * for screen readers.
 */
export function SignupsChart({ days }: { days: Day[] }) {
  const { t, locale } = useI18n();
  const copy = t.admin.overview;
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const activeDay = active === null ? null : days[active];

  return (
    <section className="rounded-xl border border-hairline bg-panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-900">{copy.signupsTitle}</h2>
        <p className="text-sm tabular-nums text-ink-500">{copy.signupsTotal(total)}</p>
      </div>

      <div className="relative mt-5 flex gap-3">
        {/* Only the top and bottom of the scale: the tooltip carries exact values. */}
        <div
          aria-hidden
          className="flex h-40 flex-col justify-between text-right text-[11px] tabular-nums text-ink-400"
        >
          <span>{max}</span>
          <span>0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            className="flex h-40 items-end gap-[2px] border-b border-hairline"
            onMouseLeave={() => setActive(null)}
          >
            {days.map((day, index) => (
              <button
                key={day.date}
                type="button"
                aria-label={copy.signupsOn(formatDay(day.date, locale), day.count)}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="group flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                <span
                  className={cn(
                    "block w-full max-w-6 rounded-t-[4px] bg-brand-600 transition-opacity",
                    active !== null && active !== index && "opacity-40",
                    "group-focus-visible:ring-2 group-focus-visible:ring-brand-400",
                  )}
                  style={{
                    height: day.count === 0 ? 0 : `${(day.count / max) * 100}%`,
                    minHeight: day.count === 0 ? 0 : 2,
                  }}
                />
              </button>
            ))}
          </div>

          {activeDay && active !== null ? (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-hairline bg-panel px-2 py-1 text-xs text-ink-800 shadow-pop"
              style={{ left: `${((active + 0.5) / days.length) * 100}%` }}
            >
              {copy.signupsOn(formatDay(activeDay.date, locale), activeDay.count)}
            </div>
          ) : null}

          <div
            aria-hidden
            className="mt-1.5 flex justify-between text-[11px] text-ink-400"
          >
            <span>{days[0] ? formatDay(days[0].date, locale) : null}</span>
            <span>
              {days.at(-1) ? formatDay(days.at(-1)!.date, locale) : null}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-ink-400">{copy.signupsCaption}</p>

      <table className="sr-only">
        <caption>{copy.signupsTitle}</caption>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{formatDay(day.date, locale)}</th>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
