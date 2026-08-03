import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CardPreview } from "./card-preview/CardPreview";
import { CARD_PREVIEWS } from "./card-preview/data";

const [modern, , , , luxury] = CARD_PREVIEWS;

const FACTS = ["3.5 × 2 in", "300 DPI print-ready", "PNG · JPEG · PDF"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand wash — decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_15%_0%,var(--color-brand-50)_0%,transparent_60%),radial-gradient(50%_50%_at_90%_10%,#e6fbff_0%,transparent_55%)]"
      />

      <Container className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            No sign-up. Nothing to install.
          </span>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
            Design a business card you&apos;d actually{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              hand out
            </span>
            .
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            A focused editor for one job. Start from a template or a blank card,
            drag things where you want them, and download a print-ready file in
            seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/editor">
              <Button size="lg" className="group">
                Start Designing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#templates">
              <Button size="lg" variant="outline">
                Browse templates
              </Button>
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/3.2]">
            <div className="absolute left-0 top-[4%] w-[74%] -rotate-6">
              <CardPreview data={luxury} elevated />
            </div>
            <div className="absolute bottom-[4%] right-0 w-[80%] rotate-3">
              <CardPreview data={modern} elevated />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
