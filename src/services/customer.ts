import api from "./api";
import { getCurrentUser } from "./auth";

export interface CustomerProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  birth_date?: string;
  tax_id?: string;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
  status_display: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}

export const customerService = {
  // Registrar novo cliente
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('customer/register/', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao realizar registro'
      };
    }
  },

  // Buscar perfil do cliente
  getProfile: async (): Promise<CustomerProfile> => {
    try {
      const response = await api.get<CustomerProfile>('customer/profile/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  // Atualizar perfil
  updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    try {
      const response = await api.put<CustomerProfile>('customer/profile/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Listar pedidos do cliente
  getOrders: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<{ count: number; results: CustomerOrder[] }> => {
    try {
      const response = await api.get('customer/orders/', { params });
      
      // Garantir estrutura correta
      return {
        count: response.data.count || response.data.length || 0,
        results: response.data.results || response.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return { count: 0, results: [] };
    }
  },

  // Buscar detalhes de um pedido
  getOrderDetails: async (orderId: number): Promise<CustomerOrder> => {
    try {
      const response = await api.get(`customer/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      throw error;
    }
  },

  // Acompanhar pedido
  trackOrder: async (orderId: number): Promise<{
    order_number: string;
    status: string;
    status_display: string;
    created_at: string;
    estimated_delivery: string;
  }> => {
    try {
      const response = await api.get(`customer/orders/${orderId}/track/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao acompanhar pedido:', error);
      throw error;
    }
  }
};