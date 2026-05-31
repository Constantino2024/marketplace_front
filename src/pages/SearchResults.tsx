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
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchService, SearchProduct, SearchFilters } from '../services/search';
import { useCart } from '../context/CartContext';
import { categoriesService, Category } from '../services/categories';

// Constantes de validação
const VALIDATION = {
  MIN_PRICE: 0,
  MAX_PRICE: 10000000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
} as const;

// Função utilitária para validar e sanitizar valor numérico
const sanitizeNumber = (value: string | number, min: number, max: number, fallback: number = min): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }
  
  const rounded = Math.round(num * 100) / 100;
  
  return Math.min(Math.max(rounded, min), max);
};

// Componente de Product Card
const ProductCard = ({ product }: { product: SearchProduct }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const discount = product.oldPrice 
    ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%` 
    : undefined;

  const safePrice = sanitizeNumber(product.price, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0);
  const safeOldPrice = product.oldPrice 
    ? sanitizeNumber(product.oldPrice, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0)
    : null;

  const safeStock = Math.max(0, Math.floor(product.stock || 0));

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
        <p className={`text-[10px] font-bold mb-2 ${safeStock > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {safeStock > 0 ? `Em stock (${safeStock} disponíveis)` : 'Fora de stock'}
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
            {safeOldPrice && safeOldPrice > safePrice && (
              <span className="text-[10px] text-gray-400 line-through">
                Kz {safeOldPrice.toLocaleString()}
              </span>
            )}
            <span className="text-sm font-black text-primary">
              Kz {safePrice.toLocaleString()}
            </span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (safeStock > 0 && safePrice > 0) {
                addToCart({
                  ...product,
                  price: safePrice,
                  stock: safeStock,
                  oldPrice: safeOldPrice || undefined
                });
              }
            }}
            disabled={safeStock <= 0 || safePrice <= 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              safeStock <= 0 || safePrice <= 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-50 text-gray-400 hover:bg-primary hover:text-white'
            }`}
            title={safeStock <= 0 ? 'Produto fora de stock' : 'Adicionar ao carrinho'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Paginação
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
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const safeTotalPages = Math.max(1, totalPages);
  const safeTotalItems = Math.max(0, totalItems);

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= safeTotalPages; i++) {
      if (i === 1 || i === safeTotalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
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
        <span className="font-bold text-gray-700">{safeTotalItems.toLocaleString()}</span> produtos encontrados
      </div>
      {safeTotalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1}
            className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Primeira página"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={`page-${index}`}
              onClick={() => typeof page === 'number' ? onPageChange(page) : null}
              disabled={typeof page !== 'number'}
              className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
                page === safeCurrentPage
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={typeof page === 'number' ? `Página ${page}` : undefined}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === safeTotalPages}
            className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safeCurrentPage === safeTotalPages}
            className="p-2 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Última página"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Componente de Input de Preço com Validação
interface PriceInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
}

const PriceInput = ({ label, value, onChange, placeholder, error }: PriceInputProps) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLocalValue(value.toString());
    setHasError(false);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    const sanitized = rawValue.replace(/[^0-9.,]/g, '');
    setLocalValue(sanitized);
    
    const numValue = parseFloat(sanitized.replace(',', '.'));
    
    if (sanitized === '' || isNaN(numValue)) {
      setHasError(false);
      return;
    }

    if (numValue < VALIDATION.MIN_PRICE) {
      setHasError(true);
      return;
    }

    if (numValue > VALIDATION.MAX_PRICE) {
      setHasError(true);
      onChange(VALIDATION.MAX_PRICE);
      setLocalValue(VALIDATION.MAX_PRICE.toString());
      return;
    }

    setHasError(false);
    onChange(numValue);
  };

  const handleBlur = () => {
    const sanitized = sanitizeNumber(localValue, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE);
    setLocalValue(sanitized.toString());
    onChange(sanitized);
    setHasError(false);
  };

  return (
    <div>
      <label className="text-[10px] text-gray-400 mb-1 block">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 ${
          hasError || error
            ? 'border-red-300 focus:ring-red-500 text-red-600'
            : 'border-gray-200 focus:ring-primary'
        }`}
        placeholder={placeholder}
      />
      {(hasError || error) && (
        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error || `Valor deve ser entre ${VALIDATION.MIN_PRICE.toLocaleString()} e ${VALIDATION.MAX_PRICE.toLocaleString()}`}
        </p>
      )}
    </div>
  );
};

// Componente de Filtros
interface FiltersPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories: Category[];
  onClose?: () => void;
  isMobile?: boolean;
}

