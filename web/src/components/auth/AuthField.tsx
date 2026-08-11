"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  /** Rendered inside the field, at the trailing edge — the reveal toggle. */
  trailing?: ReactNode;
}

/**
 * A form field, not a properties row.
 *
 * `ui/Field` exists for the editor's panels, where labels are 11px and space
 * is the scarce resource. A sign-in form wants the opposite: readable labels,
 * touch-sized controls and room for an error message that is tied to the
 * input rather than floating near it.
 */
export function AuthField({
  label,
  error,
  hint,
  trailing,
  className,
  ...props
}: AuthFieldProps) {
  const id = useId();
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cn(
            "h-11 w-full rounded-md border bg-panel px-3 text-sm text-ink-900 outline-none",
            "transition-colors placeholder:text-ink-400",
            "focus-visible:ring-2 focus-visible:ring-brand-400",
            trailing ? "pr-11" : undefined,
            error
              ? "border-danger-ink"
              : "border-hairline focus-visible:border-brand-400",
            className,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {trailing}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="text-xs text-danger-ink">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
