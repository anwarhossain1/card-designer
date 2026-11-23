"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import {
  useSendPasswordReset,
  useSetUserActive,
  useSetUserRole,
} from "@/hooks/useAdmin";
import type { AdminUser } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/time";

type Pending = "deactivate" | "remove-admin" | null;

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function Badge({ tone, children }: { tone: "brand" | "muted" | "danger"; children: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        tone === "brand" && "bg-brand-50 text-brand-700",
        tone === "muted" && "bg-ink-100 text-ink-600",
        tone === "danger" && "bg-danger-surface text-danger-ink",
      )}
    >
      {children}
    </span>
  );
}

/**
 * One account in the users table. Destructive changes (deactivating, taking
 * away admin) ask once inline; granting access and sending a reset email do
 * not, since both are easy to undo or harmless to repeat.
 */
export function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const { t, locale } = useI18n();
  const copy = t.admin.users;
  const [confirming, setConfirming] = useState<Pending>(null);

  const setActive = useSetUserActive();
  const setRole = useSetUserRole();
  const sendReset = useSendPasswordReset();
  const isBusy = setActive.isPending || setRole.isPending || sendReset.isPending;
  const error = setActive.error ?? setRole.error ?? sendReset.error;

  const signIn = [
    user.signIn.password ? copy.password : null,
    user.signIn.google ? copy.google : null,
  ].filter(Boolean);

  const runConfirmed = () => {
    if (confirming === "deactivate") {
      setActive.mutate({ id: user.id, active: false });
    } else if (confirming === "remove-admin") {
      setRole.mutate({ id: user.id, role: "user" });
    }
    setConfirming(null);
  };

  return (
    <tr className="border-b border-hairline align-top last:border-b-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-ink-900">
          {user.name}
          {isSelf ? <span className="ml-1.5 text-xs font-normal text-ink-400">({copy.you})</span> : null}
        </p>
        <p className="text-xs text-ink-500">{user.email}</p>
      </td>
      <td className="py-3 pr-4">
        <Badge tone={user.role === "admin" ? "brand" : "muted"}>
          {user.role === "admin" ? copy.roleAdmin : copy.roleUser}
        </Badge>
      </td>
      <td className="py-3 pr-4">
        <Badge tone={user.isActive ? "muted" : "danger"}>
          {user.isActive ? copy.active : copy.inactive}
        </Badge>
      </td>
      <td className="py-3 pr-4 text-xs text-ink-600">{signIn.join(" · ") || "—"}</td>
      <td className="py-3 pr-4 tabular-nums text-ink-700">{user.designCount}</td>
      <td className="py-3 pr-4 text-xs text-ink-500">
        {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt, locale) : t.admin.common.never}
      </td>
      <td className="py-3">
        {isSelf ? (
          <p className="max-w-48 text-xs text-ink-400">{copy.selfHint}</p>
        ) : confirming ? (
          <div className="max-w-64 space-y-2">
            <p className="text-xs text-ink-700">
              {confirming === "deactivate"
                ? copy.confirmDeactivate(user.name)
                : copy.confirmRemoveAdmin(user.name)}
            </p>
            <div className="flex gap-1.5">
              <Button size="sm" onClick={runConfirmed}>
                {copy.confirm}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                {t.admin.common.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {user.role === "admin" ? (
              <Button size="sm" variant="outline" disabled={isBusy} onClick={() => setConfirming("remove-admin")}>
                {copy.removeAdmin}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={isBusy || !user.isActive}
                onClick={() => setRole.mutate({ id: user.id, role: "admin" })}
              >
                {copy.makeAdmin}
              </Button>
            )}

            {user.isActive ? (
              <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => setConfirming("deactivate")}>
                {copy.deactivate}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={() => setActive.mutate({ id: user.id, active: true })}
              >
                {copy.reactivate}
              </Button>
            )}

            {user.isActive ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy || sendReset.isSuccess}
                onClick={() => sendReset.mutate({ id: user.id, locale })}
              >
                {sendReset.isSuccess ? copy.resetSent : copy.sendReset}
              </Button>
            ) : null}

            {isBusy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin text-ink-400" /> : null}
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-1.5 text-xs text-danger-ink">
            {errorText(error)}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
