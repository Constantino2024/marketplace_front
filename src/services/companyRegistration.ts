// services/companyRegistration.ts
import api from "./api";

export interface CompanyRegistrationData {
  company_name: string;
  nif: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  email: string;
  password: string;
  confirm_password: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

export interface CompanyRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  company_id?: number;
  company_name?: string;
  status?: string;
}

export const companyRegistrationService = {
  register: async (data: CompanyRegistrationData): Promise<CompanyRegistrationResponse> => {
    try {
      const response = await api.post<CompanyRegistrationResponse>('company/register/', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro da empresa:');
      
      // Extrair mensagens de erro detalhadas
      let errorMessage = 'Erro ao registrar empresa';
      let errorDetails = {};
      
      if (error.response?.data?.errors) {
        errorDetails = error.response.data.errors;
        const firstErrorKey = Object.keys(errorDetails)[0];
        if (firstErrorKey) {
          const firstError = errorDetails[firstErrorKey];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return {
        success: false,
        error: errorMessage,
        errors: error.response?.data?.errors
      };
    }
  }
};