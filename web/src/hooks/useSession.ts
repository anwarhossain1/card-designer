"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSession,
  login,
  loginWithGoogle,
  logout,
  register,
  type AuthUser,
} from "@/lib/api/auth";

export const SESSION_KEY = ["session"] as const;

/**
 * Who is signed in. One query for the whole app, so the header, the editor and
 * anything added later all read the same cached answer.
 */
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_KEY,
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    // fetchSession already answers "signed out" with null; anything it throws
    // is a real fault and retrying would just delay showing it.
    retry: false,
  });

  return { user: query.data ?? null, isPending: query.isPending };
}

function useAuthMutation<TInput>(
  mutationFn: (input: TInput) => Promise<AuthUser>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    // The response is the user, so the session is known without a refetch.
    onSuccess: (user) => queryClient.setQueryData(SESSION_KEY, user),
  });
}

export const useLogin = () => useAuthMutation(login);
export const useRegister = () => useAuthMutation(register);
export const useGoogleLogin = () => useAuthMutation(loginWithGoogle);

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    /*
     * Cleared on settle, not on success. A failed logout request still tends
     * to mean the cookies are gone or unusable, and leaving the UI insisting
     * someone is signed in when they cannot act is the worse failure.
     */
    onSettled: () => queryClient.setQueryData(SESSION_KEY, null),
  });
}
