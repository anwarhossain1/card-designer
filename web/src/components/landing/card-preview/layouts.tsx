import type { CSSProperties } from "react";
import type { CardPreviewData } from "./data";

/**
 * Five CSS card layouts, sized entirely in container-query units so a preview
 * looks identical at 180px or 600px wide. Each maps to a bundled template.
 */

export interface LayoutProps {
  data: CardPreviewData;
}

const px = (value: number) => `${value}cqw`;

const stack: CSSProperties = { display: "flex", flexDirection: "column" };

function Contacts({
  data,
  size = 2.9,
  gap = 1,
  align = "flex-start",
}: LayoutProps & { size?: number; gap?: number; align?: CSSProperties["alignItems"] }) {
  return (
    <div
      style={{
        ...stack,
        gap: px(gap),
        alignItems: align,
        fontSize: px(size),
        color: data.muted,
        lineHeight: 1.2,
      }}
    >
      <span>{data.person.phone}</span>
      <span>{data.person.email}</span>
      <span>{data.person.website}</span>
    </div>
  );
}

function Monogram({ data, size = 9 }: LayoutProps & { size?: number }) {
  return (
    <div
      style={{
        width: px(size),
        height: px(size),
        borderRadius: px(size * 0.28),
        background: data.accent,
        color: data.background.startsWith("#") ? data.background : "#11141c",
        display: "grid",
        placeItems: "center",
        fontSize: px(size * 0.44),
        fontWeight: 700,
        letterSpacing: px(0.1),
      }}
    >
      NW
    </div>
  );
}

export function ModernLayout({ data }: LayoutProps) {
  return (
    <div style={{ ...stack, height: "100%", justifyContent: "space-between", padding: px(7) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Monogram data={data} />
        <span style={{ fontSize: px(2.8), letterSpacing: px(0.5), color: data.muted, textTransform: "uppercase" }}>
          {data.person.company}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: px(4) }}>
        <div style={stack}>
          <span style={{ fontSize: px(7.4), fontWeight: 600, color: data.ink, lineHeight: 1.05 }}>
            {data.person.name}
          </span>
          <span style={{ fontSize: px(3), letterSpacing: px(0.4), color: data.accent, textTransform: "uppercase", marginTop: px(1.4) }}>
            {data.person.title}
          </span>
        </div>
        <Contacts data={data} align="flex-end" />
      </div>
    </div>
  );
}

export function MinimalLayout({ data }: LayoutProps) {
  return (
    <div style={{ ...stack, height: "100%", justifyContent: "center", gap: px(3), padding: px(9) }}>
      <span style={{ fontSize: px(7), fontWeight: 500, color: data.ink, letterSpacing: px(-0.1) }}>
        {data.person.name}
      </span>
      <span style={{ fontSize: px(2.9), letterSpacing: px(0.8), color: data.muted, textTransform: "uppercase" }}>
        {data.person.title}
      </span>
      <div style={{ height: px(0.3), width: px(18), background: data.accent, margin: `${px(1.5)} 0` }} />
      <div style={{ display: "flex", gap: px(3.5), fontSize: px(2.7), color: data.muted }}>
        <span>{data.person.phone}</span>
        <span>{data.person.website}</span>
      </div>
    </div>
  );
}

export function CorporateLayout({ data }: LayoutProps) {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div
        style={{
          width: "30%",
          background: data.accent,
          display: "grid",
          placeItems: "center",
        }}
      >
        <span style={{ color: "#ffffff", fontSize: px(6), fontWeight: 700, letterSpacing: px(0.4) }}>NW</span>
      </div>
      <div style={{ ...stack, flex: 1, justifyContent: "center", gap: px(1.4), padding: px(6) }}>
        <span style={{ fontSize: px(6.2), fontWeight: 600, color: data.ink }}>{data.person.name}</span>
        <span style={{ fontSize: px(2.9), letterSpacing: px(0.5), color: data.muted, textTransform: "uppercase" }}>
          {data.person.title}
        </span>
        <div style={{ height: px(0.25), width: "100%", background: "#e4e6eb", margin: `${px(1.6)} 0` }} />
        <Contacts data={data} size={2.7} gap={0.7} />
      </div>
    </div>
  );
}

export function CreativeLayout({ data }: LayoutProps) {
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: px(-16),
          right: px(-10),
          width: px(38),
          height: px(38),
          borderRadius: "50%",
          border: `${px(0.6)} solid rgba(255,255,255,0.45)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: px(-14),
          right: px(8),
          width: px(24),
          height: px(24),
          borderRadius: "50%",
          background: "rgba(255,255,255,0.16)",
        }}
      />
      <div style={{ ...stack, position: "relative", height: "100%", justifyContent: "space-between", padding: px(7) }}>
        <span style={{ fontSize: px(3), fontWeight: 600, letterSpacing: px(0.6), color: data.ink, textTransform: "uppercase" }}>
          {data.person.company}
        </span>
        <div style={stack}>
          <span style={{ fontSize: px(7.6), fontWeight: 700, color: data.ink, lineHeight: 1.05 }}>
            {data.person.name}
          </span>
          <span style={{ fontSize: px(3), color: data.muted, marginTop: px(1.2) }}>{data.person.title}</span>
          <div style={{ display: "flex", gap: px(3), fontSize: px(2.7), color: data.muted, marginTop: px(2.4) }}>
            <span>{data.person.email}</span>
            <span>{data.person.website}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LuxuryLayout({ data }: LayoutProps) {
  return (
    <div
      style={{
        ...stack,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: px(2),
        padding: px(7),
        border: `${px(0.3)} solid ${data.accent}`,
        borderRadius: "inherit",
        fontFamily: "var(--font-serif, Georgia, serif)",
      }}
    >
      <span style={{ fontSize: px(2.6), letterSpacing: px(1.2), color: data.accent, textTransform: "uppercase" }}>
        {data.person.company}
      </span>
      <span style={{ fontSize: px(7), color: data.ink, letterSpacing: px(0.2) }}>{data.person.name}</span>
      <div style={{ height: px(0.25), width: px(14), background: data.accent }} />
      <span style={{ fontSize: px(2.7), letterSpacing: px(0.9), color: data.muted, textTransform: "uppercase" }}>
        {data.person.title}
      </span>
      <span style={{ fontSize: px(2.6), color: data.muted, marginTop: px(1.6) }}>
        {data.person.phone} · {data.person.website}
      </span>
    </div>
  );
}

export const LAYOUTS = {
  modern: ModernLayout,
  minimal: MinimalLayout,
  corporate: CorporateLayout,
  creative: CreativeLayout,
  luxury: LuxuryLayout,
} as const;
