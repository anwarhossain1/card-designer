"use client";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/components/i18n/I18nProvider";

export function Footer() {
  const t = useT();

  const links = [
    { href: "#templates", label: t.landing.nav.templates },
    { href: "#features", label: t.landing.nav.features },
    { href: "#how-it-works", label: t.landing.nav.howItWorks },
    { href: "/editor", label: t.landing.footer.editor },
  ];

  return (
    <footer className="border-t border-hairline py-10">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-sm text-ink-500">{t.landing.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
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
      </Container>

      <Container className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-hairline pt-6 text-xs text-ink-400 sm:flex-row">
        <span>© {new Date().getFullYear()} CardCraft</span>
        <span>{t.landing.footer.printSoon}</span>
      </Container>
    </footer>
  );
}
