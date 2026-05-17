import api from "./api";
import { jwtDecode } from "jwt-decode";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  is_company: boolean;
  is_customer: boolean;
  company?: {
    id: number;
    company_name: string;
    status: string;
    is_verified: boolean;
  };
}

interface DecodedToken {
  user_id: number;
  username: string;
  email?: string;
  is_admin: boolean;
  is_company: boolean;
  is_customer: boolean;
  company_id?: number;
  company_name?: string;
  company_status?: string;
  exp: number;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export type LoginResult =
  | { success: true; user: User; isAdmin: boolean; isCompany: boolean; isCustomer: boolean }
  | { success: false; error: string };

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async (
  emailOrUsername: string,
  password: string
): Promise<LoginResult> => {
  try {
    const { data } = await api.post<LoginResponse>("login/", {
      username: emailOrUsername,
      password,
    });

    const { access, refresh, user } = data;

    // Validate token is decodable before persisting
    jwtDecode<DecodedToken>(access);

    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return {
      success: true,
      user,
      isAdmin: user.is_admin,
      isCompany: user.is_company,
      isCustomer: user.is_customer,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.detail ?? "Email/Utilizador ou senha inválidos",
    };
  }
};

export const logout = (): void => {
  ["token", "refresh", "user", "cart"].forEach((k) =>
    localStorage.removeItem(k)
  );
  sessionStorage.clear();
  window.location.href = "/login";
};

export const refreshToken = async (): Promise<boolean> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;

  try {
    const { data } = await api.post<{ access: string }>("refresh/", {
      refresh,
    });
    localStorage.setItem("token", data.access);
    return true;
  } catch {
    logout();
    return false;
  }
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return true;
  try {
    const { exp } = jwtDecode<DecodedToken>(token);
    return exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

export const isAuthenticated = (): boolean =>
  !!localStorage.getItem("token") && !isTokenExpired();

// ─── User helpers ─────────────────────────────────────────────────────────────

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => getCurrentUser()?.is_admin ?? false;
export const isCompany = (): boolean => getCurrentUser()?.is_company ?? false;
export const isCustomer = (): boolean => getCurrentUser()?.is_customer ?? false;

export const getUserType = (): "admin" | "company" | "customer" | null => {
  const user = getCurrentUser();
  if (!user) return null;
  if (user.is_admin) return "admin";
  if (user.is_company) return "company";
  return "customer";
};

export const getCompanyInfo = (): User["company"] | null =>
  getCurrentUser()?.company ?? null;