"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { useAdminSession, useAdminUsers } from "@/hooks/useAdmin";
import type { UserListQuery, UserRole } from "@/lib/api/admin";
import { UserRow } from "./UserRow";

const PAGE_SIZE = 25;

const SELECT =
  "h-9 rounded-md border border-hairline bg-panel px-2 text-sm text-ink-800 outline-none focus:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100";

/** Waits for typing to pause, so the API sees "rahman", not r-a-h-m-a-n. */
function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

export function UsersScreen() {
  const t = useT().admin;
  const copy = t.users;
  const selfId = useAdminSession().data?.user?.id;

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search.trim(), 300);

  // A new filter starts from the first page; page 3 of the old results may not exist.
  useEffect(() => setPage(1), [debouncedSearch, role, status]);

  const query: UserListQuery = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  };
  const { data, isPending, isError, isFetching, refetch } = useAdminUsers(query);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-ink-900">{copy.title}</h1>
        {data ? <p className="text-sm text-ink-500">{copy.count(data.total)}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">{copy.search}</span>
          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
            className={`${SELECT} w-full pl-8`}
          />
        </label>
        <select
          aria-label={copy.columns.role}
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole | "")}
          className={SELECT}
        >
          <option value="">{copy.allRoles}</option>
          <option value="user">{copy.roleUser}</option>
          <option value="admin">{copy.roleAdmin}</option>
        </select>
        <select
          aria-label={copy.columns.status}
          value={status}
          onChange={(event) => setStatus(event.target.value as "active" | "inactive" | "")}
          className={SELECT}
        >
          <option value="">{copy.allStatuses}</option>
          <option value="active">{copy.active}</option>
          <option value="inactive">{copy.inactive}</option>
        </select>
        {isFetching && !isPending ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin text-ink-400" />
        ) : null}
      </div>

      {isPending ? (
        <p className="flex items-center gap-2 text-sm text-ink-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.common.loading}
        </p>
      ) : isError ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-danger-ink">{t.common.failed}</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            {t.common.retry}
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline bg-panel px-6 py-10 text-center text-sm text-ink-500">
          {copy.empty}
        </p>
      ) : (
        <>
          {/* The table scrolls inside its card so the page itself never does. */}
          <div className="overflow-x-auto rounded-xl border border-hairline bg-panel px-4">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs text-ink-500">
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.account}</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.role}</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.status}</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.signIn}</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.designs}</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">{copy.columns.lastLogin}</th>
                  <th scope="col" className="py-2.5 font-medium">{copy.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <UserRow key={user.id} user={user} isSelf={user.id === selfId} />
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {t.common.previous}
              </Button>
              <span className="text-xs text-ink-500">{t.common.pageOf(page, pages)}</span>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                {t.common.next}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
