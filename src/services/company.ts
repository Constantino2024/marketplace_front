import api from "./api";

export interface CompanyProfile {
  id: number;
  company_name: string;
  nif: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  logo_url?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_verified: boolean;
  joined_date: string;
  total_sales: number;
  products_count: number;
  user_id: number;
  username: string;
  email: string;
  updated_at?: string;
}

export interface CompanyUpdateData {
  company_name?: string;
  nif?: string;
  address?: string;
  phone?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface CompanyOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
  image_url?: string;
}

export interface SalesByDay {
  date: string;
  total: number;
  orders_count: number;
}

export interface CompanyCustomer {
  id: number;
  name: string;
  email: string;
  total_spent: number;
  last_purchase: string;
  orders_count: number;
  products_count: number;
}

export interface CompanyStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  recent_orders: CompanyOrder[];
  top_products: TopProduct[];
  sales_by_day: SalesByDay[];
  customers?: CompanyCustomer[];
}

export const companyService = {
  // Buscar perfil da empresa
  getProfile: async (): Promise<CompanyProfile> => {
    try {
      const response = await api.get<CompanyProfile>('store-settings/profile/');
      if (response.data.logo_url) {
        response.data.logo = response.data.logo_url;
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil da empresa:', error);
      throw error;
    }
  },

  // Atualizar perfil da empresa
  updateProfile: async (data: CompanyUpdateData): Promise<CompanyProfile> => {
    try {
      const response = await api.patch<CompanyProfile>('store-settings/profile/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil da empresa:', error);
      throw error;
    }
  },

  // Buscar dados do dashboard (reais)
  getDashboardData: async (): Promise<CompanyStats> => {
    try {
      const response = await api.get<CompanyStats>('store-dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      return {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0,
        recent_orders: [],
        top_products: [],
        sales_by_day: []
      };
    }
  },

  // Upload do logo
  uploadLogo: async (file: File): Promise<{ logo_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await api.post<{ success: boolean; logo_url: string; message: string }>(
        'store-settings/upload-logo/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return { logo_url: response.data.logo_url, message: response.data.message };
    } catch (error: any) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error.response?.data || { error: 'Erro ao fazer upload' };
    }
  },

  // Remover logo
  removeLogo: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('store-settings/upload-logo/');
      return { message: response.data.message };
    } catch (error: any) {
      console.error('Erro ao remover logo:', error);
      throw error.response?.data || { error: 'Erro ao remover logo' };
    }
  },

  // Alterar senha
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      await api.post('store-settings/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      throw error.response?.data || { error: 'Erro ao alterar senha' };
    }
  },
};