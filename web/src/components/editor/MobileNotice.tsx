"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/**
 * Shown instead of the editor on small screens. A cramped canvas with eight
 * panels is worse than an honest message.
 */
export function MobileNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />

      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Monitor className="h-6 w-6" />
      </span>

      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-ink-900">
          The editor needs a bigger screen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Business cards are precise work — the canvas, layer list and property
          controls need a desktop or tablet in landscape. Open CardCraft on a
          larger screen to start designing.
        </p>
      </div>

      <Link href="/">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
