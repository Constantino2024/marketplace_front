import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Heart,
  Eye,
  Package,
  Store,
  Loader2,
  Filter,
  ShoppingCart  // 👈 ADICIONE ESTA IMPORTAÇÃO
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchService, SearchProduct, SearchFilters } from '../services/search';
import { useCart } from '../context/CartContext';
import { categoriesService, Category } from '../services/categories';

// Componente de Product Card (reutilizado da Home)
const ProductCard = ({ product }: { product: SearchProduct }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const discount = product.oldPrice 
    ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%` 
    : undefined;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-xl transition-all relative overflow-hidden h-full flex flex-col">
      {discount && (
        <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          {discount}
        </span>
      )}
      
      {product.company_name && (
        <div className="absolute top-3 right-3 bg-primary/10 text-primary text-[8px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
          <Store className="w-3 h-3" />
          {product.company_name}
        </div>
      )}

      <div className="absolute top-12 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <Link 
          to={`/product/${product.id}`}
          className="w-8 h-8 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-md hover:text-primary transition-colors"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden rounded-xl mb-4 bg-gray-50">
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
          <h3 className="text-xs font-bold text-gray-800 mb-1 line-clamp-2 uppercase tracking-tight h-8 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] text-green-500 font-bold mb-2">
          {product.stock > 0 ? 'Em estoque' : 'Fora de estoque'}
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
              <span className="text-[10px] text-gray-400 line-through">Kz {product.oldPrice.toLocaleString()}</span>
            )}
            <span className="text-sm font-black text-primary">Kz {product.price.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <ShoppingCart className="w-5 h-5" /> {/* 👈 CORRIGIDO: Search → ShoppingCart */}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Paginação (mantido igual)
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  totalItems: number;
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

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
      <div className="text-sm text-gray-500">
        <span className="font-bold text-gray-700">{totalItems}</span> produtos encontrados
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
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
          className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Componente de Filtros (mantido igual)
interface FiltersPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories: Category[];
  onClose?: () => void;
  isMobile?: boolean;
}

const FiltersPanel = ({ filters, onFilterChange, categories, onClose, isMobile }: FiltersPanelProps) => {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000000
  });

  const handleCategoryChange = (categoryId: number) => {
    onFilterChange({
      ...filters,
      category: filters.category === categoryId ? undefined : categoryId
    });
  };

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleStockChange = (inStock: boolean) => {
    onFilterChange({ ...filters, inStock });
  };

  const handlePriceChange = () => {
    onFilterChange({
      ...filters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    setPriceRange({ min: 0, max: 1000000 });
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${isMobile ? 'h-full overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </h3>
        {Object.keys(filters).length > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary font-bold hover:underline"
          >
            Limpar todos
          </button>
        )}
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ordenação */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Ordenar por</h4>
        <div className="space-y-2">
          {[
            { value: 'newest', label: 'Mais recentes' },
            { value: 'price_asc', label: 'Menor preço' },
            { value: 'price_desc', label: 'Maior preço' },
          ].map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={() => handleSortChange(option.value as any)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-600">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Categorias</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === cat.id}
                onChange={() => handleCategoryChange(cat.id)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-600">{cat.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{cat.products_count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Faixa de preço</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Mínimo</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Máximo</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="1000000"
              />
            </div>
          </div>
          <button
            onClick={handlePriceChange}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Disponível em estoque */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => handleStockChange(e.target.checked)}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-600">Apenas em estoque</span>
        </label>
      </div>
    </div>
  );
};

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState<SearchFilters>({});

  // Carregar categorias para os filtros
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.list({ is_active: true });
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  // Carregar resultados da busca
  useEffect(() => {
    const loadSearchResults = async () => {
      setLoading(true);
      try {
        const results = await searchService.search(query, currentPage, filters);
        setProducts(results.results);
        setTotalItems(results.count);
        setTotalPages(Math.ceil(results.count / 30));
      } catch (error) {
        console.error('Erro ao carregar resultados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [query, currentPage, filters]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetar para primeira página ao filtrar
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get('search') as string;
    setSearchParams({ q: newQuery });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header da busca */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">
          {query ? `Resultados para "${query}"` : 'Todos os produtos'}
        </h1>
        {!loading && (
          <p className="text-gray-400">
            {totalItems} {totalItems === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        )}
      </div>

      {/* Barra de busca mobile */}
      <div className="md:hidden mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Buscar produtos..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary"
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Layout desktop */}
      <div className="flex gap-8">
        {/* Sidebar de filtros - desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />
        </div>

        {/* Resultados */}
        <div className="flex-1">
          {/* Barra de busca desktop */}
          <div className="hidden md:block mb-6">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                name="search"
                defaultValue={query}
                placeholder="Buscar produtos..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Grid de produtos */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Nenhum produto encontrado</p>
              <p className="text-sm text-gray-400 mt-2">
                Tente buscar por outros termos ou remover alguns filtros.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de filtros mobile */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 md:hidden overflow-hidden"
            >
              <FiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                onClose={() => setShowMobileFilters(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}