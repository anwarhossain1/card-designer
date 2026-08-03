import { Circle } from "fabric";
import type { CardTemplate } from "@/types/template";
import { attachMeta, createMeta } from "@/lib/canvas/meta";
import { logoSlot, text } from "./helpers";

const INK = "#ffffff";
const MUTED = "rgba(255,255,255,0.8)";

/** Decorative circles that bleed off the card edge. */
function circle(
  left: number,
  top: number,
  radius: number,
  options: { fill?: string; stroke?: string },
) {
  const shape = new Circle({
    left,
    top,
    radius,
    fill: options.fill ?? "",
    stroke: options.stroke ?? "",
    strokeWidth: options.stroke ? 1.5 : 0,
    strokeUniform: true,
    objectCaching: false,
  });

  return attachMeta(
    shape,
    createMeta({ kind: "shape", name: "Circle", role: "decoration" }),
  );
}

export const creativeTemplate: CardTemplate = {
  id: "creative-01",
  name: "Creative",
  category: "creative",
  description: "Gradient field with playful geometry.",
  palette: ["#6c4cff", "#12b5da", INK],
  fonts: ["Poppins"],

  build: () => ({
    background: { kind: "gradient", from: "#6c4cff", to: "#12b5da", angle: 135 },
    objects: [
      circle(238, -54, 58, { stroke: "rgba(255,255,255,0.45)" }),
      circle(276, 138, 40, { fill: "rgba(255,255,255,0.16)" }),
      logoSlot({
        left: 24,
        top: 20,
        size: 28,
        fill: INK,
        textColor: "#6c4cff",
        radius: 14,
      }),
      text({
        role: "name",
        content: "Your Name",
        left: 22,
        top: 78,
        size: 24,
        width: 220,
        family: "Poppins",
        color: INK,
        weight: 700,
        spacing: -20,
      }),
      text({
        role: "title",
        content: "Job Title",
        left: 24,
        top: 110,
        size: 9,
        width: 200,
        family: "Poppins",
        color: MUTED,
        weight: 500,
      }),
      text({
        role: "phone",
        content: "+880 1712 345 678",
        left: 24,
        top: 136,
        size: 8,
        width: 160,
        family: "Poppins",
        color: MUTED,
      }),
      text({
        role: "email",
        content: "hello@northwind.co",
        left: 24,
        top: 150,
        size: 8,
        width: 160,
        family: "Poppins",
        color: MUTED,
      }),
      text({
        role: "website",
        content: "northwind.co",
        left: 24,
        top: 164,
        size: 8,
        width: 160,
        family: "Poppins",
        color: INK,
        weight: 500,
      }),
    ],
  }),
};
