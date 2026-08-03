import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls must expose a name to assistive tech. */
  label: string;
  size?: Size;
  active?: boolean;
}

const SIZES: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, label, size = "md", active, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md",
          "text-ink-700 transition-colors duration-150 outline-none",
          "hover:bg-ink-100 active:bg-ink-200",
          "focus-visible:ring-2 focus-visible:ring-brand-400",
          "disabled:pointer-events-none disabled:opacity-40",
          active && "bg-brand-50 text-brand-700 hover:bg-brand-100",
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
