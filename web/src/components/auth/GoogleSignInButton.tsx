"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useGoogleLogin } from "@/hooks/useSession";

/**
 * Ships to every browser by design — an OAuth client id is public, and the
 * matching server-side check is what actually gates sign-in.
 */
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const GSI_SRC = "https://accounts.google.com/gsi/client";

/** The slice of Google Identity Services this component touches. */
interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    ux_mode?: "popup" | "redirect";
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with";
      width?: number;
      locale?: string;
      logo_alignment?: "left" | "center";
    },
  ): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

/**
 * Waits for the GIS script, loading it if nobody has yet. Resolves null on
 * failure — the caller treats that as "no button", not an error page.
 */
function loadGoogleIdentity(): Promise<GoogleAccountsId | null> {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  return new Promise((resolve) => {
    const finish = () => resolve(window.google?.accounts?.id ?? null);

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    if (existing) {
      // Another instance is loading it; piggyback on the same script tag.
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

interface Props {
  mode: "sign-in" | "sign-up";
  /** Where to go once the session cookie is set. */
  onSignedIn: () => void;
  /** Receives a user-facing message when the exchange fails. */
  onError: (error: unknown) => void;
}

/**
 * Google's own button, not a lookalike: GIS draws it into the div below, in
 * the app's current language, and hands back an ID token that the server
 * verifies. Renders nothing at all when the client id is missing or the
 * script cannot load, so password auth never depends on Google being up.
 */
export function GoogleSignInButton({ mode, onSignedIn, onError }: Props) {
  const { locale, t } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const googleLogin = useGoogleLogin();

  // Refs so the GIS callback — registered once — sees current handlers.
  const handlers = useRef({ onSignedIn, onError });
  handlers.current = { onSignedIn, onError };
  const mutateRef = useRef(googleLogin.mutateAsync);
  mutateRef.current = googleLogin.mutateAsync;

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    void loadGoogleIdentity().then((google) => {
      if (cancelled) return;
      if (!google || !container.current) {
        // Blocked script or offline: collapse rather than leave a dead gap.
        setFailed(true);
        return;
      }

      google.initialize({
        client_id: CLIENT_ID,
        ux_mode: "popup",
        callback: ({ credential }) => {
          mutateRef.current({ credential }).then(
            () => handlers.current.onSignedIn(),
            (error: unknown) => handlers.current.onError(error),
          );
        },
      });

      // Re-rendered (not just restyled) on locale change: the label text
      // lives inside Google's iframe, out of this app's reach.
      container.current.replaceChildren();
      google.renderButton(container.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: mode === "sign-up" ? "signup_with" : "signin_with",
        width: 368,
        locale,
        logo_alignment: "center",
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [locale, mode]);

  if (!CLIENT_ID || failed) return null;

  return (
    <div className="mt-4">
      {/* The divider belongs to the button: no Google, no orphaned "or". */}
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-400">
        <span className="h-px flex-1 bg-hairline" aria-hidden />
        {t.auth.google.divider}
        <span className="h-px flex-1 bg-hairline" aria-hidden />
      </div>

      <div
        ref={container}
        className="mt-4 flex min-h-[44px] justify-center"
        // GIS renders nothing visible until ready; keep layout from jumping.
        style={ready ? undefined : { opacity: 0.01 }}
        data-testid="google-signin"
      />
    </div>
  );
}
