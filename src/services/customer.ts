import api from "./api";

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

export interface CustomerOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
  status_display: string;
  payment_method?: 'express' | 'reference' | 'ekwanza';
  items?: CustomerOrderItem[];
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

export interface TrackOrderResponse {
  order_number: string;
  status: string;
  status_display: string;
  created_at: string;
  estimated_delivery: string;
}

export const customerService = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('customer/register/', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error ?? 'Erro ao realizar registro',
      };
    }
  },

  getProfile: async (): Promise<CustomerProfile> => {
    const response = await api.get<CustomerProfile>('customer/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    const response = await api.put<CustomerProfile>('customer/profile/', data);
    return response.data;
  },

  getOrders: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<{ count: number; results: CustomerOrder[] }> => {
    try {
      const response = await api.get('customer/orders/', { params });
      return {
        count: response.data.count ?? response.data.length ?? 0,
        results: response.data.results ?? response.data ?? [],
      };
    } catch {
      return { count: 0, results: [] };
    }
  },

  getOrderDetails: async (orderId: number): Promise<CustomerOrder> => {
    const response = await api.get(`customer/orders/${orderId}/`);
    return response.data;
  },

  trackOrder: async (orderId: number): Promise<TrackOrderResponse> => {
    const response = await api.get(`customer/orders/${orderId}/track/`);
    return response.data;
  },
};