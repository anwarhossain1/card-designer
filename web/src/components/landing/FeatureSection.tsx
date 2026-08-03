"use client";

import {
  Download,
  Keyboard,
  Layers,
  QrCode,
  Ruler,
  Save,
  Shapes,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useT } from "@/components/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SectionHeading } from "./SectionHeading";

type FeatureKey = keyof Dictionary["landing"]["features"]["items"];

/** Icon per feature; the copy itself lives in the dictionaries. */
const ICONS: Record<FeatureKey, LucideIcon> = {
  type: Type,
  shapes: Shapes,
  qr: QrCode,
  layers: Layers,
  print: Ruler,
  export: Download,
  shortcuts: Keyboard,
  autosave: Save,
};

const ORDER: FeatureKey[] = [
  "type",
  "shapes",
  "qr",
  "layers",
  "print",
  "export",
  "shortcuts",
  "autosave",
];

export function FeatureSection() {
  const t = useT();
  const { items } = t.landing.features;

  return (
    <section id="features" className="scroll-mt-20 bg-panel-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.landing.features.eyebrow}
          title={t.landing.features.title}
          description={t.landing.features.description}
        />

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((key) => {
            const Icon = ICONS[key];
            return (
              <li key={key}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-brand-600 shadow-panel">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink-900">
                  {items[key].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {items[key].body}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
