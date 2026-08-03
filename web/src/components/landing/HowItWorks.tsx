import { Container } from "@/components/ui/Container";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    title: "Pick a starting point",
    description:
      "Choose one of five templates or open a blank 3.5 × 2 in card. No account, no wizard.",
  },
  {
    title: "Make it yours",
    description:
      "Swap the text, drop in your logo, adjust colours and add a QR code. Guides keep it print-safe.",
  },
  {
    title: "Download it",
    description:
      "Export PNG, JPEG or PDF at print resolution and send it to any printer you like.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps, about five minutes"
        />

        <ol className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
