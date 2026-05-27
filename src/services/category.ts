// services/category.ts
import api from "./api";

export interface CategoryProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image_url?: string;
  category_name: string;
  company_name?: string;
  rating?: number;
  status: string;
  is_featured: boolean;
}

export interface CategoryDetails {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  company_name?: string;
  is_global: boolean;
  products_count: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CategoryProduct[];
}

export const categoryService = {
  // Buscar detalhes da categoria por slug (agora usa o endpoint correto)
  getCategoryBySlug: async (slug: string): Promise<CategoryDetails> => {
    try {
      // Usar o novo endpoint específico para slug
      const response = await api.get<CategoryDetails>(`categories/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria por slug:', error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  getProductsByCategory: async (
    categoryId: number,
    params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
      min_price?: number;
      max_price?: number;
      search?: string;
    }
  ): Promise<ProductsResponse> => {
    try {
      const response = await api.get<ProductsResponse>('products/', {
        params: {
          category: categoryId,
          status: 'active',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos da categoria:', error);
      throw error;
    }
  },

  // Buscar todas as categorias (para navegação)
  getAllCategories: async (): Promise<CategoryDetails[]> => {
    try {
      const response = await api.get<CategoryDetails[]>('categories/', {
        params: { is_active: true }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }
};