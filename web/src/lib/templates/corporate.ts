import type { CardTemplate } from "@/types/template";
import { CANVAS_HEIGHT } from "@/config/document";
import { block, logoSlot, text } from "./helpers";

const NAVY = "#12325c";
const MUTED = "#6b7280";

export const corporateTemplate: CardTemplate = {
  id: "corporate-01",
  name: "Corporate",
  category: "corporate",
  description: "Structured sidebar, dependable navy palette.",
  palette: ["#ffffff", NAVY, MUTED],
  fonts: ["Inter"],

  build: () => ({
    background: { kind: "solid", color: "#ffffff" },
    objects: [
      block({
        left: 0,
        top: 0,
        width: 100,
        height: CANVAS_HEIGHT,
        fill: NAVY,
        name: "Sidebar",
      }),
      logoSlot({
        left: 34,
        top: 74,
        size: 32,
        stroke: "#ffffff",
        textColor: "#ffffff",
        radius: 16,
      }),
      text({
        role: "name",
        content: "Your Name",
        left: 124,
        top: 56,
        size: 18,
        width: 190,
        color: NAVY,
        weight: 600,
      }),
      text({
        role: "title",
        content: "JOB TITLE",
        left: 124,
        top: 82,
        size: 7.5,
        width: 190,
        color: MUTED,
        spacing: 260,
      }),
      block({
        left: 124,
        top: 100,
        width: 186,
        height: 1,
        fill: "#e4e6eb",
        name: "Divider",
      }),
      text({
        role: "phone",
        content: "+880 1712 345 678",
        left: 124,
        top: 116,
        size: 8,
        width: 186,
        color: MUTED,
      }),
      text({
        role: "email",
        content: "hello@northwind.co",
        left: 124,
        top: 132,
        size: 8,
        width: 186,
        color: MUTED,
      }),
      text({
        role: "website",
        content: "northwind.co",
        left: 124,
        top: 148,
        size: 8,
        width: 186,
        color: NAVY,
        weight: 500,
      }),
    ],
  }),
};
