"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { useAdminStats } from "@/hooks/useAdmin";
import { SignupsChart } from "./SignupsChart";

function StatTile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number;
  hint: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </>
  );

  const className =
    "block rounded-xl border border-hairline bg-panel p-4 transition-colors";

  return href ? (
    <Link href={href} className={`${className} hover:border-brand-300`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function OverviewScreen() {
  const t = useT().admin;
  const { data, isPending, isError, refetch } = useAdminStats();

  if (isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.common.loading}
      </p>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-danger-ink">
          {t.common.failed}
        </p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          {t.common.retry}
        </Button>
      </div>
    );
  }

  const { users, designs, templates, signupsByDay } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-900">{t.nav.overview}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label={t.overview.users}
          value={users.total}
          hint={t.overview.usersHint(users.active, users.admins)}
          href="/admin/users"
        />
        <StatTile
          label={t.overview.newUsers}
          value={users.newLast7Days}
          hint={t.overview.newUsersHint}
        />
        <StatTile
          label={t.overview.designs}
          value={designs.total}
          hint={t.overview.designsHint(designs.byAccounts, designs.byGuests)}
        />
        <StatTile
          label={t.overview.templates}
          value={templates.published}
          hint={t.overview.templatesHint(templates.drafts)}
          href="/admin/templates"
        />
      </div>

      <SignupsChart days={signupsByDay} />
    </div>
  );
}
