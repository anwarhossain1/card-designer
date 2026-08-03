import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "./SectionHeading";
import { CardPreview } from "./card-preview/CardPreview";
import { CARD_PREVIEWS } from "./card-preview/data";

export function TemplateShowcase() {
  return (
    <section id="templates" className="scroll-mt-20 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Templates"
          title="Five starting points, all fully editable"
          description="Every template arrives filled in — name, title, phone, email, website and a logo slot. Change anything, or strip it back to a blank card."
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_PREVIEWS.map((preview) => (
            <li key={preview.id}>
              <Link
                href={`/editor?template=${preview.id}`}
                className="group block rounded-xl border border-hairline bg-panel p-4 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <CardPreview data={preview} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      {preview.name}
                    </h3>
                    <p className="mt-1 text-sm leading-snug text-ink-500">
                      {preview.description}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-600" />
                </div>
              </Link>
            </li>
          ))}

          <li>
            <Link
              href="/editor"
              className="group flex h-full min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-panel-muted p-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="text-sm font-semibold text-ink-800">
                Start from blank
              </span>
              <span className="max-w-[16rem] text-sm text-ink-500">
                An empty 3.5 × 2 in card with guides, safe area and bleed ready.
              </span>
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}
