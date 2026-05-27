// services/security.service.ts
import { jwtDecode } from 'jwt-decode';
import DOMPurify from 'dompurify';

// Interfaces
interface DecodedToken {
  user_id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_company: boolean;
  is_customer: boolean;
  exp: number;
  iat: number;
}

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutTimeMinutes: number;
  tokenRefreshThreshold: number; // segundos antes de expirar
}

// Configuração
const SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutTimeMinutes: 15,
  tokenRefreshThreshold: 300, // 5 minutos
};

// 1. Validação robusta do token
export const validateToken = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    
    // Verificar expiração
    if (decoded.exp < now) {
      console.warn('Token expirado');
      return false;
    }
    
    // Verificar dados obrigatórios
    if (!decoded.user_id || decoded.user_id <= 0) {
      console.warn('Token sem user_id válido');
      return false;
    }
    
    // Verificar tipo de usuário
    const hasValidRole = decoded.is_admin || decoded.is_company || decoded.is_customer;
    if (!hasValidRole) {
      console.warn('Token sem role válida');
      return false;
    }
    
    // Verificar email (se presente)
    if (decoded.email && !isValidEmail(decoded.email)) {
      console.warn('Email inválido no token');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

// 2. Sanitização de dados do usuário
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remover HTML/scripts maliciosos
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Não permitir nenhuma tag HTML
    ALLOWED_ATTR: [], // Não permitir atributos
    KEEP_CONTENT: false, // Remover conteúdo suspeito
  });
  
  // Remover caracteres potencialmente perigosos
  sanitized = sanitized
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
  
  // Limitar tamanho
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
};

// 3. Rate limiting no front-end
class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  
  canAttempt(key: string): boolean {
    const record = this.attempts.get(key);
    if (!record) return true;
    
    const now = Date.now();
    const lockoutTime = SECURITY_CONFIG.lockoutTimeMinutes * 60 * 1000;
    
    if (now - record.timestamp > lockoutTime) {
      this.attempts.delete(key);
      return true;
    }
    
    return record.count < SECURITY_CONFIG.maxLoginAttempts;
  }
  
  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (record && now - record.timestamp < SECURITY_CONFIG.lockoutTimeMinutes * 60 * 1000) {
      record.count++;
      record.timestamp = now;
    } else {
      this.attempts.set(key, { count: 1, timestamp: now });
    }
  }
  
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return SECURITY_CONFIG.maxLoginAttempts;
    
    const now = Date.now();
    const lockoutTime = SECURITY_CONFIG.lockoutTimeMinutes * 60 * 1000;
    
    if (now - record.timestamp > lockoutTime) {
      this.attempts.delete(key);
      return SECURITY_CONFIG.maxLoginAttempts;
    }
    
    return Math.max(0, SECURITY_CONFIG.maxLoginAttempts - record.count);
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const loginRateLimiter = new RateLimiter();

// 4. Gerenciamento de token com refresh automático
class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  
  // Verificar e renovar token automaticamente
  async ensureValidToken(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    if (this.isTokenExpiringSoon(token)) {
      await this.refreshToken();
    }
    
    return validateToken(token);
  }
  
  private isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;
      const timeLeft = decoded.exp - now;
      return timeLeft < SECURITY_CONFIG.tokenRefreshThreshold;
    } catch {
      return true;
    }
  }
  
  async refreshToken(): Promise<string | null> {
    // Evitar múltiplas chamadas simultâneas
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = this.doRefreshToken();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }
  
  private async doRefreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    
    try {
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        
        // Agendar próximo refresh
        this.scheduleRefresh(data.access);
        return data.access;
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
    }
    
    this.clearTokens();
    return null;
  }
  
  private scheduleRefresh(token: string): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;
      const timeUntilExpiry = (decoded.exp - now) * 1000;
      const refreshTime = Math.max(timeUntilExpiry - 60000, 60000); // 1 minuto antes, mínimo 1 minuto
      
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    } catch (error) {
      console.error('Erro ao agendar refresh:', error);
    }
  }
  
  clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
  }
}

export const tokenManager = new TokenManager();

// 5. Interceptor de requisições com segurança
export const setupApiInterceptors = (api: any) => {
  // Interceptor de requisição
  api.interceptors.request.use(
    async (config: any) => {
      // Adicionar token
      let token = localStorage.getItem('token');
      
      // Verificar se token está prestes a expirar
      if (token && tokenManager.isTokenExpiringSoon(token)) {
        const newToken = await tokenManager.refreshToken();
        if (newToken) token = newToken;
      }
      
      if (token && validateToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Adicionar headers de segurança
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.headers['X-Content-Type-Options'] = 'nosniff';
      
      // Adicionar CSRF token se disponível
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      return config;
    },
    (error: any) => Promise.reject(error)
  );
  
  // Interceptor de resposta
  api.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;
      
      // Token expirado - tentar refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const newToken = await tokenManager.refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }
      
      // Rate limit excedido
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        window.dispatchEvent(new CustomEvent('rate-limit-exceeded', {
          detail: { retryAfter }
        }));
      }
      
      // Erro de segurança
      if (error.response?.status === 403) {
        window.dispatchEvent(new CustomEvent('forbidden-access'));
      }
      
      return Promise.reject(error);
    }
  );
};

// Funções auxiliares
const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
};

const getCsrfToken = (): string | null => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + '=')) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
};