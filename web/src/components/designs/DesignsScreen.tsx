"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { AuthNavAction } from "@/components/auth/AuthNavAction";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDesigns } from "@/hooks/useDesigns";
import { useSession } from "@/hooks/useSession";
import { DesignCard } from "./DesignCard";

export function DesignsScreen() {
  const t = useT().designs;
  const { user } = useSession();
  const { data, isPending, isError, refetch } = useDesigns();

  const designs = data ?? [];

  return (
    <div className="min-h-[100dvh] bg-workspace">
      <header className="border-b border-hairline/70 bg-panel/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1.5">
            <LocaleToggle compact />
            <ThemeToggle size="sm" />
            <AuthNavAction next="/designs" />
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink-900">{t.title}</h1>
            {designs.length > 0 ? (
              <p className="mt-1 text-sm text-ink-500">
                {t.count(designs.length)}
              </p>
            ) : null}
          </div>

          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToEditor}
          </Link>
        </div>

        {/* Guests own designs through a cookie, which is easy to lose. */}
        {!user && designs.length > 0 ? (
          <p className="mt-4 rounded-lg border border-hairline bg-panel px-3 py-2.5 text-sm text-ink-600">
            {t.guestNote}
          </p>
        ) : null}

        {isPending ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.loading}
          </p>
        ) : isError ? (
          <div className="mt-10 space-y-3">
            <p role="alert" className="text-sm text-danger-ink">
              {t.failed}
            </p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              {t.retry}
            </Button>
          </div>
        ) : designs.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-hairline bg-panel px-6 py-14 text-center">
            <h2 className="text-base font-medium text-ink-900">
              {t.empty.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              {t.empty.body}
            </p>
            <Link href="/editor?design=new" className="mt-5 inline-block">
              <Button>{t.empty.action}</Button>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <Link
                href="/editor?design=new"
                className="flex h-full min-h-[11rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline bg-panel/50 p-6 text-center transition-colors hover:border-brand-400 hover:bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <span
                  aria-hidden
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600"
                >
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink-800">
                  {t.newDesign}
                </span>
                <span className="text-xs text-ink-400">{t.newDesignHint}</span>
              </Link>
            </li>

            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
