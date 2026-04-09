import api from "./api";

export interface AdminCustomer {
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
  date_joined: string;
  last_login?: string;
  is_active: boolean;
  orders_count?: number;
  total_spent?: number;
}

export interface CustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminCustomer[];
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface CustomerStats {
  total_customers: number;
  active_today: number;
  new_this_month: number;
  top_cities: Array<{ city: string; count: number }>;
}

export const adminCustomersService = {
  // Listar clientes
  list: async (params?: CustomerFilters): Promise<CustomersResponse> => {
    try {
      const response = await api.get('admin/customers/', { params });
      console.log('Resposta da API (raw):', response.data);
      
      // Se a resposta for um array direto, converter para o formato esperado
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
      // Se já estiver no formato esperado
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  },

  // Buscar cliente por ID
  getById: async (id: number): Promise<AdminCustomer> => {
    try {
      const response = await api.get<AdminCustomer>(`admin/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  // Obter estatísticas dos clientes
  getStats: async (): Promise<CustomerStats> => {
    try {
      const response = await api.get<CustomerStats>('admin/customers/stats/');
      // Garantir que top_cities seja sempre um array
      return {
        ...response.data,
        top_cities: response.data.top_cities || []
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_customers: 0,
        active_today: 0,
        new_this_month: 0,
        top_cities: []
      };
    }
  }
};