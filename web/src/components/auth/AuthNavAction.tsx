"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useT } from "@/components/i18n/I18nProvider";
import { useSession } from "@/hooks/useSession";
import { UserMenu } from "./UserMenu";

/**
 * The header's account control: a sign-in button, or the signed-in menu.
 *
 * `next` is where to return after signing in — the editor passes its own path
 * so somebody signing in mid-design lands back on the card, not the homepage.
 */
export function AuthNavAction({ next }: { next?: string }) {
  const t = useT().auth;
  const { user, isPending } = useSession();

  // Holds the slot while the session resolves, so the header does not jump.
  if (isPending) {
    return <span aria-hidden className="h-8 w-8 shrink-0" />;
  }

  if (user) return <UserMenu user={user} />;

  return (
    <Link
      href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
      className="shrink-0"
    >
      <Button size="sm" variant="outline">
        {t.nav.signIn}
      </Button>
    </Link>
  );
}
