"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useT } from "@/components/i18n/I18nProvider";
import { useLogout } from "@/hooks/useSession";
import type { AuthUser } from "@/lib/api/auth";

/** First letters of the first two words — "Tanvir Ahmed" becomes TA. */
function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("");

  return letters.toLocaleUpperCase() || "?";
}

export function UserMenu({ user }: { user: AuthUser }) {
  const dictionary = useT();
  const t = dictionary.auth;
  const [isOpen, setIsOpen] = useState(false);
  const signOut = useLogout();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t.nav.accountMenu}
        aria-expanded={isOpen}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold",
          "bg-brand-600 text-white transition-opacity hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1",
        )}
      >
        {initials(user.name)}
      </button>

      {isOpen ? (
        <>
          {/* Click-away backdrop, same pattern as the download menu. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="menu"
            aria-label={t.nav.accountMenu}
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-hairline bg-panel p-1.5 shadow-pop"
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-sm font-medium text-ink-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>

            <div aria-hidden className="my-1 h-px bg-hairline" />

            <Link
              href="/designs"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-700 transition-colors hover:bg-ink-100"
            >
              <LayoutGrid className="h-4 w-4" />
              {dictionary.designs.title}
            </Link>

            <button
              type="button"
              role="menuitem"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-60"
            >
              {signOut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {signOut.isPending ? t.nav.signingOut : t.nav.signOut}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
