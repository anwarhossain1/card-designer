import { cn } from "@/lib/utils/cn";
import type { CardPreviewData } from "./data";
import { LAYOUTS } from "./layouts";

interface CardPreviewProps {
  data: CardPreviewData;
  className?: string;
  /** Adds the raised, print-like drop shadow used in the hero. */
  elevated?: boolean;
}

/**
 * A true 3.5 × 2 in card rendered in CSS. `container-type: inline-size` lets the
 * layouts size themselves in `cqw`, so one component serves every preview size.
 */
export function CardPreview({ data, className, elevated }: CardPreviewProps) {
  const Layout = LAYOUTS[data.category];

  return (
    <div
      className={cn(
        "aspect-[3.5/2] w-full overflow-hidden rounded-[3%]",
        elevated ? "shadow-[0_18px_50px_-12px_rgb(17_20_28/0.45)]" : "shadow-panel",
        className,
      )}
      style={{ background: data.background, containerType: "inline-size" }}
      aria-label={`${data.name} business card template`}
      role="img"
    >
      <Layout data={data} />
    </div>
  );
}
