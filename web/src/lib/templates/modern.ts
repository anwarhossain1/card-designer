import type { CardTemplate } from "@/types/template";
import { CANVAS_HEIGHT } from "@/config/document";
import { block, logoSlot, text } from "./helpers";

const ACCENT = "#6c4cff";
const INK = "#ffffff";
const MUTED = "#9aa0ad";

export const modernTemplate: CardTemplate = {
  id: "modern-01",
  name: "Modern",
  category: "modern",
  description: "Bold type, dark canvas, one confident accent.",
  palette: ["#11141c", ACCENT, INK],
  fonts: ["Inter"],

  build: () => ({
    background: { kind: "solid", color: "#11141c" },
    objects: [
      block({
        left: 0,
        top: 0,
        width: 6,
        height: CANVAS_HEIGHT,
        fill: ACCENT,
        name: "Accent bar",
      }),
      logoSlot({ left: 24, top: 20, size: 28, fill: ACCENT, textColor: "#11141c" }),
      text({
        role: "company",
        content: "NORTHWIND STUDIO",
        left: 24,
        top: 56,
        size: 7,
        width: 160,
        color: MUTED,
        spacing: 260,
        weight: 500,
      }),
      text({
        role: "name",
        content: "Your Name",
        left: 22,
        top: 76,
        size: 23,
        width: 210,
        color: INK,
        weight: 700,
        spacing: -20,
      }),
      text({
        role: "title",
        content: "JOB TITLE",
        left: 24,
        top: 106,
        size: 8,
        width: 180,
        color: ACCENT,
        spacing: 240,
        weight: 600,
      }),
      text({
        role: "phone",
        content: "+880 1712 345 678",
        left: 24,
        top: 132,
        size: 8,
        width: 140,
        color: MUTED,
      }),
      text({
        role: "email",
        content: "hello@northwind.co",
        left: 24,
        top: 146,
        size: 8,
        width: 140,
        color: MUTED,
      }),
      text({
        role: "website",
        content: "northwind.co",
        left: 24,
        top: 160,
        size: 8,
        width: 140,
        color: MUTED,
      }),
    ],
  }),
};
