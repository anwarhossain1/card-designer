"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme/theme";

/** Cycles light → dark → follow system, the way most editors do it. */
const NEXT: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<ThemePreference, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "Matching your system",
};

export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const { preference, setTheme } = useTheme();

  const Icon =
    preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;

  return (
    <IconButton
      size={size}
      label={`${LABEL[preference]} — switch to ${LABEL[NEXT[preference]].toLowerCase()}`}
      onClick={() => setTheme(NEXT[preference])}
    >
      <Icon className="h-4 w-4" />
    </IconButton>
  );
}
