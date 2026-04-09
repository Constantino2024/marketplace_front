import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  toggleWishlist: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Chaves para o localStorage
const CART_STORAGE_KEY = 'hse_cart';
const WISHLIST_STORAGE_KEY = 'hse_wishlist';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar estado com dados do localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Erro ao carregar wishlist do localStorage:', error);
      return [];
    }
  });

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [cart]);

  // Salvar wishlist no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Erro ao salvar wishlist no localStorage:', error);
    }
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      // Verificar se há estoque disponível
      const currentQuantity = existing ? existing.quantity : 0;
      if (currentQuantity >= product.stock) {
        alert('Quantidade máxima em estoque atingida!');
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

    // Feedback visual (opcional)
    const event = new CustomEvent('cartUpdated', { 
      detail: { action: 'add', productId: product.id } 
    });
    window.dispatchEvent(event);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== productId);
      
      // Disparar evento para feedback
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
        // Verificar limite de estoque
        if (quantity > item.stock) {
          alert(`Quantidade máxima disponível: ${item.stock} unidades`);
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
      setCart([]);
      // Disparar evento para feedback
      const event = new CustomEvent('cartUpdated', { 
        detail: { action: 'clear' } 
      });
      window.dispatchEvent(event);
    }
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      // Disparar evento para feedback
      const event = new CustomEvent('wishlistUpdated', { 
        detail: { 
          action: prev.includes(productId) ? 'remove' : 'add',
          productId 
        } 
      });
      window.dispatchEvent(event);
      
      return newWishlist;
    });
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
      toggleWishlist
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

// Hook auxiliar para sincronizar carrinho entre abas (opcional)
export const useCartSync = () => {
  const { cart } = useCart();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue);
          // Atualizar estado se necessário
          // Nota: Isso requer uma função de atualização no contexto
          // Você pode implementar um método syncCart no contexto se precisar
        } catch (error) {
          console.error('Erro ao sincronizar carrinho:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
};