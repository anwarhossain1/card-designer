import type { CardSide } from "@/types/document";
import type { TemplateCategory } from "@/types/template";
import type { AuthUser } from "./auth";
import { ApiError, apiRequest } from "./client";

/**
 * The admin API (`/api/admin/*`). Every call here needs an active admin; the
 * server checks the role in its database on each request, so nothing in this
 * file is a security boundary — it only decides what to show.
 */

type RequestOptions = Parameters<typeof apiRequest>[1];

/**
 * An admin page can sit open longer than the access cookie lives. A 401 gets
 * one silent refresh and a retry, the same trade `fetchSession` makes, so an
 * admin who went for tea comes back to a working page rather than an error.
 */
async function adminRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  try {
    return await apiRequest<T>(path, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  await apiRequest("/auth/refresh", { method: "POST" });
  return apiRequest<T>(path, options);
}

/* ---------------------------------------------------------------- session */

export const fetchAdminSession = () => adminRequest<AuthUser>("/admin/session");

/* ------------------------------------------------------------------ users */

export type UserRole = "user" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  signIn: { password: boolean; google: boolean };
  designCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserDetail extends AdminUser {
  activeSessions: number;
}

export interface UserListQuery {
  search?: string;
  role?: UserRole;
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

const toQueryString = (query: object) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : "";
};

export const listUsers = (query: UserListQuery) =>
  adminRequest<Page<AdminUser>>(`/admin/users${toQueryString(query)}`);

export const setUserActive = (id: string, active: boolean) =>
  adminRequest<AdminUserDetail>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { active },
  });

export const setUserRole = (id: string, role: UserRole) =>
  adminRequest<AdminUserDetail>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });

export const sendUserPasswordReset = (id: string, locale: string) =>
  adminRequest<{ sent: boolean }>(`/admin/users/${id}/password-reset`, {
    method: "POST",
    body: { locale },
  });

/* -------------------------------------------------------------- templates */

export interface TemplateRecord {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  palette: string[];
  tags: string[];
  fonts: string[];
  thumbnail: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateWithSides extends TemplateRecord {
  sides: CardSide[];
}

export interface TemplateListQuery {
  status: "all" | "published" | "draft";
  search?: string;
}

export interface NewTemplate {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  fonts: string[];
  sides: CardSide[];
  thumbnail: string | null;
}

export type TemplateChanges = Partial<
  Pick<TemplateRecord, "name" | "category" | "description" | "tags" | "published">
>;

export const listAdminTemplates = (query: TemplateListQuery) =>
  adminRequest<TemplateRecord[]>(`/admin/templates${toQueryString(query)}`);

export const createTemplate = (body: NewTemplate) =>
  adminRequest<TemplateWithSides>("/admin/templates", { method: "POST", body });

export const updateTemplate = (slug: string, body: TemplateChanges) =>
  adminRequest<TemplateWithSides>(`/admin/templates/${slug}`, {
    method: "PATCH",
    body,
  });

export const deleteTemplate = (slug: string) =>
  adminRequest<void>(`/admin/templates/${slug}`, { method: "DELETE" });

/* ------------------------------------------------------------------ stats */

export interface AdminStats {
  users: { total: number; active: number; admins: number; newLast7Days: number };
  designs: { total: number; byAccounts: number; byGuests: number };
  templates: { published: number; drafts: number };
  signupsByDay: { date: string; count: number }[];
}

export const fetchAdminStats = () => adminRequest<AdminStats>("/admin/stats");
