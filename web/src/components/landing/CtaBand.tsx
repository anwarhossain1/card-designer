"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useT } from "@/components/i18n/I18nProvider";

export function CtaBand() {
  const t = useT();

  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 px-8 py-14 text-center sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-white/10"
          />

          <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t.landing.cta.title}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">
            {t.landing.cta.body}
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link href="/editor">
              <Button
                size="lg"
                className="group bg-white text-brand-700 hover:bg-white/90 active:bg-white/80"
              >
                {t.landing.nav.startDesigning}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
