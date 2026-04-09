import api from "./api";
import { getCurrentUser } from "./auth";

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  image_url?: string;
  is_active: boolean;
  company?: number;
  company_name?: string;
  is_global: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: File | null;
  is_active?: boolean;
}

export interface CategoryFilters {
  is_active?: boolean;
  company?: 'global' | 'mine' | number;
}

export const categoriesService = {
  // Listar todas as categorias com base no tipo de usuário
  list: async (params?: CategoryFilters) => {
    try {
      const response = await api.get<Category[]>('categories/', { params });
      return response.data;
    } catch (error) {
      console.error('Erro na API categories.list:', error);
      throw error;
    }
  },

  // Buscar uma categoria por ID
  getById: async (id: number) => {
    try {
      const response = await api.get<Category>(`categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro na API categories.getById:', error);
      throw error;
    }
  },

  // Criar nova categoria
  create: async (data: CreateCategoryData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
      if (data.image) formData.append('image', data.image);

      const response = await api.post<Category>('categories/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na API categories.create:', error.response?.data || error);
      throw error;
    }
  },

  // Atualizar categoria
  update: async (id: number, data: Partial<CreateCategoryData>) => {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
      if (data.image) formData.append('image', data.image);

      const response = await api.put<Category>(`categories/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na API categories.update:', error.response?.data || error);
      throw error;
    }
  },

  // Deletar categoria (apenas admin)
  delete: async (id: number) => {
    try {
      await api.delete(`categories/${id}/`);
    } catch (error: any) {
      console.error('Erro na API categories.delete:', error.response?.data || error);
      throw error;
    }
  },

  // Ativar/desativar categoria
  toggleActive: async (id: number, isActive: boolean) => {
    try {
      const response = await api.patch<Category>(`categories/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na API categories.toggleActive:', error.response?.data || error);
      throw error;
    }
  }
};