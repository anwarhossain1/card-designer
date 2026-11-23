"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteTemplate,
  fetchAdminSession,
  fetchAdminStats,
  listAdminTemplates,
  listUsers,
  sendUserPasswordReset,
  setUserActive,
  setUserRole,
  updateTemplate,
  type TemplateChanges,
  type TemplateListQuery,
  type UserListQuery,
  type UserRole,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { useSession } from "./useSession";

const ADMIN_KEY = ["admin"] as const;
const USERS_KEY = [...ADMIN_KEY, "users"] as const;
const TEMPLATES_KEY = [...ADMIN_KEY, "templates"] as const;
const STATS_KEY = [...ADMIN_KEY, "stats"] as const;

/**
 * Whether this browser may see the admin pages: the admin, or null for a
 * 401/403. Those two are answers rather than faults, so they come back as
 * data; anything else (server down) is left as an error to retry.
 */
export function useAdminSession() {
  /*
   * Keyed on the app-wide session, so signing out (or in as someone else)
   * from the header asks the question again instead of trusting a cached yes.
   */
  const { user, isPending } = useSession();

  return useQuery({
    queryKey: [...ADMIN_KEY, "session", user?.id ?? null],
    enabled: !isPending,
    queryFn: async () => {
      try {
        return { user: await fetchAdminSession(), status: 200 };
      } catch (error) {
        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          return { user: null, status: error.status };
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export const useAdminStats = () =>
  useQuery({ queryKey: STATS_KEY, queryFn: fetchAdminStats });

export const useAdminUsers = (query: UserListQuery) =>
  useQuery({
    queryKey: [...USERS_KEY, query],
    queryFn: () => listUsers(query),
    // Typing in the search box should not blank the table between pages.
    placeholderData: keepPreviousData,
  });

/**
 * Every user change can move a count on the overview (admins, active), so
 * stats are invalidated alongside the list.
 */
function useAdminMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  keys: readonly (readonly string[])[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all(
        keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

export const useSetUserActive = () =>
  useAdminMutation(
    ({ id, active }: { id: string; active: boolean }) => setUserActive(id, active),
    [USERS_KEY, STATS_KEY],
  );

export const useSetUserRole = () =>
  useAdminMutation(
    ({ id, role }: { id: string; role: UserRole }) => setUserRole(id, role),
    [USERS_KEY, STATS_KEY],
  );

export const useSendPasswordReset = () =>
  useMutation({
    mutationFn: ({ id, locale }: { id: string; locale: string }) =>
      sendUserPasswordReset(id, locale),
  });

export const useAdminTemplates = (query: TemplateListQuery) =>
  useQuery({
    queryKey: [...TEMPLATES_KEY, query],
    queryFn: () => listAdminTemplates(query),
    placeholderData: keepPreviousData,
  });

/** Publishing changes what the editor's catalogue shows, so that refreshes too. */
const TEMPLATE_KEYS = [TEMPLATES_KEY, STATS_KEY, ["server-templates"]] as const;

export const useUpdateTemplate = () =>
  useAdminMutation(
    ({ slug, changes }: { slug: string; changes: TemplateChanges }) =>
      updateTemplate(slug, changes),
    TEMPLATE_KEYS,
  );

export const useDeleteTemplate = () =>
  useAdminMutation((slug: string) => deleteTemplate(slug), TEMPLATE_KEYS);

export { TEMPLATE_KEYS as ADMIN_TEMPLATE_KEYS };
