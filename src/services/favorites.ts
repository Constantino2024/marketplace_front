import api from './api';
import { Product } from '../context/CartContext';

export interface FavoriteProduct extends Product {
  image_url?: string;
  category_name: string;
  category_id: number;
  company_name?: string;
  status: string;
  is_featured: boolean;
  added_at?: string;
}

export interface FavoriteResponse {
  id: number;
  user: number;
  product: FavoriteProduct;
  created_at: string;
  added_at: string;
}

export const favoritesService = {
  getFavorites: async (): Promise<FavoriteProduct[]> => {
    try {
      const response = await api.get<FavoriteResponse[]>('favorites/');
      return response.data.map(fav => ({
        ...fav.product,
        added_at: fav.created_at
      }));
    } catch {
      return [];
    }
  },

  addFavorite: async (productId: number): Promise<boolean> => {
    try {
      await api.post('favorites/', { product_id: productId });
      return true;
    } catch {
      return false;
    }
  },

  removeFavorite: async (productId: number): Promise<boolean> => {
    try {
      // Usando DELETE com o product_id na URL (para a versão APIView)
      await api.delete(`favorites/${productId}/`);
      return true;
    } catch {
      return false;
    }
  },

  checkFavorite: async (productId: number): Promise<boolean> => {
    try {
      const response = await api.get<{ is_favorite: boolean }>(`favorites/check/${productId}/`);
      return response.data.is_favorite;
    } catch {
      return false;
    }
  },

  getFavoriteIds: async (): Promise<number[]> => {
    try {
      const response = await api.get<{ favorite_ids: number[] }>('favorites/ids/');
      return response.data.favorite_ids;
    } catch {
      return [];
    }
  },

  getFavoritesCount: async (): Promise<number> => {
    try {
      const response = await api.get<{ count: number }>('favorites/count/');
      return response.data.count;
    } catch {
      return 0;
    }
  },

  bulkRemoveFavorites: async (productIds: number[]): Promise<{ success: boolean; deleted_count: number }> => {
    try {
      const response = await api.post<{ success: boolean; deleted_count: number }>(
        'favorites/bulk-remove/',
        { product_ids: productIds }
      );
      return response.data;
    } catch {
      return { success: false, deleted_count: 0 };
    }
  }
};