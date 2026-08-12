"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { useDeleteDesign } from "@/hooks/useDesigns";
import { formatRelativeTime } from "@/lib/utils/time";
import type { DesignSummary } from "@/lib/api/designs";

export function DesignCard({ design }: { design: DesignSummary }) {
  const t = useT().designs;
  const { locale } = useI18n();
  const remove = useDeleteDesign();
  const [isConfirming, setIsConfirming] = useState(false);

  const name = design.name.trim() || t.untitled;

  return (
    <li className="group relative">
      <Link
        href={`/editor?design=${design.id}`}
        aria-label={t.open(name)}
        className="block overflow-hidden rounded-xl border border-hairline bg-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
      >
        <div className="grid aspect-[3.5/2] place-items-center bg-workspace p-3">
          {design.thumbnail ? (
            /* A data URL of our own making; next/image would only add a proxy. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={design.thumbnail}
              alt=""
              className="h-full w-full rounded-sm object-contain"
            />
          ) : (
            // Never drawn on, or never synced. A blank card is the honest picture.
            <div className="h-full w-full rounded-sm border border-hairline bg-white" />
          )}
        </div>

        <div className="border-t border-hairline px-3 py-2.5">
          <p className="truncate text-sm font-medium text-ink-900">{name}</p>
          <p className="mt-0.5 text-xs text-ink-400">
            {t.edited(formatRelativeTime(design.updatedAt, locale))}
          </p>
        </div>
      </Link>

      {/*
        Outside the Link on purpose: an anchor must not contain a button, and
        nesting them makes the delete target unreachable by keyboard.
      */}
      <div className="absolute right-2 top-2">
        {isConfirming ? (
          <div className="flex items-center gap-0.5 rounded-lg border border-hairline bg-panel/95 p-1 shadow-panel backdrop-blur">
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(design.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger-ink transition-colors hover:bg-ink-100 disabled:opacity-60"
            >
              {remove.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : null}
              {remove.isPending ? t.removing : t.removeConfirm}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className="rounded-md px-2 py-1 text-xs text-ink-600 transition-colors hover:bg-ink-100"
            >
              {t.removeCancel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={t.remove}
            onClick={() => setIsConfirming(true)}
            /* Always reachable on touch, revealed on hover on a pointer. */
            className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-panel/95 text-ink-500 shadow-panel backdrop-blur transition-all hover:text-danger-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}
