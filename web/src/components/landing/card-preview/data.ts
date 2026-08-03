import type { TemplateCategory } from "@/types/template";

/**
 * Marketing artwork for the landing page.
 *
 * These are lightweight CSS renderings, not the Fabric template scenes — the
 * homepage must stay static and instant. Ids match the bundled template ids so
 * every preview deep-links straight into the editor with that template applied.
 */
export interface CardPreviewData {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  background: string;
  accent: string;
  ink: string;
  muted: string;
  person: {
    name: string;
    title: string;
    company: string;
    phone: string;
    email: string;
    website: string;
  };
}

const PERSON = {
  name: "Ayesha Rahman",
  title: "Brand Strategist",
  company: "Northwind Studio",
  phone: "+880 1712 345 678",
  email: "ayesha@northwind.co",
  website: "northwind.co",
};

export const CARD_PREVIEWS: CardPreviewData[] = [
  {
    id: "modern-01",
    name: "Modern",
    category: "modern",
    description: "Bold type, dark canvas, one confident accent.",
    background: "#11141c",
    accent: "#6c4cff",
    ink: "#ffffff",
    muted: "#9aa0ad",
    person: PERSON,
  },
  {
    id: "minimal-01",
    name: "Minimal",
    category: "minimal",
    description: "Generous whitespace and a single hairline rule.",
    background: "#ffffff",
    accent: "#11141c",
    ink: "#11141c",
    muted: "#8b929e",
    person: PERSON,
  },
  {
    id: "corporate-01",
    name: "Corporate",
    category: "corporate",
    description: "Structured sidebar, dependable navy palette.",
    background: "#ffffff",
    accent: "#12325c",
    ink: "#12325c",
    muted: "#6b7280",
    person: PERSON,
  },
  {
    id: "creative-01",
    name: "Creative",
    category: "creative",
    description: "Gradient field with playful geometry.",
    background: "linear-gradient(135deg, #6c4cff 0%, #12b5da 100%)",
    accent: "#ffffff",
    ink: "#ffffff",
    muted: "rgba(255,255,255,0.78)",
    person: PERSON,
  },
  {
    id: "luxury-01",
    name: "Luxury",
    category: "luxury",
    description: "Serif letterforms, gold rule, deep charcoal.",
    background: "#0f0d0b",
    accent: "#c9a44c",
    ink: "#f6f1e7",
    muted: "#a99a7c",
    person: PERSON,
  },
];