const FiltersPanel = ({ filters, onFilterChange, categories, onClose, isMobile }: FiltersPanelProps) => {
  const [priceRange, setPriceRange] = useState({
    min: sanitizeNumber(filters.minPrice || 0, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0),
    max: sanitizeNumber(filters.maxPrice || 1000000, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 1000000)
  });
  const [priceError, setPriceError] = useState<string | null>(null);

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
    const sanitizedMin = sanitizeNumber(priceRange.min, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0);
    const sanitizedMax = sanitizeNumber(priceRange.max, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 1000000);
    
    if (sanitizedMin > sanitizedMax) {
      setPriceError('O valor mínimo não pode ser maior que o máximo');
      return;
    }
    
    if (sanitizedMin === sanitizedMax && sanitizedMin > 0) {
      setPriceError('Os valores devem ser diferentes');
      return;
    }
    
    setPriceError(null);
    
    onFilterChange({
      ...filters,
      minPrice: sanitizedMin > 0 ? sanitizedMin : undefined,
      maxPrice: sanitizedMax < VALIDATION.MAX_PRICE ? sanitizedMax : undefined
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    setPriceRange({ min: 0, max: 1000000 });
    setPriceError(null);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || 
    priceRange.min > 0 || 
    priceRange.max < 1000000;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${isMobile ? 'h-full overflow-y-auto' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
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
              <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
              <span className="text-xs text-gray-400">
                {Math.max(0, cat.products_count || 0)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Faixa de preço (Kz)</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <PriceInput
                label="Mínimo"
                value={priceRange.min}
                onChange={(value) => setPriceRange({ ...priceRange, min: value })}
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <PriceInput
                label="Máximo"
                value={priceRange.max}
                onChange={(value) => setPriceRange({ ...priceRange, max: value })}
                placeholder="1.000.000"
              />
            </div>
          </div>
          
          {(priceRange.min > 0 || priceRange.max < VALIDATION.MAX_PRICE) && (
            <div className="text-[10px] text-gray-500 bg-gray-50 rounded-lg p-2">
              Faixa selecionada: Kz {priceRange.min.toLocaleString()} - Kz {priceRange.max.toLocaleString()}
            </div>
          )}
          
          {priceError && (
            <div className="flex items-center gap-2 text-[11px] text-red-500 bg-red-50 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {priceError}
            </div>
          )}
          
          <button
            onClick={handlePriceChange}
            disabled={!!priceError}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
              priceError
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            Aplicar faixa de preço
          </button>
        </div>
      </div>

      {/* Disponível em stock */}
      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => handleStockChange(e.target.checked)}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-600">Apenas em stock</span>
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          Valores entre Kz {VALIDATION.MIN_PRICE.toLocaleString()} e Kz {VALIDATION.MAX_PRICE.toLocaleString()}
        </p>
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
  
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return Math.max(1, isNaN(page) ? 1 : page);
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filters, setFilters] = useState<SearchFilters>({});

  const sanitizeProducts = useCallback((rawProducts: SearchProduct[]): SearchProduct[] => {
    return rawProducts.map(product => ({
      ...product,
      id: product.id,
      name: product.name || 'Produto sem nome',
      price: sanitizeNumber(product.price, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0),
      oldPrice: product.oldPrice 
        ? sanitizeNumber(product.oldPrice, VALIDATION.MIN_PRICE, VALIDATION.MAX_PRICE, 0)
        : undefined,
      stock: Math.max(0, Math.floor(product.stock || 0)),
      rating: Math.max(0, Math.min(5, product.rating || 0)),
    })).filter(product => product.price > 0);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.list({ is_active: true });
        setCategories(data.map(cat => ({
          ...cat,
          products_count: Math.max(0, cat.products_count || 0)
        })));
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadSearchResults = async () => {
      const safePage = Math.max(1, currentPage);
      
      setLoading(true);
      try {
        const results = await searchService.search(query, safePage, filters);
        const sanitizedProducts = sanitizeProducts(results.results);
        
        setProducts(sanitizedProducts);
        setTotalItems(Math.max(0, results.count || 0));
        setTotalPages(Math.max(1, Math.ceil(results.count / 30)));
        
        if (safePage > Math.ceil(results.count / 30) && results.count > 0) {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query, currentPage, filters, sanitizeProducts]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // FUNÇÃO clearFonts DEFINIDA AQUI - era o que faltava
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = (formData.get('search') as string || '').trim();
    
    if (newQuery.length === 0) {
      setSearchParams({});
      return;
    }
    
    const sanitizedQuery = newQuery.slice(0, 200);
    setSearchParams({ q: sanitizedQuery });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header da busca */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">
          {query ? (
            <>
              Resultados para &ldquo;
              <span className="text-primary">{query.slice(0, 100)}</span>
              {query.length > 100 ? '...' : ''}
              &rdquo;
            </>
          ) : 'Todos os produtos'}
        </h1>
        {!loading && (
          <p className="text-gray-400">
            {totalItems.toLocaleString()} {totalItems === 1 ? 'produto encontrado' : 'produtos encontrados'}
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
            placeholder="Pesquisar produtos..."
            maxLength={200}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary"
            aria-label="Abrir filtros"
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Layout desktop */}
      <div className="flex gap-8">
        {/* Sidebar de filtros - desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 min-w-0">
          {/* Barra de busca desktop */}
          <div className="hidden md:block mb-6">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                name="search"
                defaultValue={query}
                placeholder="Pesquisar produtos..."
                maxLength={200}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Grid de produtos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-gray-400">Carregando produtos...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">Nenhum produto encontrado</p>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Tente pesquisar por outros termos ou remover alguns filtros.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
              >
                Limpar filtros
              </button>
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
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 md:hidden overflow-hidden"
            >
              <FiltersPanel
                filters={filters}
                onFilterChange={(newFilters) => {
                  handleFilterChange(newFilters);
                  setShowMobileFilters(false);
                }}
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