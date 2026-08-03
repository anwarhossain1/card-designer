import type { CardTemplate } from "@/types/template";
import { block, logoSlot, text } from "./helpers";

const INK = "#11141c";
const MUTED = "#8b929e";

export const minimalTemplate: CardTemplate = {
  id: "minimal-01",
  name: "Minimal",
  category: "minimal",
  description: "Generous whitespace and a single hairline rule.",
  palette: ["#ffffff", INK, MUTED],
  fonts: ["Inter"],

  build: () => ({
    background: { kind: "solid", color: "#ffffff" },
    objects: [
      logoSlot({
        left: 274,
        top: 24,
        size: 30,
        stroke: "#dcdfe4",
        textColor: MUTED,
      }),
      text({
        role: "name",
        content: "Your Name",
        left: 28,
        top: 60,
        size: 20,
        width: 200,
        color: INK,
        weight: 500,
        spacing: -10,
      }),
      text({
        role: "title",
        content: "JOB TITLE",
        left: 28,
        top: 90,
        size: 7.5,
        width: 180,
        color: MUTED,
        spacing: 300,
      }),
      block({
        left: 28,
        top: 110,
        width: 36,
        height: 1,
        fill: INK,
        name: "Rule",
      }),
      text({
        role: "phone",
        content: "+880 1712 345 678",
        left: 28,
        top: 134,
        size: 7.5,
        width: 130,
        color: MUTED,
      }),
      text({
        role: "email",
        content: "hello@northwind.co",
        left: 28,
        top: 148,
        size: 7.5,
        width: 130,
        color: MUTED,
      }),
      text({
        role: "website",
        content: "northwind.co",
        left: 28,
        top: 162,
        size: 7.5,
        width: 130,
        color: INK,
      }),
    ],
  }),
};
