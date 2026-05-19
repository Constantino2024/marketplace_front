// pages/CategoryProducts.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Package,
  Store,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { categoryService, CategoryDetails, CategoryProduct } from '../services/category';
import { formatCurrency } from '../utils/currency';
import { createProductSlug } from '../utils/slug';
import { ProductCardSkeleton } from '../components/Skeleton';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <AlertCircle className="w-5 h-5" />
    )}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">×</button>
  </motion.div>
);

// Product Card Component
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted }: { 
  product: CategoryProduct;
  onAddToCart: (product: CategoryProduct) => void;
  onToggleWishlist: (productId: number) => void;
  isWishlisted: boolean;
}) => {
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1500);
  };

  const discount = product.oldPrice 
    ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%` 
    : undefined;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-xl transition-all relative overflow-hidden h-full flex flex-col">
      <AnimatePresence>
        {showAddedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-0 z-20 bg-orange-500 text-white text-center py-2 text-xs font-bold"
          >
            ✓ Adicionado ao carrinho
          </motion.div>
        )}
      </AnimatePresence>

      {discount && (
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          {discount}
        </span>
      )}
      
      {product.company_name && (
        <div className="absolute top-3 right-3 bg-blue-900/10 text-blue-900 text-[8px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
          <Store className="w-3 h-3" />
          {product.company_name}
        </div>
      )}

      <div className="absolute top-12 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-orange-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <Link 
          to={`/product/${createProductSlug(product.name, product.id)}`}
          className="w-8 h-8 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-md hover:text-orange-500 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      <Link to={`/product/${createProductSlug(product.name, product.id)}`} className="block aspect-[3/4] overflow-hidden rounded-xl mb-4 bg-gray-50">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </Link>

      <div className="px-1 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 uppercase tracking-tight h-10 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] text-green-500 font-bold mb-2">
          {product.stock > 0 ? 'Em stock' : 'Fora de stock'}
        </p>
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            <span className="text-sm font-black text-blue-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-bold text-gray-700">{startItem}</span> a{' '}
        <span className="font-bold text-gray-700">{endItem}</span> de{' '}
        <span className="font-bold text-gray-700">{totalItems}</span> produtos
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Filter Modal
const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  filters: { minPrice: string; maxPrice: string; sortBy: string };
  onApplyFilters: (filters: { minPrice: string; maxPrice: string; sortBy: string }) => void;
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ minPrice: '', maxPrice: '', sortBy: '-created_at' });
    onApplyFilters({ minPrice: '', maxPrice: '', sortBy: '-created_at' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5" />
            <h2 className="text-xl font-black">Filtrar Produtos</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preço */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Faixa de Preço</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mínimo (Kz)</label>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Máximo (Kz)</label>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="1000000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                />
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Ordenar por</h3>
            <div className="space-y-2">
              {[
                { value: '-created_at', label: 'Mais recentes', icon: Clock },
                { value: '-price', label: 'Preço: Maior para Menor', icon: TrendingUp },
                { value: 'price', label: 'Preço: Menor para Maior', icon: TrendingUp },
                { value: '-name', label: 'Nome: A a Z', icon: 'A-Z' },
                { value: 'name', label: 'Nome: Z a A', icon: 'Z-A' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option.value}
                    checked={localFilters.sortBy === option.value}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Limpar Filtros
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function CategoryProducts() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: '-created_at'
  });
  
  // Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carregar detalhes da categoria pelo slug
  useEffect(() => {
    const loadCategory = async () => {
      if (!categorySlug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await categoryService.getCategoryBySlug(categorySlug);
        setCategory(data);
      } catch (err) {
        console.error('Erro ao carregar categoria:', err);
        setError('Categoria não encontrada');
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [categorySlug]);

  // Carregar produtos da categoria
  useEffect(() => {
    const loadProducts = async () => {
      if (!category) return;
      setLoadingProducts(true);
      try {
        const params: any = {
          page: currentPage,
          page_size: itemsPerPage,
          ordering: filters.sortBy,
        };
        
        if (filters.minPrice) params.min_price = filters.minPrice;
        if (filters.maxPrice) params.max_price = filters.maxPrice;
        if (debouncedSearch) params.search = debouncedSearch;
        
        const response = await categoryService.getProductsByCategory(category.id, params);
        setProducts(response.results);
        setTotalItems(response.count);
        setTotalPages(Math.ceil(response.count / itemsPerPage));
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [category, currentPage, filters, debouncedSearch]);

  const handleAddToCart = (product: CategoryProduct) => {
    addToCart(product as any);
    setToast({ message: 'Produto adicionado ao carrinho!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Categoria não encontrada</h2>
        <p className="text-gray-500 mb-8">A categoria que procura não existe ou foi removida.</p>
        <Link to="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header da Categoria */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Página Inicial
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name}
                  className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-orange-500/20"
                />
              )}
              <h1 className="text-3xl md:text-4xl font-black text-gray-800">{category.name}</h1>
              {category.description && (
                <p className="text-gray-500 mt-2 max-w-2xl">{category.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {totalItems} {totalItems === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>
            {category.company_name && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full self-start">
                <Store className="w-4 h-4 text-blue-900" />
                <span className="text-sm font-bold text-blue-900">{category.company_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar produtos nesta categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Lista de Produtos */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-800 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `Não encontrámos produtos com "${searchTerm}" nesta categoria.`
                : 'Não há produtos disponíveis nesta categoria no momento.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-500 font-bold hover:underline"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}