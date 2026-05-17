import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesService, FavoriteProduct } from '../services/favorites';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  favoriteIds: number[];
  isLoading: boolean;
  addFavorite: (productId: number) => Promise<boolean>;
  removeFavorite: (productId: number) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const [favs, ids] = await Promise.all([
        favoritesService.getFavorites(),
        favoritesService.getFavoriteIds()
      ]);
      setFavorites(favs);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  const addFavorite = async (productId: number): Promise<boolean> => {
    const success = await favoritesService.addFavorite(productId);
    if (success) {
      await loadFavorites();
    }
    return success;
  };

  const removeFavorite = async (productId: number): Promise<boolean> => {
    const success = await favoritesService.removeFavorite(productId);
    if (success) {
      await loadFavorites();
    }
    return success;
  };

  const isFavorite = (productId: number): boolean => {
    return favoriteIds.includes(productId);
  };

  const toggleFavorite = async (productId: number): Promise<boolean> => {
    if (isFavorite(productId)) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoriteIds,
      isLoading,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};