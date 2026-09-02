"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { AuthNavAction } from "@/components/auth/AuthNavAction";
import { useT } from "@/components/i18n/I18nProvider";

export function Navbar() {
  const t = useT();

  const links = [
    { href: "#templates", label: t.landing.nav.templates },
    { href: "#features", label: t.landing.nav.features },
    { href: "#how-it-works", label: t.landing.nav.howItWorks },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-panel/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-600 transition-colors hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleToggle compact />
          <ThemeToggle size="sm" />
          <AuthNavAction />
          <Link href="/editor">
            <Button size="sm">{t.landing.nav.startDesigning}</Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
