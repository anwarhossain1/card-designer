import type { QrDataKind } from "@/types/element";

export interface QrVcard {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
}

export interface QrConfig {
  kind: QrDataKind;
  website: string;
  phone: string;
  email: string;
  vcard: QrVcard;
  darkColor: string;
  lightColor: string;
  /** Quiet zone, in QR modules. Scanners need at least 1–2. */
  margin: number;
  transparentBackground: boolean;
}

export const DEFAULT_QR_CONFIG: QrConfig = {
  kind: "website",
  website: "",
  phone: "",
  email: "",
  vcard: {
    firstName: "",
    lastName: "",
    title: "",
    company: "",
    phone: "",
    email: "",
    website: "",
  },
  darkColor: "#11141c",
  lightColor: "#ffffff",
  margin: 2,
  transparentBackground: false,
};

export const QR_KINDS: { id: QrDataKind; label: string }[] = [
  { id: "website", label: "Website" },
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "vcard", label: "vCard" },
];

const escapeVcard = (value: string) =>
  value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

const withScheme = (url: string) =>
  /^[a-z][\w+.-]*:/i.test(url) ? url : `https://${url}`;

function buildVcard(vcard: QrVcard): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(vcard.lastName)};${escapeVcard(vcard.firstName)};;;`,
    `FN:${escapeVcard(`${vcard.firstName} ${vcard.lastName}`.trim())}`,
  ];

  if (vcard.title) lines.push(`TITLE:${escapeVcard(vcard.title)}`);
  if (vcard.company) lines.push(`ORG:${escapeVcard(vcard.company)}`);
  if (vcard.phone) lines.push(`TEL;TYPE=CELL:${escapeVcard(vcard.phone)}`);
  if (vcard.email) lines.push(`EMAIL:${escapeVcard(vcard.email)}`);
  if (vcard.website) lines.push(`URL:${withScheme(vcard.website)}`);

  lines.push("END:VCARD");
  return lines.join("\n");
}

/** The string that actually gets encoded, in the scheme each scanner expects. */
export function encodeQrPayload(config: QrConfig): string {
  switch (config.kind) {
    case "website":
      return config.website.trim() ? withScheme(config.website.trim()) : "";
    case "phone":
      return config.phone.trim() ? `tel:${config.phone.replace(/\s+/g, "")}` : "";
    case "email":
      return config.email.trim() ? `mailto:${config.email.trim()}` : "";
    case "vcard":
      return config.vcard.firstName || config.vcard.lastName
        ? buildVcard(config.vcard)
        : "";
  }
}

/** Short label for the layers panel. */
export function describeQr(config: QrConfig): string {
  switch (config.kind) {
    case "website":
      return config.website || "QR code";
    case "phone":
      return config.phone || "QR code";
    case "email":
      return config.email || "QR code";
    case "vcard":
      return `${config.vcard.firstName} ${config.vcard.lastName}`.trim() || "vCard QR";
  }
}
