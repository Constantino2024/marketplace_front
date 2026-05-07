import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  ShoppingCart, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Menu,
  MapPin,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Truck,
  Tag,
  BadgePercent,
  Leaf,
  Heart,
  Eye,
  Package,
  Store,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { createProductSlug } from '../utils/slug';
import { formatCurrency } from '../utils/currency';
import { useCart, Product } from '../context/CartContext';
import { homeService, HomeCategory, HomeProduct, Banner, Promotion, Feature, SiteConfig, CategoryWithProducts } from '../services/home';
import { ProductCardSkeleton, CategorySkeleton, Skeleton } from '../components/Skeleton';

import bannerLocal from '../img/banner.png';

// --- Toast Component ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const createSlug = (name: string, id?: number): string => {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return id ? `${slug}-${id}` : slug;
};

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-xl flex items-center gap-2 sm:gap-3 text-sm sm:text-base max-w-[90%] sm:max-w-md ${
        type === 'success' ? 'bg-emerald-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
      } text-white`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> :
       type === 'error' ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> :
       <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
      <p className="font-bold flex-1 text-xs sm:text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 sm:ml-4 hover:opacity-80 flex-shrink-0">
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </motion.div>
  );
};

// --- Hero Component ---
const Hero = ({ banners }: { banners: Banner[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = banners.length > 0 ? banners : [
    { 
      id: 1, 
      title: 'Poppies on the sea', 
      subtitle: "SS'24", 
      image_url: bannerLocal,
      button_text: 'Comprar agora',
      link: '/',
      description: '',
      position: 1,
      discount_text: ''
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
      <div className="max-w-7xl mx-auto relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9]">
        <div 
          className="carousel-container h-full flex transition-transform duration-500 ease-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative flex-shrink-0">
              <img 
                src={slide.image_url} 
                alt={slide.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent flex items-center px-3 sm:px-6 md:px-8 lg:px-12">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={currentSlide}
                  className="text-white max-w-[85%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%]"
                >
                  {slide.subtitle && (
                    <p className="text-xs sm:text-lg md:text-xl lg:text-2xl font-light italic mb-0.5 sm:mb-1 md:mb-2">{slide.subtitle}</p>
                  )}
                  <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  {slide.button_text && (
                    <Link 
                      to={slide.link || '#'}
                      className="inline-block mt-2 sm:mt-4 md:mt-6 bg-orange-500 text-white px-3 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-3 rounded-lg text-xs sm:text-sm md:text-base font-bold hover:bg-orange-600 transition-all"
                    >
                      {slide.button_text}
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Buttons - Hide on mobile/tablet */}
        <button 
          onClick={prevSlide}
          className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/80 items-center justify-center hover:bg-white transition-colors z-10"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
        </button>
        <button 
          onClick={nextSlide}
          className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/80 items-center justify-center hover:bg-white transition-colors z-10"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 md:gap-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                currentSlide === i ? 'bg-orange-500 w-3 sm:w-4 md:w-5' : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Category Circles ---
interface CategoryCirclesProps {
  categories: HomeCategory[];
  loading: boolean;
}

const CategoryCircles = ({ categories, loading }: CategoryCirclesProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      checkScroll();
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categories]);

  if (loading) {
    return (
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-blue-900 mb-3 sm:mb-4 md:mb-6">
            CATEGORIAS
          </h2>
          <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[...Array(8)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-blue-900">
            CATEGORIAS
          </h2>
          <div className="hidden sm:flex gap-1 md:gap-2">
            {showLeftArrow && (
              <button 
                onClick={() => scroll('left')}
                className="p-1 md:p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors"
                aria-label="Categorias anteriores"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
            {showRightArrow && (
              <button 
                onClick={() => scroll('right')}
                className="p-1 md:p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors"
                aria-label="Próximas categorias"
              >
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-3 sm:pb-4 no-scrollbar scroll-smooth"
        >
          {categories.map((cat) => (
            <Link 
              to={`/category/${cat.slug}`} 
              key={cat.id} 
              className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 min-w-[80px] sm:min-w-[90px] md:min-w-[100px] lg:min-w-[120px] group"
            >
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm group-hover:scale-105 transition-transform cursor-pointer bg-gray-50">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-900/10 flex items-center justify-center">
                      <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-900/40" />
                    </div>
                  )}
                </div>
                {!cat.is_global && cat.company_name && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <Store className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-600 text-center line-clamp-2 max-w-[70px] sm:max-w-[80px] md:max-w-[100px] group-hover:text-orange-500 transition-colors">
                {cat.name}
              </span>
              <span className="text-[7px] sm:text-[8px] md:text-[10px] text-gray-400">
                {cat.products_count} {cat.products_count === 1 ? 'produto' : 'produtos'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Product Card ---
interface ProductCardProps {
  product: HomeProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const isWishlisted = wishlist.includes(product.id);

  const discount = product.oldPrice 
    ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%` 
    : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 1500);
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 hover:shadow-xl transition-all relative overflow-hidden h-full flex flex-col">
      <AnimatePresence>
        {showAddedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-0 z-20 bg-orange-500 text-white text-center py-1 sm:py-1.5 md:py-2 text-[8px] sm:text-[9px] md:text-xs font-bold"
          >
            ✓ Adicionado ao carrinho
          </motion.div>
        )}
      </AnimatePresence>

      {discount && (
        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 bg-orange-500 text-white text-[7px] sm:text-[8px] md:text-[10px] font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-0.5 rounded-full z-10">
          {discount}
        </span>
      )}
      
      {product.company_name && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 bg-blue-900/10 text-blue-900 text-[6px] sm:text-[7px] md:text-[8px] font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded-full z-10 flex items-center gap-0.5 sm:gap-1">
          <Store className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5" />
          <span className="hidden xs:inline truncate max-w-[60px] sm:max-w-[80px]">{product.company_name}</span>
        </div>
      )}

      <div className="absolute top-8 sm:top-10 md:top-12 right-1.5 sm:right-2 md:right-3 flex flex-col gap-1 sm:gap-1.5 md:gap-2 translate-x-10 sm:translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-orange-500'
          }`}
          aria-label={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <Link 
          to={`/product/${createProductSlug(product.name, product.id)}`}
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-md hover:text-orange-500 transition-colors"
          aria-label="Ver detalhes"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </Link>
      </div>

      <Link to={`/product/${createProductSlug(product.name, product.id)}`} className="block aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl mb-1.5 sm:mb-2 md:mb-4 bg-gray-50">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-300" />
          </div>
        )}
      </Link>

      <div className="px-0.5 sm:px-1 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-800 mb-0.5 sm:mb-1 line-clamp-2 uppercase tracking-tight h-7 sm:h-8 md:h-10 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[7px] sm:text-[8px] md:text-[10px] text-green-500 font-bold mb-0.5 sm:mb-1 md:mb-2">
          {product.stock > 0 ? 'Em estoque' : 'Fora de estoque'}
        </p>
        <div className="flex gap-0.5 mb-1 sm:mb-1.5 md:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[5px] sm:text-[6px] md:text-[10px] text-gray-400 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            <span className="text-[10px] sm:text-xs md:text-sm font-black text-blue-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Category Carousel ---
interface CategoryCarouselProps {
  category: CategoryWithProducts;
  loading: boolean;
}

const CategoryCarousel = ({ category, loading }: CategoryCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps'
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (loading) {
    return (
      <div className="mb-6 sm:mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <Skeleton className="h-5 sm:h-6 w-28 sm:w-36 md:w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (category.products.length === 0) return null;

  return (
    <div className="mb-6 sm:mb-8 md:mb-12">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2 sm:mb-3 md:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {category.image_url && (
            <img 
              src={category.image_url} 
              alt={category.name}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-orange-500/20"
              loading="lazy"
            />
          )}
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-blue-900">{category.name}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to={`/category/${category.id}`}
            className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase text-gray-500 hover:text-orange-500 flex items-center gap-0.5 sm:gap-1 transition-colors"
          >
            Ver todos
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Link>
          <div className="hidden sm:flex gap-1 md:gap-2">
            <button 
              onClick={scrollPrev}
              className="p-1 md:p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={category.products.length <= 5}
              aria-label="Produtos anteriores"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-1 md:p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={category.products.length <= 5}
              aria-label="Próximos produtos"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 sm:gap-3 md:gap-4">
          {category.products.map((product) => (
            <div 
              key={product.id} 
              className="flex-[0_0_48%] xs:flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_25%] lg:flex-[0_0_20%] xl:flex-[0_0_16.666%] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2 mt-2 sm:mt-3 md:mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                index === selectedIndex 
                  ? 'bg-blue-900 w-2.5 sm:w-3 md:w-4' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Promo Banners ---
const PromoBanners = ({ banners }: { banners: Banner[] }) => {
  const promoBanners = banners.length > 0 ? banners : [
    {
      id: 1,
      title: 'GROCERY',
      subtitle: 'MEGA SALE',
      description: 'IN ALL PRODUCTS',
      image_url: 'https://picsum.photos/seed/promo1/800/400',
      link: '/',
      position: 2,
      discount_text: '',
      button_text: ''
    },
    {
      id: 2,
      title: 'FASHION',
      subtitle: 'SALE',
      description: 'GET UP TO 60% OFF',
      image_url: 'https://picsum.photos/seed/promo2/800/400',
      link: '/',
      position: 2,
      discount_text: '',
      button_text: ''
    },
    {
      id: 3,
      title: 'NEW-SEASON',
      subtitle: 'DRESSES',
      description: 'UP TO 70% OFF',
      image_url: 'https://picsum.photos/seed/promo3/800/400',
      link: '/',
      position: 2,
      discount_text: '',
      button_text: ''
    },
  ];

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {promoBanners.slice(0, 3).map((banner) => (
          <Link
            key={banner.id}
            to={banner.link || '#'}
            className="rounded-lg sm:rounded-xl overflow-hidden relative h-28 xs:h-32 sm:h-36 md:h-40 lg:h-48 group cursor-pointer"
          >
            <img 
              src={banner.image_url} 
              alt={banner.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-900/30 to-transparent p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col justify-center">
              <h3 className="text-xs sm:text-sm md:text-base lg:text-xl font-black uppercase leading-tight text-white">
                {banner.title}<br/>{banner.subtitle}
              </h3>
              {banner.description && (
                <p className="text-[7px] sm:text-[8px] md:text-[10px] font-bold mt-0.5 sm:mt-1 text-orange-200">{banner.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// --- Featured Products Carousel ---
interface FeaturedCarouselProps {
  products: HomeProduct[];
  loading: boolean;
}

const FeaturedCarousel = ({ products, loading }: FeaturedCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps'
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (loading) {
    return (
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm sm:text-base md:text-lg font-black text-blue-900 mb-3 sm:mb-4">PRODUTOS EM DESTAQUE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base md:text-lg font-black text-blue-900">PRODUTOS EM DESTAQUE</h2>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={scrollPrev}
              className="p-1 md:p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={products.length <= 5}
              aria-label="Produtos anteriores"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-1 md:p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={products.length <= 5}
              aria-label="Próximos produtos"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-[0_0_48%] xs:flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_25%] lg:flex-[0_0_20%] xl:flex-[0_0_16.666%] min-w-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2 mt-2 sm:mt-3 md:mt-4">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  index === selectedIndex 
                    ? 'bg-blue-900 w-2.5 sm:w-3 md:w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Newsletter ---
const Newsletter = ({ config }: { config: SiteConfig }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setToast({
        message: 'Por favor, insira um email válido',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    const result = await homeService.subscribeNewsletter(email);
    setIsLoading(false);
    
    setToast({
      message: result.message,
      type: result.success ? 'success' : 'error'
    });

    if (result.success) {
      setEmail('');
    }
  };

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

      <section className="bg-blue-900 py-8 sm:py-12 md:py-16 px-4 md:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12 relative z-10">
          <div className="text-white max-w-xl text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 md:mb-6 leading-tight">
              Assine nossa newsletter
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/70 mb-4 sm:mb-6 md:mb-8">
              Receba ofertas exclusivas e novidades
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col xs:flex-row gap-2 max-w-md mx-auto lg:mx-0">
              <div className="relative flex-1">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white rounded-lg pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 md:py-4 text-sm sm:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg text-xs sm:text-sm md:text-base font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
                    <span className="hidden xs:inline text-xs sm:text-sm">A processar...</span>
                  </>
                ) : (
                  'Inscrever'
                )}
              </button>
            </form>
          </div>
          
          <div className="hidden lg:block w-1/3">
            <img 
              src="https://picsum.photos/seed/news/600/600" 
              alt="Newsletter" 
              className="w-full h-auto opacity-80 rounded-2xl"
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </section>
    </>
  );
};



// --- Sell Button Section ---
const SellButton = () => (
  <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
    <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 md:p-8 lg:p-12 gap-4 md:gap-6">
        <div className="text-white text-center md:text-left">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-1 sm:mb-2">Venda na maior plataforma HSE de Angola!</h3>
          <p className="text-xs sm:text-sm md:text-base text-blue-100">
            Junte-se a milhares de vendedores e expanda seus negócios
          </p>
        </div>
        <Link 
          to="/company/register" 
          className="bg-orange-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
        >
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          Quero vender
        </Link>
      </div>
    </div>
  </section>
);

// --- Secondary Banners ---
const SecondaryBanners = ({ promotions }: { promotions: Promotion[] }) => {
  const promoItems = promotions.length > 0 ? promotions : [
    {
      id: 1,
      title: 'CELL PHONES',
      description: 'Lorem khaled ipsum is major key to success',
      discount: '50% OFF',
      image_url: 'https://picsum.photos/seed/phone/150/150',
      link: '/',
      background_color: 'bg-blue-50',
      border_color: 'border-blue-100',
      discount_badge_color: 'bg-orange-500'
    },
    {
      id: 2,
      title: 'SAMSUNG WATCH',
      description: '',
      discount: 'SALE 75% OFF',
      image_url: 'https://picsum.photos/seed/watch/150/150',
      link: '/',
      background_color: 'bg-orange-50',
      border_color: 'border-orange-100',
      discount_badge_color: 'bg-blue-900'
    },
    {
      id: 3,
      title: 'CAMERA SALE',
      description: '',
      discount: 'SAVE UP TO 50% OFF',
      image_url: 'https://picsum.photos/seed/camera/150/150',
      link: '/',
      background_color: 'bg-blue-50',
      border_color: 'border-blue-100',
      discount_badge_color: 'bg-orange-500'
    },
  ];

  return (
    <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {promoItems.slice(0, 3).map((promo) => (
          <Link
            key={promo.id}
            to={promo.link || '#'}
            className={`${promo.background_color} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex items-center justify-between group cursor-pointer border ${promo.border_color} hover:shadow-md transition-shadow`}
          >
            <div className="flex-1 min-w-0">
              <span className={`${promo.discount_badge_color} text-white text-[7px] sm:text-[8px] md:text-[10px] font-bold px-1 sm:px-1.5 md:px-2 py-0.5 rounded mb-1 sm:mb-1.5 md:mb-2 inline-block whitespace-nowrap`}>
                {promo.discount}
              </span>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-blue-900 uppercase leading-tight">{promo.title}</h3>
              {promo.description && (
                <p className="text-[7px] sm:text-[8px] md:text-[10px] text-gray-600 mt-0.5 sm:mt-1 md:mt-2 line-clamp-2">{promo.description}</p>
              )}
            </div>
            <img 
              src={promo.image_url} 
              alt={promo.title} 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain group-hover:scale-110 transition-transform flex-shrink-0 ml-2 sm:ml-3 md:ml-4" 
              loading="lazy" 
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

// --- Main Component ---
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>([]);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [sidebarBanners, setSidebarBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({} as SiteConfig);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const data = await homeService.getHomeData();
        setCategories(data.categories_with_products.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image_url: c.image_url,
          products_count: c.products.length,
          is_global: true,
          company_name: undefined
        })));
        setCategoriesWithProducts(data.categories_with_products);
        setFeaturedProducts(data.featured_products);
        setHeroBanners(data.hero_banners);
        setPromoBanners(data.promo_banners);
        setSidebarBanners(data.sidebar_banners);
        setPromotions(data.promotions);
        setFeatures(data.features);
        setSiteConfig(data.site_config);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <main className="overflow-x-hidden">
      <Hero banners={heroBanners} />
      <CategoryCircles categories={categories} loading={loading} />
      
      {/* Sidebar Banners */}
      {sidebarBanners.length > 0 && (
        <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {sidebarBanners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link || '#'}
                className="rounded-lg sm:rounded-xl overflow-hidden relative h-28 xs:h-32 sm:h-36 md:h-40 lg:h-48 group cursor-pointer"
              >
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-900/30 to-transparent p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col justify-center">
                  {banner.discount_text && (
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-orange-200">{banner.discount_text}</p>
                  )}
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-white">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm text-white/90">{banner.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorias com Produtos */}
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2 sm:space-y-3 md:space-y-4">
                  <Skeleton className="h-5 sm:h-6 md:h-8 w-28 sm:w-36 md:w-48" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {[...Array(5)].map((_, j) => (
                      <ProductCardSkeleton key={j} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {categoriesWithProducts.map((category) => (
                <CategoryCarousel 
                  key={category.id} 
                  category={category} 
                  loading={false} 
                />
              ))}
            </>
          )}
        </div>
      </section>

      <PromoBanners banners={promoBanners} />
      
      <FeaturedCarousel products={featuredProducts} loading={loading} />
      
      <SecondaryBanners promotions={promotions} />
      
      <SellButton />
      
      <Newsletter config={siteConfig} />
      
    </main>
  );
}