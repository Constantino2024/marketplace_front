import { useState, useEffect } from 'react';
import { favoritesService } from '../services/favorites';

export const useFavorites = (productId?: number) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      checkFavorite();
    }
  }, [productId]);

  const checkFavorite = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const isFav = await favoritesService.checkFavorite(productId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!productId) return false;
    setIsLoading(true);
    try {
      if (isFavorite) {
        const success = await favoritesService.removeFavorite(productId);
        if (success) setIsFavorite(false);
        return success;
      } else {
        const success = await favoritesService.addFavorite(productId);
        if (success) setIsFavorite(true);
        return success;
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
};