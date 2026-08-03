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
import { SectionHeading } from "./SectionHeading";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Type,
    title: "Type that behaves",
    description:
      "Font, size, weight, letter spacing, line height, alignment and colour — with live preview on the card.",
  },
  {
    icon: Shapes,
    title: "Shapes & icons",
    description:
      "Rectangles, circles, triangles and lines, plus contact and social icons you can recolour and resize.",
  },
  {
    icon: QrCode,
    title: "Built-in QR codes",
    description:
      "Generate a QR from your website, phone, email or a full vCard, then place it anywhere on the card.",
  },
  {
    icon: Layers,
    title: "Real layer control",
    description:
      "Reorder, lock, hide, duplicate and delete. Everything on the card stays reachable.",
  },
  {
    icon: Ruler,
    title: "Print-safe by default",
    description:
      "Bleed and safe-area guides, snapping and alignment rules keep artwork inside the trim.",
  },
  {
    icon: Download,
    title: "Export that prints",
    description:
      "PNG, JPEG or PDF at high resolution — with transparent background when you need it.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    description:
      "Copy, paste, undo, redo, delete, nudge with arrows and multi-select the way you already expect.",
  },
  {
    icon: Save,
    title: "Autosave, no account",
    description:
      "Your design is stored in this browser and restored when you come back. Nothing to sign up for.",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-panel-muted py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything a card needs. Nothing it doesn't."
          description="We left out the 400-feature design suite and kept the tools that actually shape a business card."
        />

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-brand-600 shadow-panel">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
