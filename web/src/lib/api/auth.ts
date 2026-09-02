import { ApiError, apiRequest } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export const register = (body: Registration) =>
  apiRequest<AuthUser>("/auth/register", { method: "POST", body });

export const login = (body: Credentials) =>
  apiRequest<AuthUser>("/auth/login", { method: "POST", body });

/** `credential` is the ID token Google Identity Services minted in-browser. */
export const loginWithGoogle = (body: { credential: string }) =>
  apiRequest<AuthUser>("/auth/google", { method: "POST", body });

export const logout = () =>
  apiRequest<{ signedOut: boolean }>("/auth/logout", { method: "POST" });

/** `locale` decides which language the email arrives in. */
export const requestPasswordReset = (body: { email: string; locale: string }) =>
  apiRequest<{ sent: boolean }>("/auth/forgot-password", {
    method: "POST",
    body,
  });

export const resetPassword = (body: {
  token: string;
  password: string;
  locale: string;
}) => apiRequest<{ reset: boolean }>("/auth/reset-password", {
  method: "POST",
  body,
});

/**
 * The signed-in user, or null.
 *
 * A 401 here is the ordinary case rather than a failure: the access cookie
 * lasts minutes while the refresh cookie lasts a week, so one silent refresh
 * is what separates "signed out" from "sat still for a quarter of an hour".
 * Refresh returns the user as well, so the retry costs one request, not two.
 */
export async function fetchSession(): Promise<AuthUser | null> {
  try {
    return await apiRequest<AuthUser>("/auth/me");
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  try {
    return await apiRequest<AuthUser>("/auth/refresh", { method: "POST" });
  } catch {
    return null;
  }
}
