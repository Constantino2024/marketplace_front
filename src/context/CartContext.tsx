import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { favoritesService } from '../services/favorites';
import { isAuthenticated } from '../services/auth';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string;
  image_url?: string;
  stock: number;
  rating?: number;
  inStock?: boolean;
  category?: string | number;
  category_name?: string;
  company?: number;
  company_name?: string;
  discount?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  loadWishlist: () => Promise<void>;
  loadingWishlist: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hse_cart';
const WISHLIST_STORAGE_KEY = 'hse_wishlist';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Silencioso
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Silencioso
    }
  }, [wishlist]);

  const loadWishlist = async () => {
    if (!isAuthenticated()) {
      setWishlist([]);
      return;
    }

    setLoadingWishlist(true);
    try {
      const ids = await favoritesService.getFavoriteIds();
      setWishlist(ids);
    } catch {
      // Silencioso
    } finally {
      setLoadingWishlist(false);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated()) {
      const event = new CustomEvent('showAuthModal', { detail: { message: 'Faça login para adicionar aos favoritos' } });
      window.dispatchEvent(event);
      return;
    }

    const isFav = wishlist.includes(productId);
    
    if (isFav) {
      const success = await favoritesService.removeFavorite(productId);
      if (success) {
        setWishlist(prev => prev.filter(id => id !== productId));
        const updateEvent = new CustomEvent('wishlistUpdated', { 
          detail: { action: 'remove', productId, count: wishlist.length - 1 } 
        });
        window.dispatchEvent(updateEvent);
      }
    } else {
      const success = await favoritesService.addFavorite(productId);
      if (success) {
        setWishlist(prev => [...prev, productId]);
        const updateEvent = new CustomEvent('wishlistUpdated', { 
          detail: { action: 'add', productId, count: wishlist.length + 1 } 
        });
        window.dispatchEvent(updateEvent);
      }
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.includes(productId);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      const currentQuantity = existing ? existing.quantity : 0;
      if (currentQuantity >= product.stock) {
        const errorEvent = new CustomEvent('cartError', { 
          detail: { message: 'Quantidade máxima em estoque atingida!' } 
        });
        window.dispatchEvent(errorEvent);
        return prev;
      }

      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    const event = new CustomEvent('cartUpdated', { 
      detail: { action: 'add', productId: product.id } 
    });
    window.dispatchEvent(event);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== productId);
      const event = new CustomEvent('cartUpdated', { 
        detail: { action: 'remove', productId } 
      });
      window.dispatchEvent(event);
      return newCart;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        if (quantity > item.stock) {
          const errorEvent = new CustomEvent('cartError', { 
            detail: { message: `Quantidade máxima disponível: ${item.stock} unidades` } 
          });
          window.dispatchEvent(errorEvent);
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    const confirmed = window.confirm('Tem certeza que deseja limpar o carrinho?');
    if (confirmed) {
      setCart([]);
      const event = new CustomEvent('cartUpdated', { 
        detail: { action: 'clear' } 
      });
      window.dispatchEvent(event);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    if (isAuthenticated()) {
      loadWishlist();
    }
  }, []);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal,
      wishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount,
      loadWishlist,
      loadingWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};