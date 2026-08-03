import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface FieldProps {
  label: string;
  children: ReactNode;
  /** Stacks the control under the label instead of beside it. */
  stacked?: boolean;
  hint?: string;
  className?: string;
}

/** Consistent label/control row for every properties panel. */
export function Field({ label, children, stacked, hint, className }: FieldProps) {
  return (
    <div
      className={cn(
        stacked ? "space-y-1.5" : "flex items-center justify-between gap-3",
        className,
      )}
    >
      <span className="shrink-0 text-xs font-medium text-ink-600">{label}</span>
      <div className={cn(stacked ? "w-full" : "flex min-w-0 items-center gap-1.5")}>
        {children}
      </div>
      {hint ? <p className="text-[11px] text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-hairline px-3 py-4 last:border-b-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
