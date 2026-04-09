
import api from "./api";

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: any;
}

export const passwordResetService = {
  // Solicitar reset de senha
  requestReset: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>('password-reset/request/', { email });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao solicitar reset:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao solicitar redefinição de senha',
        errors: error.response?.data?.errors
      };
    }
  },

  // Confirmar reset de senha
  confirmReset: async (data: PasswordResetConfirm): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>('password-reset/confirm/', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao confirmar reset:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao redefinir senha',
        errors: error.response?.data?.errors
      };
    }
  },

  // Validar token
  validateToken: async (token: string): Promise<{ valid: boolean; email?: string; error?: string }> => {
    try {
      const response = await api.get<{ valid: boolean; email?: string; error?: string }>(`password-reset/validate/${token}/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      return { valid: false, error: 'Token inválido' };
    }
  },

  // Alterar senha (usuário logado)
  changePassword: async (data: PasswordChange): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>('password/change/', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Erro ao alterar senha',
        errors: error.response?.data?.errors
      };
    }
  }
};