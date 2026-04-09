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
import bannerLocal from '../img/banner.png';
import { createProductSlug } from '../utils/slug';
import { formatCurrency } from '../utils/currency';
import { useCart, Product } from '../context/CartContext';
import { homeService, HomeCategory, HomeProduct, Banner, Promotion, Feature, SiteConfig, CategoryWithProducts } from '../services/home';
import { ProductCardSkeleton, CategorySkeleton, Skeleton } from '../components/Skeleton';

// --- Toast Component ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

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
      <p className="font-bold flex-1">{message}</p>
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
    <section className="px-2 sm:px-4 md:px-8 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
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
              />
              <div className="absolute inset-0 bg-black/20 flex items-center px-4 sm:px-8 md:px-12">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={currentSlide}
                  className="text-white max-w-[80%] sm:max-w-none"
                >
                  {slide.subtitle && (
                    <p className="text-lg sm:text-2xl font-light italic mb-1 sm:mb-2">{slide.subtitle}</p>
                  )}
                  <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  {slide.button_text && (
                    <Link 
                      to={slide.link || '#'}
                      className="inline-block mt-3 sm:mt-6 bg-orange-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-orange-600 transition-all"
                    >
                      {slide.button_text}
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Buttons - Hide on mobile */}
        <button 
          onClick={prevSlide}
          className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 items-center justify-center hover:bg-white transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
        </button>
        <button 
          onClick={nextSlide}
          className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 items-center justify-center hover:bg-white transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                currentSlide === i ? 'bg-orange-500 w-3 sm:w-4' : 'bg-white/50'
              }`}
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-900 mb-4 sm:mb-6">
            CATEGORIAS
          </h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar">
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
    <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-900">
            CATEGORIAS
          </h2>
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-blue-900 hover:text-orange-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-1 border border-gray-200 rounded hover:bg-gray-50 text-blue-900 hover:text-orange-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {categories.map((cat) => (
            <Link 
              to={`/category/${cat.id}`} 
              key={cat.id} 
              className="flex flex-col items-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[120px] group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm group-hover:scale-105 transition-transform cursor-pointer relative">
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-900/10 flex items-center justify-center">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-900/40" />
                  </div>
                )}
                {!cat.is_global && cat.company_name && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Store className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-600 text-center line-clamp-2 group-hover:text-orange-500">
                {cat.name}
              </span>
              <span className="text-[8px] sm:text-[10px] text-gray-400">
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
    <div className="group bg-white border border-gray-100 rounded-lg sm:rounded-2xl p-2 sm:p-3 hover:shadow-xl transition-all relative overflow-hidden h-full flex flex-col">
      <AnimatePresence>
        {showAddedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 top-0 z-20 bg-orange-500 text-white text-center py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold"
          >
            ✓ Adicionado ao carrinho
          </motion.div>
        )}
      </AnimatePresence>

      {discount && (
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full z-10">
          {discount}
        </span>
      )}
      
      {product.company_name && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-900/10 text-blue-900 text-[6px] sm:text-[8px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full z-10 flex items-center gap-0.5 sm:gap-1">
          <Store className="w-2 h-2 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">{product.company_name}</span>
        </div>
      )}

      <div className="absolute top-10 sm:top-12 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 translate-x-10 sm:translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-orange-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <Link 
          to={`/product/${createProductSlug(product.name, product.id)}`}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-md hover:text-orange-500 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>

      <Link to={`/product/${createProductSlug(product.name, product.id)}`} className="block aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl mb-2 sm:mb-4 bg-gray-50">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
          </div>
        )}
      </Link>

      <div className="px-1 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 mb-1 line-clamp-2 uppercase tracking-tight h-8 sm:h-10 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[8px] sm:text-[10px] text-green-500 font-bold mb-1 sm:mb-2">
          {product.stock > 0 ? 'Em estoque' : 'Fora de estoque'}
        </p>
        <div className="flex gap-0.5 mb-2 sm:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-2 h-2 sm:w-3 sm:h-3 ${i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[6px] sm:text-[10px] text-gray-400 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-black text-blue-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
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
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (category.products.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {category.image_url && (
            <img 
              src={category.image_url} 
              alt={category.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-500/20"
            />
          )}
          <h2 className="text-base sm:text-lg font-black text-blue-900">{category.name}</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to={`/category/${category.id}`}
            className="text-[10px] sm:text-xs font-bold uppercase text-gray-500 hover:text-orange-500 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="w-3 h-3" />
          </Link>
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={scrollPrev}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={category.products.length <= 5}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={category.products.length <= 5}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 sm:gap-4">
          {category.products.map((product) => (
            <div 
              key={product.id} 
              className="flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_25%] lg:flex-[0_0_20%] xl:flex-[0_0_16.666%] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                index === selectedIndex 
                  ? 'bg-blue-900 w-3 sm:w-4' 
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
    <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {promoBanners.slice(0, 3).map((banner) => (
          <Link
            key={banner.id}
            to={banner.link || '#'}
            className="rounded-lg sm:rounded-xl overflow-hidden relative h-32 sm:h-40 md:h-48 group cursor-pointer"
          >
            <img 
              src={banner.image_url} 
              alt={banner.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy" 
            />
            <div className="absolute inset-0 bg-blue-900/40 p-3 sm:p-4 md:p-6 flex flex-col justify-center text-white">
              <h3 className="text-base sm:text-lg md:text-xl font-black uppercase leading-tight">
                {banner.title}<br/>{banner.subtitle}
              </h3>
              {banner.description && (
                <p className="text-[8px] sm:text-[10px] font-bold mt-1 text-orange-200">{banner.description}</p>
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
      <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-base sm:text-lg font-black text-blue-900 mb-3 sm:mb-4">PRODUTOS EM DESTAQUE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
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
    <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-black text-blue-900">PRODUTOS EM DESTAQUE</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={scrollPrev}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={products.length <= 5}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={products.length <= 5}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2 sm:gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_25%] lg:flex-[0_0_20%] xl:flex-[0_0_16.666%] min-w-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  index === selectedIndex 
                    ? 'bg-blue-900 w-3 sm:w-4' 
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

  const discountAmount = config?.newsletter_discount_amount || 20000;
  const discountPercent = config?.newsletter_discount || 10;

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

      <section className="bg-blue-900 py-10 sm:py-16 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div className="text-white max-w-xl text-center lg:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4 text-orange-300">
              Desconto de Kz {discountAmount.toLocaleString()} no seu primeiro pedido
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 leading-tight">
              Assine nossa newsletter e receba...
            </h2>
            <p className="text-sm sm:text-base text-white/70 mb-6 sm:mb-8">
              Receba {discountPercent}% de desconto na primeira compra!
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto lg:mx-0">
              <div className="relative flex-1">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white rounded-lg pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden xs:inline">A processar...</span>
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
        
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </section>
    </>
  );
};

// --- Features ---
const Features = ({ features }: { features: Feature[] }) => {
  const defaultFeatures = [
    { icon: 'Leaf', text: 'Produtos frescos todos os dias', color: 'text-blue-900' },
    { icon: 'Truck', text: 'Entrega gratuita para encomendas acima de 70 dólares', color: 'text-orange-500' },
    { icon: 'BadgePercent', text: 'Mega descontos diários', color: 'text-blue-900' },
    { icon: 'Tag', text: 'Melhor preço do mercado', color: 'text-orange-500' },
  ];

  const featureItems = features.length > 0 ? features : defaultFeatures;

  const getIcon = (iconName: string, color: string) => {
    const iconClass = `w-5 h-5 sm:w-6 sm:h-6 ${color}`;
    switch(iconName) {
      case 'Leaf': return <Leaf className={iconClass} />;
      case 'Truck': return <Truck className={iconClass} />;
      case 'BadgePercent': return <BadgePercent className={iconClass} />;
      case 'Tag': return <Tag className={iconClass} />;
      default: return <Tag className={iconClass} />;
    }
  };

  return (
    <section className="border-y border-gray-100 py-8 sm:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {featureItems.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              {getIcon(feature.icon, feature.color)}
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-800 uppercase">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

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
    <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {promoItems.slice(0, 3).map((promo) => (
          <Link
            key={promo.id}
            to={promo.link || '#'}
            className={`${promo.background_color} rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center justify-between group cursor-pointer border ${promo.border_color}`}
          >
            <div className="flex-1">
              <span className={`${promo.discount_badge_color} text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded mb-1.5 sm:mb-2 inline-block`}>
                {promo.discount}
              </span>
              <h3 className="text-base sm:text-lg font-black text-blue-900 uppercase leading-tight">{promo.title}</h3>
              {promo.description && (
                <p className="text-[8px] sm:text-[10px] text-gray-600 mt-1 sm:mt-2 line-clamp-2">{promo.description}</p>
              )}
            </div>
            <img 
              src={promo.image_url} 
              alt={promo.title} 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain group-hover:scale-110 transition-transform flex-shrink-0 ml-2 sm:ml-4" 
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
        <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sidebarBanners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link || '#'}
                className="rounded-lg sm:rounded-xl overflow-hidden relative h-32 sm:h-40 md:h-48 group cursor-pointer"
              >
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-blue-900/40 p-3 sm:p-4 md:p-6 flex flex-col justify-center text-white">
                  {banner.discount_text && (
                    <p className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-orange-200">{banner.discount_text}</p>
                  )}
                  <h3 className="text-base sm:text-lg md:text-xl font-black">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-[10px] sm:text-xs">{banner.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorias com Produtos */}
      <section className="px-2 sm:px-4 md:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-8 sm:space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
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
      
      <Newsletter config={siteConfig} />
      
      <Features features={features} />
    </main>
  );
}