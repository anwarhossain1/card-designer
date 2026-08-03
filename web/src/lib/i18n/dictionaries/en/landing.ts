/*
 * No `as const` anywhere in the English dictionaries: literal types would make
 * the reference shape demand the exact English text, which no translation can
 * satisfy. Plain `string` still catches missing, renamed or misshaped keys.
 */
export const landing = {
  nav: {
    templates: "Templates",
    features: "Features",
    howItWorks: "How it works",
    startDesigning: "Start Designing",
  },
  hero: {
    badge: "No sign-up. Nothing to install.",
    titleLead: "Design a business card you'd actually",
    titleAccent: "hand out",
    /** Sentence-final punctuation: Bangla ends on a dari, not a full stop. */
    titleEnd: ".",
    subtitle:
      "A focused editor for one job. Start from a template or a blank card, drag things where you want them, and download a print-ready file in seconds.",
    browseTemplates: "Browse templates",
    facts: ["3.5 × 2 in", "300 DPI print-ready", "PNG · JPEG · PDF"],
  },
  templates: {
    eyebrow: "Templates",
    title: "Five starting points, all fully editable",
    description:
      "Every template arrives filled in — name, title, phone, email, website and a logo slot. Change anything, or strip it back to a blank card.",
    blankTitle: "Start from blank",
    blankBody: "An empty 3.5 × 2 in card with guides, safe area and bleed ready.",
  },
  features: {
    eyebrow: "Features",
    title: "Everything a card needs. Nothing it doesn't.",
    description:
      "We left out the 400-feature design suite and kept the tools that actually shape a business card.",
    items: {
      type: {
        title: "Type that behaves",
        body: "Font, size, weight, letter spacing, line height, alignment and colour — with live preview on the card.",
      },
      shapes: {
        title: "Shapes & icons",
        body: "Rectangles, circles, triangles and lines, plus contact and social icons you can recolour and resize.",
      },
      qr: {
        title: "Built-in QR codes",
        body: "Generate a QR from your website, phone, email or a full vCard, then place it anywhere on the card.",
      },
      layers: {
        title: "Real layer control",
        body: "Reorder, lock, hide, duplicate and delete. Everything on the card stays reachable.",
      },
      print: {
        title: "Print-safe by default",
        body: "Bleed and safe-area guides, snapping and alignment rules keep artwork inside the trim.",
      },
      export: {
        title: "Export that prints",
        body: "PNG, JPEG or PDF at high resolution — with transparent background when you need it.",
      },
      shortcuts: {
        title: "Keyboard shortcuts",
        body: "Copy, paste, undo, redo, delete, nudge with arrows and multi-select the way you already expect.",
      },
      autosave: {
        title: "Autosave, no account",
        body: "Your design is stored in this browser and restored when you come back. Nothing to sign up for.",
      },
    },
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Three steps, about five minutes",
    steps: [
      {
        title: "Pick a starting point",
        body: "Choose one of five templates or open a blank 3.5 × 2 in card. No account, no wizard.",
      },
      {
        title: "Make it yours",
        body: "Swap the text, drop in your logo, adjust colours and add a QR code. Guides keep it print-safe.",
      },
      {
        title: "Download it",
        body: "Export PNG, JPEG or PDF at print resolution and send it to any printer you like.",
      },
    ],
  },
  cta: {
    title: "Your next card is a few clicks away",
    body: "Open the editor and start designing. Your work saves automatically in this browser.",
  },
  footer: {
    tagline: "Business cards, designed in the browser.",
    editor: "Editor",
    printSoon: "Print ordering coming soon",
  },
};
