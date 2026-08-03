import type { CardTemplate } from "@/types/template";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/config/document";
import { block, centred, logoSlot, text } from "./helpers";

const GOLD = "#c9a44c";
const IVORY = "#f6f1e7";
const MUTED = "#a99a7c";

export const luxuryTemplate: CardTemplate = {
  id: "luxury-01",
  name: "Luxury",
  category: "luxury",
  description: "Serif letterforms, gold rule, deep charcoal.",
  palette: ["#0f0d0b", GOLD, IVORY],
  fonts: ["Playfair Display", "Inter"],

  build: () => ({
    background: { kind: "solid", color: "#0f0d0b" },
    objects: [
      block({
        left: 10,
        top: 10,
        width: CANVAS_WIDTH - 20,
        height: CANVAS_HEIGHT - 20,
        stroke: GOLD,
        strokeWidth: 0.75,
        name: "Border",
      }),
      logoSlot({
        left: (CANVAS_WIDTH - 26) / 2,
        top: 24,
        size: 26,
        stroke: GOLD,
        textColor: GOLD,
        radius: 13,
      }),
      text(
        centred({
          role: "name",
          content: "Your Name",
          top: 66,
          size: 22,
          width: 260,
          family: "Playfair Display",
          color: IVORY,
          spacing: 20,
        }),
      ),
      block({
        left: (CANVAS_WIDTH - 44) / 2,
        top: 100,
        width: 44,
        height: 1,
        fill: GOLD,
        name: "Gold rule",
      }),
      text(
        centred({
          role: "title",
          content: "JOB TITLE",
          top: 112,
          size: 7,
          width: 240,
          color: MUTED,
          spacing: 320,
        }),
      ),
      text(
        centred({
          role: "phone",
          content: "+880 1712 345 678   ·   northwind.co",
          top: 140,
          size: 7.5,
          width: 280,
          color: MUTED,
          spacing: 60,
        }),
      ),
      text(
        centred({
          role: "email",
          content: "hello@northwind.co",
          top: 156,
          size: 7.5,
          width: 280,
          color: GOLD,
          spacing: 60,
        }),
      ),
    ],
  }),
};
