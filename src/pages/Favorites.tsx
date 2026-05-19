import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, ChevronLeft, ChevronRight, Loader2, Heart, ShoppingBag, Trash2, ShoppingCart, User, MapPin, Key, Settings, XCircle as XCircleIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerLayout } from '../components/CustomerLayout';
import { favoritesService, FavoriteProduct } from '../services/favorites';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const ITEMS_PER_PAGE = 12;

const menuItems = [
  { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
  { id: 'orders', label: 'Meus Pedidos', icon: Package, path: '/orders' },
  { id: 'favorites', label: 'Meus Favoritos', icon: Heart, path: '/favorites' },
  { id: 'addresses', label: 'Meus Endereços', icon: MapPin, path: '/addresses' },
  { id: 'change-password', label: 'Alterar Palavra-passe', icon: Key, action: 'password' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
];

const getStatusStock = (stock: number) => {
  if (stock > 0) {
    return { color: 'text-emerald-600', label: 'Em stock', bgColor: 'bg-emerald-100' };
  }
  return { color: 'text-red-600', label: 'Esgotado', bgColor: 'bg-red-100' };
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
};

export default function Favorites() {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [currentPage]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data);
      setTotalItems(data.length);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleRemoveFavorite = async (productId: number) => {
    const success = await favoritesService.removeFavorite(productId);
    if (success) {
      setFavorites(prev => prev.filter(p => p.id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      showToast('Produto removido dos favoritos', 'success');
    } else {
      showToast('Erro ao remover produto', 'error');
    }
  };

  const handleAddToCart = async (product: FavoriteProduct) => {
    try {
      await addToCart(product);
      showToast(`${product.name} adicionado ao carrinho!`, 'success');
    } catch {
      showToast('Erro ao adicionar ao carrinho', 'error');
    }
  };

  const handleBulkRemove = async () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Remover ${selectedProducts.length} produto(s) dos favoritos?`)) {
      setIsDeleting(true);
      try {
        let successCount = 0;
        for (const productId of selectedProducts) {
          const success = await favoritesService.removeFavorite(productId);
          if (success) successCount++;
        }
        if (successCount > 0) {
          setFavorites(prev => prev.filter(p => !selectedProducts.includes(p.id)));
          setSelectedProducts([]);
          showToast(`${successCount} produto(s) removido(s)`, 'success');
        }
      } catch {
        showToast('Erro ao remover produtos', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    const paginatedIds = getPaginatedProducts().map(p => p.id);
    const allSelected = paginatedIds.every(id => selectedProducts.includes(id));
    if (allSelected) {
      setSelectedProducts(prev => prev.filter(id => !paginatedIds.includes(id)));
    } else {
      setSelectedProducts(prev => [...new Set([...prev, ...paginatedIds])]);
    }
  };

  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return favorites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch {
      return false;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFavorites = getPaginatedProducts();

  return (
    <CustomerLayout
      title="Meus Favoritos"
      subtitle={`${totalItems} ${totalItems === 1 ? 'produto' : 'produtos'} nos seus favoritos`}
      menuItems={menuItems}
      activeItem="favorites"
      toast={toast}
      setToast={setToast}
      onChangePassword={handleChangePassword}
    >
      {/* Barra de acções */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={paginatedFavorites.length > 0 && paginatedFavorites.every(p => selectedProducts.includes(p.id))} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-[#F59E0B] focus:ring-[#F59E0B]" />
            <span>{selectedProducts.length} de {totalItems} seleccionado(s)</span>
          </div>
          {selectedProducts.length > 0 && (
            <button onClick={handleBulkRemove} disabled={isDeleting} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remover ({selectedProducts.length})
            </button>
          )}
        </div>
      )}

      {/* Lista de Favoritos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
        </div>
      ) : favorites.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedFavorites.map((product) => {
              const stockStatus = getStatusStock(product.stock);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Checkbox e botão remover */}
                  <div className="absolute relative z-10 p-3">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleSelectProduct(product.id)} className="w-4 h-4 rounded border-gray-300 text-[#F59E0B] focus:ring-[#F59E0B] bg-white shadow-sm" />
                    </label>
                  </div>
                  <button onClick={() => handleRemoveFavorite(product.id)} className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Imagem */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative pt-[100%] overflow-hidden bg-gray-100">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Package className="w-12 h-12 text-gray-300" /></div>
                      )}
                      {product.oldPrice && product.oldPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {product.category_name && (
                      <Link to={`/category/${product.category_id}`} className="text-[10px] text-[#F59E0B] font-medium hover:underline inline-block mb-2">
                        {product.category_name}
                      </Link>
                    )}
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm hover:text-[#F59E0B] transition-colors">{product.name}</h3>
                    </Link>
                    <div className="mb-3">
                      <div className="text-lg font-black text-[#F59E0B]">{formatCurrency(product.price)}</div>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">{formatCurrency(product.oldPrice)}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${stockStatus.bgColor} ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                      {product.added_at && (
                        <span className="text-[9px] text-gray-400">Adicionado em {formatDate(product.added_at)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {product.stock > 0 && (
                        <button onClick={() => handleAddToCart(product)} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold">
                          <ShoppingCart className="w-3.5 h-3.5" /> Comprar
                        </button>
                      )}
                      <Link to={`/product/${product.id}`} className="px-3 py-2 border border-gray-300 hover:border-[#F59E0B] hover:text-[#F59E0B] rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-medium">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold">
                A mostrar <span className="text-gray-800">{startIndex + 1}</span> a <span className="text-gray-800">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> de <span className="text-gray-800">{totalItems}</span> produtos
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-600">Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">A sua lista está vazia</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Ainda não adicionou nenhum produto aos favoritos. Comece a explorar e encontre os seus produtos favoritos!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="px-6 py-3 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors font-bold inline-flex items-center justify-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" /> Explorar Produtos
            </Link>
            <Link to="/categories" className="px-6 py-3 border-2 border-[#F59E0B] text-[#F59E0B] rounded-lg hover:bg-[#F59E0B]/5 transition-colors font-bold inline-flex items-center justify-center gap-2 text-sm">
              <Package className="w-4 h-4" /> Ver Categorias
            </Link>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}