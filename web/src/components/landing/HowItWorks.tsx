"use client";

import { Container } from "@/components/ui/Container";
import { useT } from "@/components/i18n/I18nProvider";
import { SectionHeading } from "./SectionHeading";

export function HowItWorks() {
  const t = useT();

  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.landing.howItWorks.eyebrow}
          title={t.landing.howItWorks.title}
        />

        <ol className="mt-14 grid gap-8 sm:grid-cols-3">
          {t.landing.howItWorks.steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
