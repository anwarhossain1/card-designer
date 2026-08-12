"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDesign, listDesigns } from "@/lib/api/designs";
import { useSession } from "./useSession";

export const DESIGNS_KEY = ["designs"] as const;

/**
 * Every card this browser or account owns, newest first.
 *
 * Keyed on the signed-in user so signing in or out swaps the list rather than
 * showing the previous identity's cards until something invalidates them.
 */
export function useDesigns() {
  const { user } = useSession();

  return useQuery({
    queryKey: [...DESIGNS_KEY, user?.id ?? "guest"],
    queryFn: listDesigns,
    staleTime: 30_000,
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDesign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGNS_KEY }),
  });
}
