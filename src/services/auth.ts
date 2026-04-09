import api from "./api";
import { jwtDecode } from "jwt-decode";

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

export const loginUser = async (emailOrUsername: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("login/", {
      username: emailOrUsername,  // O backend vai detectar se é email ou username
      password,
    });

    const { access, refresh, user } = response.data;

    // Decodificar o token para debug
    const decoded: DecodedToken = jwtDecode(access);
    
    console.log("=== DADOS DO LOGIN ===");
    console.log("Perfil:", user);
    console.log("Token decodificado:", decoded);
    console.log("======================");
    
    // Salvar tokens e informações do usuário
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return {
      success: true,
      user,
      isAdmin: user.is_admin,
      isCompany: user.is_company,
      isCustomer: user.is_customer
    };
    
  } catch (error: any) {
    console.error("Erro no login:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.detail || "Email/Usuário ou senha inválidos"
    };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  sessionStorage.clear();
  window.location.href = "/login";
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.is_admin || false;
};

export const isCompany = (): boolean => {
  const user = getCurrentUser();
  return user?.is_company || false;
};

export const isCustomer = (): boolean => {
  const user = getCurrentUser();
  return user?.is_customer || false;
};

export const getUserType = (): 'admin' | 'company' | 'customer' | null => {
  const user = getCurrentUser();
  if (!user) return null;
  if (user.is_admin) return 'admin';
  if (user.is_company) return 'company';
  return 'customer';
};

export const getCompanyInfo = () => {
  const user = getCurrentUser();
  return user?.company || null;
};

export const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;
  
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;
  
  try {
    const response = await api.post("refresh/", {
      refresh: refresh
    });
    
    localStorage.setItem("token", response.data.access);
    return true;
  } catch (error) {
    logout();
    return false;
  }
};