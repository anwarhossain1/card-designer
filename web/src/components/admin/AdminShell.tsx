"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { AuthNavAction } from "@/components/auth/AuthNavAction";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAdminSession } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", key: "overview" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/templates", key: "templates" },
] as const;

/**
 * Frame and gate for every /admin page.
 *
 * The gate is a convenience, not the protection: it asks the server whether
 * this session is an admin and renders accordingly, while the API refuses
 * every admin call from anyone else regardless of what this shows.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useT().admin;
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const status = session.data?.status;

  useEffect(() => {
    if (status === 401) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  return (
    <div className="min-h-[100dvh] bg-workspace">
      <header className="border-b border-hairline/70 bg-panel/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {t.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <LocaleToggle compact />
            <ThemeToggle size="sm" />
            <AuthNavAction next={pathname} />
          </div>
        </Container>

        {session.data?.user ? (
          <Container>
            <nav
              aria-label={t.title}
              className="-mb-px flex gap-1 overflow-x-auto"
            >
              {NAV.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "border-brand-600 font-medium text-ink-900"
                        : "border-transparent text-ink-500 hover:text-ink-800",
                    )}
                  >
                    {t.nav[item.key]}
                  </Link>
                );
              })}
            </nav>
          </Container>
        ) : null}
      </header>

      <Container className="py-8">
        {session.isPending || status === 401 ? (
          <p className="flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.gate.checking}
          </p>
        ) : session.isError ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-danger-ink">
              {t.gate.failed}
            </p>
            <Button size="sm" variant="outline" onClick={() => void session.refetch()}>
              {t.gate.retry}
            </Button>
          </div>
        ) : !session.data?.user ? (
          <div className="mx-auto max-w-md rounded-xl border border-hairline bg-panel px-6 py-12 text-center">
            <ShieldAlert aria-hidden className="mx-auto h-8 w-8 text-ink-300" />
            <h1 className="mt-3 text-base font-semibold text-ink-900">
              {t.gate.deniedTitle}
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">{t.gate.deniedBody}</p>
            <Link href="/" className="mt-5 inline-block">
              <Button variant="outline" size="sm">
                {t.gate.home}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {children}
            <Link
              href="/editor"
              className="mt-12 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.nav.backToApp}
            </Link>
          </>
        )}
      </Container>
    </div>
  );
}
