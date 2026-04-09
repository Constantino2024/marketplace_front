// services/companies.ts
import api from "./api";

export interface Company {
  id: number;
  company_name: string;
  nif: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_verified: boolean;
  joined_date: string;
  total_sales: number;
  products_count: number;
  // Dados do usuário
  username: string;
  email: string;
  user_id: number;
  generated_password?: string; // Para criação
}

export interface CreateCompanyData {
  username: string;
  email: string;
  password?: string;
  company_name: string;
  nif: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_verified?: boolean;
}

export const companiesService = {
  // Listar todas as empresas
  list: async () => {
    try {
      const response = await api.get<Company[]>('companies/');
      return response.data;
    } catch (error) {
      console.error('Erro na API companies.list:', error);
      throw error;
    }
  },

  // Buscar uma empresa por ID
  getById: async (id: number) => {
    try {
      const response = await api.get<Company>(`companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro na API companies.getById:', error);
      throw error;
    }
  },

  // Criar nova empresa
  create: async (data: CreateCompanyData) => {
    try {
      const response = await api.post<Company>('companies/', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro na API companies.create:', error.response?.data || error);
      throw error;
    }
  },

  // Atualizar empresa
  update: async (id: number, data: Partial<CreateCompanyData>) => {
    try {
      // Remover campos que não devem ser enviados na edição
      const updateData = { ...data };
      
      // Se password estiver vazio, remover para não alterar
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await api.put<Company>(`companies/${id}/`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Erro na API companies.update:', error.response?.data || error);
      throw error;
    }
  },

  // Deletar empresa
  delete: async (id: number) => {
    try {
      await api.delete(`companies/${id}/`);
    } catch (error: any) {
      console.error('Erro na API companies.delete:', error.response?.data || error);
      throw error;
    }
  },

  // Ativar/desativar empresa
  toggleStatus: async (id: number) => {
    try {
      const response = await api.post<{ status: string }>(`companies/${id}/toggle_status/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro na API companies.toggleStatus:', error.response?.data || error);
      throw error;
    }
  },

  // Resetar senha
  resetPassword: async (id: number) => {
    try {
      const response = await api.post<{ message: string; new_password: string }>(`companies/${id}/reset_password/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro na API companies.resetPassword:', error.response?.data || error);
      throw error;
    }
  },

  // Estatísticas
  getStats: async () => {
    try {
      const response = await api.get<{
        total_companies: number;
        active_companies: number;
        total_sales: number;
      }>('companies/stats/');
      return response.data;
    } catch (error: any) {
      console.error('Erro na API companies.getStats:', error.response?.data || error);
      throw error;
    }
  }
};