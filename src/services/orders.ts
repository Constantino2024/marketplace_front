import api from "./api";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  company_id?: number;
  date: string;
  created_at: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: 'express' | 'reference' | 'ekwanza';  // NOVO CAMPO
  items: OrderItem[];
  customer_info?: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    payment_method: string;
  };
}

export interface OrderStats {
  paid: number;
  pending: number;
  cancelled: number;
  shipped: number;
  delivered: number;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export const ordersService = {
  // Listar pedidos (admin)
  list: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    company?: number;
  }): Promise<OrdersResponse> => {
    try {
      
      const response = await api.get<any>('orders/', { params });
            
      // Verificar o formato da resposta
      let formattedResponse: OrdersResponse;
      
      if (Array.isArray(response.data)) {
        formattedResponse = {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      } else if (response.data && typeof response.data === 'object') {
        formattedResponse = {
          count: response.data.count || response.data.length || 0,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results || response.data || []
        };
      } else {
        formattedResponse = {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
      }
      
      
      return formattedResponse;
    } catch (error: any) {
      console.error('❌ [OrdersService] Erro ao listar pedidos:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  // Buscar pedido por ID
  getById: async (id: number): Promise<Order> => {
    try {
      const response = await api.get<Order>(`orders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  },

  // Atualizar status do pedido
  updateStatus: async (id: number, status: string): Promise<Order> => {
    try {
      const response = await api.patch<Order>(`orders/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  // Obter estatísticas
  getStats: async (): Promise<OrderStats> => {
    try {
      const response = await api.get<OrderStats>('orders/stats/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        paid: 0,
        pending: 0,
        cancelled: 0,
        shipped: 0,
        delivered: 0
      };
    }
  },

  // Listar pedidos da empresa (para empresas)
  listCompanyOrders: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<OrdersResponse> => {
    try {
      const response = await api.get<any>('company/orders/', { params });
      
      let formattedResponse: OrdersResponse;
      
      if (Array.isArray(response.data)) {
        formattedResponse = {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      } else {
        formattedResponse = {
          count: response.data.count || 0,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results || []
        };
      }
      
      return formattedResponse;
    } catch (error) {
      console.error('Erro ao listar pedidos da empresa:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  // Listar pedidos do cliente
  listCustomerOrders: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<OrdersResponse> => {
    try {
      const response = await api.get<any>('customer/orders/', { params });
      
      let formattedResponse: OrdersResponse;
      
      if (Array.isArray(response.data)) {
        formattedResponse = {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      } else {
        formattedResponse = {
          count: response.data.count || 0,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results || []
        };
      }
      
      return formattedResponse;
    } catch (error) {
      console.error('Erro ao listar pedidos do cliente:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  // Download de fatura em PDF
  downloadInvoice: async (orderId: number): Promise<void> => {
    try {
      // Abre em nova aba para download
      window.open(`${api.defaults.baseURL}invoice/${orderId}/download/`, '_blank');
    } catch (error) {
      console.error('Erro ao baixar fatura:');
      throw error;
    }
  },

  // Download de relatório em PDF
  downloadReport: async (filters?: {
    status?: string;
    company?: string;
  }): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.company) params.append('company', filters.company);
      
      const queryString = params.toString();
      const url = `${api.defaults.baseURL}orders/report/${queryString ? `?${queryString}` : ''}`;
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao baixar relatório:');
      throw error;
    }
  },

  // Download de relatório em CSV (opcional - para Excel)
  downloadCSV: async (filters?: {
    status?: string;
    company?: string;
  }): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.company) params.append('company', filters.company);
      
      const queryString = params.toString();
      window.open(`/api/orders/export/csv/${queryString ? `?${queryString}` : ''}`, '_blank');
    } catch (error) {
      console.error('Erro ao baixar CSV:');
      throw error;
    }
  }
};