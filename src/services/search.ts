import api from "./api";
import { Product } from "../context/CartContext";

export interface SearchProduct extends Product {
  image_url?: string;
  category_name: string;
  company_name?: string;
  status: string;
  is_featured: boolean;
}

export interface SearchFilters {
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  company?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchProduct[];
  facets?: {
    categories: Array<{ id: number; name: string; count: number }>;
    companies: Array<{ id: number; name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export const searchService = {
  // Buscar produtos
  search: async (
    query: string = '',
    page: number = 1,
    filters?: SearchFilters
  ): Promise<SearchResponse> => {
    try {
      const params: any = {
        search: query,
        page: page,
        page_size: 30,
        status: 'active'
      };

      if (filters?.category) {
        params.category = filters.category;
      }
      
      if (filters?.company) {
        params.company = filters.company;
      }
      
      if (filters?.minPrice !== undefined) {
        params.min_price = filters.minPrice;
      }
      
      if (filters?.maxPrice !== undefined) {
        params.max_price = filters.maxPrice;
      }
      
      if (filters?.inStock) {
        params.in_stock = true;
      }
      
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            params.ordering = 'price';
            break;
          case 'price_desc':
            params.ordering = '-price';
            break;
          case 'newest':
            params.ordering = '-created_at';
            break;
          case 'popular':
            params.ordering = '-views'; // Se tiver campo de views
            break;
        }
      }

      const response = await api.get<SearchResponse>('products/', { params });
      return response.data;
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      throw error;
    }
  },

  // Sugestões de busca (autocomplete)
  getSuggestions: async (query: string): Promise<string[]> => {
    try {
      if (!query || query.length < 2) return [];
      
      const response = await api.get<{ suggestions: string[] }>('products/search_suggestions/', {
        params: { q: query }
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      return [];
    }
  },

  // Buscar produtos por categoria
  getByCategory: async (
    categoryId: number,
    page: number = 1,
    filters?: Omit<SearchFilters, 'category'>
  ): Promise<SearchResponse> => {
    return searchService.search('', page, { ...filters, category: categoryId });
  }
};