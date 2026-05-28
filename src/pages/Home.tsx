import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Mail,
  Truck,
  Shield,
  RefreshCcw,
  Headphones,
  Heart,
  Eye,
  Package,
  Store,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { createProductSlug } from '../utils/slug';
import { formatCurrency } from '../utils/currency';
import { useCart, Product } from '../context/CartContext';
import {
  homeService,
  HomeCategory,
  HomeProduct,
  Banner,
  Promotion,
  Feature,
  SiteConfig,
  CategoryWithProducts,
} from '../services/home';
import { ProductCardSkeleton, CategorySkeleton, Skeleton } from '../components/Skeleton';
import bannerLocal from '../img/banner.png';

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 max-w-sm ${
        type === 'success'
          ? 'bg-emerald-500'
          : type === 'error'
          ? 'bg-red-500'
          : 'bg-blue-500'
      } text-white`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <p className="font-bold flex-1 text-sm">{message}</p>
      <button onClick={onClose} className="hover:opacity-70 ml-2">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// ─── Hero Carousel ────────────────────────────────────────────────────────────
const Hero = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);
  const slides = banners.length > 0
    ? banners
    : [{
        id: 1,
        title: 'Bem-vindo ao HSE Marketplace Angola',
        subtitle: 'HSE Marketplace',
        image_url: bannerLocal,
        button_text: 'Explorar produtos',
        link: '/products',
        description: 'A sua loja completa em Angola.',
        position: 1,
        discount_text: '',
      }];

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="px-2 sm:px-4 lg:px-8 pt-3 pb-1">
      <div className="max-w-7xl mx-auto relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/7] md:aspect-[21/8]">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative flex-shrink-0">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-5 sm:px-10 md:px-14">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white max-w-[80%] sm:max-w-[55%]"
                >
                  {slide.subtitle && (
                    <span className="inline-block bg-orange-500 text-white text-[9px] sm:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded mb-2 sm:mb-3">
                      {slide.subtitle}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-4xl md:text-5xl font-black leading-tight mb-2 sm:mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  {slide.description && (
                    <p className="text-white/80 text-xs sm:text-sm md:text-base mb-3 sm:mb-5 hidden sm:block">
                      {slide.description}
                    </p>
                  )}
                  {slide.button_text && (
                    <Link
                      to={slide.link || '#'}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-7 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/30 hover:scale-105"
                    >
                      {slide.button_text}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* Nav arrows — desktop only */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 items-center justify-center hover:bg-white shadow-md transition-all z-10"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 text-blue-900" />
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 items-center justify-center hover:bg-white shadow-md transition-all z-10"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 text-blue-900" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                current === i ? 'bg-orange-500 w-5' : 'bg-white/60 w-1.5 hover:bg-white/90'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Trust Bar ────────────────────────────────────────────────────────────────
const TrustBar = () => {
  const items = [
    { icon: Truck, label: 'Entrega em toda Angola', sub: 'Rápida e segura' },
    { icon: Shield, label: 'Compra Protegida', sub: 'Pagamento seguro' },
    { icon: RefreshCcw, label: 'Troca Fácil', sub: 'Até 7 dias' },
    { icon: Headphones, label: 'Suporte 24h', sub: 'Sempre disponível' },
  ];

  return (
    <section className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {items.map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-sm"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-black text-blue-900 leading-tight truncate">{label}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Category Circles ─────────────────────────────────────────────────────────
const CategoryCircles = ({
  categories,
  loading,
}: {
  categories: HomeCategory[];
  loading: boolean;
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: dir === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (!ref) return;
    checkScroll();
    ref.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      ref.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, checkScroll]);

  return (
    <section className="px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-500 rounded-full" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-blue-900">
              Categorias
            </h2>
          </div>
          <div className="hidden sm:flex gap-1">
            {showLeft && (
              <button
                onClick={() => scroll('left')}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {showRight && (
              <button
                onClick={() => scroll('right')}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors"
                aria-label="Próximo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
        >
          {loading
            ? [...Array(8)].map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="flex flex-col items-center gap-1.5 min-w-[72px] sm:min-w-[88px] md:min-w-[100px] group"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-orange-400 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 bg-gray-50">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-900/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-900/30" />
                          </div>
                        )}
                      </div>
                      {!cat.is_global && cat.company_name && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Store className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 text-center line-clamp-2 max-w-[72px] sm:max-w-[88px] group-hover:text-orange-500 transition-colors leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[8px] text-gray-400">
                      {cat.products_count} {cat.products_count === 1 ? 'produto' : 'produtos'}
                    </span>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }: { product: HomeProduct }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [added, setAdded] = useState(false);
  const isWishlisted = wishlist.includes(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-xl p-2 sm:p-2.5 hover:shadow-lg hover:border-orange-100 transition-all relative overflow-hidden h-full flex flex-col">
      {/* Added feedback */}
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-0 z-20 bg-orange-500 text-white text-center py-1 text-[9px] font-black"
          >
            ✓ Adicionado
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges */}
      {discount && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">
          -{discount}%
        </span>
      )}
      {product.company_name && (
        <div className="absolute top-2 right-2 bg-blue-900/80 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-0.5 backdrop-blur-sm">
          <Store className="w-2 h-2" />
          <span className="truncate max-w-[50px] hidden xs:block">{product.company_name}</span>
        </div>
      )}

      {/* Quick actions */}
      <div className="absolute top-9 right-2 flex flex-col gap-1 translate-x-8 group-hover:translate-x-0 transition-transform duration-300 z-10">
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          aria-label={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <Link
          to={`/product/${createProductSlug(product.name, product.id)}`}
          className="w-7 h-7 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-md hover:text-orange-500 transition-colors"
          aria-label="Ver produto"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Image */}
      <Link
        to={`/product/${createProductSlug(product.name, product.id)}`}
        className="block aspect-[3/4] overflow-hidden rounded-lg mb-2 bg-gray-50 flex-shrink-0"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col px-0.5">
        <Link to={`/product/${createProductSlug(product.name, product.id)}`}>
          <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-800 line-clamp-2 uppercase tracking-tight hover:text-orange-500 transition-colors mb-1 leading-tight min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        <div className="flex gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                i < (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
              }`}
            />
          ))}
        </div>

        <p className={`text-[8px] font-bold mb-1.5 ${product.stock > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {product.stock > 0 ? '● Em stock' : '● Fora de stock'}
        </p>

        <div className="flex items-center justify-between gap-1 mt-auto">
          <div>
            {product.oldPrice && (
              <span className="text-[8px] text-gray-400 line-through block">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
            <span className="text-[11px] sm:text-sm font-black text-blue-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all shadow-sm"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Embla Carousel hook ──────────────────────────────────────────────────────
const useProductCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  return { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo };
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  badge,
  link,
  linkText = 'Ver todos',
  onPrev,
  onNext,
  disableNav,
}: {
  title: string;
  badge?: React.ReactNode;
  link?: string;
  linkText?: string;
  onPrev?: () => void;
  onNext?: () => void;
  disableNav?: boolean;
}) => (
  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-5 bg-orange-500 rounded-full" />
      <h2 className="text-sm sm:text-base md:text-lg font-black text-blue-900">{title}</h2>
      {badge}
    </div>
    <div className="flex items-center gap-2">
      {link && (
        <Link
          to={link}
          className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 hover:text-orange-500 flex items-center gap-0.5 transition-colors"
        >
          {linkText}
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
      {onPrev && onNext && (
        <div className="hidden sm:flex gap-1">
          <button
            onClick={onPrev}
            disabled={disableNav}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-40"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNext}
            disabled={disableNav}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-900 hover:text-orange-500 transition-colors disabled:opacity-40"
            aria-label="Próximo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  </div>
);

// ─── Dots indicator ───────────────────────────────────────────────────────────
const CarouselDots = ({
  snaps,
  selected,
  onSelect,
}: {
  snaps: number[];
  selected: number;
  onSelect: (i: number) => void;
}) => {
  if (snaps.length <= 1) return null;
  return (
    <div className="flex justify-center gap-1.5 mt-3">
      {snaps.map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-1.5 rounded-full transition-all ${
            i === selected ? 'bg-blue-900 w-4' : 'bg-gray-300 w-1.5 hover:bg-gray-400'
          }`}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
};

// ─── Product Carousel skeleton ────────────────────────────────────────────────
const CarouselSkeleton = ({ title }: { title: string }) => (
  <div className="mb-8 sm:mb-10">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-gray-200 rounded-full" />
      <Skeleton className="h-5 w-36" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {[...Array(5)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ─── Category Carousel ────────────────────────────────────────────────────────
const CategoryCarousel = ({ category }: { category: CategoryWithProducts }) => {
  const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } =
    useProductCarousel();

  if (category.products.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-10">
      <SectionHeader
        title={category.name}
        link={`/category/${category.slug}`}
        onPrev={scrollPrev}
        onNext={scrollNext}
        disableNav={category.products.length <= 5}
        badge={
          category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-6 h-6 rounded-full object-cover border border-orange-200"
            />
          ) : undefined
        }
      />
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 sm:gap-3">
          {category.products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_48%] xs:flex-[0_0_44%] sm:flex-[0_0_30%] md:flex-[0_0_23%] lg:flex-[0_0_19%] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <CarouselDots snaps={scrollSnaps} selected={selectedIndex} onSelect={scrollTo} />
    </div>
  );
};

// ─── Promo Banners (3-col) ────────────────────────────────────────────────────
const PromoBanners = ({ banners }: { banners: Banner[] }) => {
  const items = banners.length > 0
    ? banners
    : [
        { id: 1, title: 'ELECTRÓNICOS', subtitle: 'Nova Colecção', description: 'Os melhores equipamentos electrónicos', image_url: 'https://picsum.photos/seed/promo1/800/400', link: '/', position: 2, discount_text: '', button_text: '' },
        { id: 2, title: 'MODA & ESTILO', subtitle: 'Tendências 2025', description: 'Vista-se com o melhor', image_url: 'https://picsum.photos/seed/promo2/800/400', link: '/', position: 2, discount_text: '', button_text: '' },
        { id: 3, title: 'CASA & DECORAÇÃO', subtitle: 'Para o seu lar', description: 'Produtos de qualidade para casa', image_url: 'https://picsum.photos/seed/promo3/800/400', link: '/', position: 2, discount_text: '', button_text: '' },
      ];

  return (
    <section className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 3).map((banner) => (
          <Link
            key={banner.id}
            to={banner.link || '#'}
            className="rounded-xl overflow-hidden relative h-32 sm:h-36 md:h-44 group"
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent p-4 sm:p-5 flex flex-col justify-end">
              <h3 className="text-sm sm:text-base md:text-lg font-black text-white uppercase leading-tight">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-[10px] sm:text-xs font-bold text-orange-300 mt-0.5">{banner.subtitle}</p>
              )}
              {banner.description && (
                <p className="text-[9px] sm:text-[10px] text-white/70 mt-0.5">{banner.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── Featured Products ────────────────────────────────────────────────────────
const FeaturedCarousel = ({
  products,
  loading,
}: {
  products: HomeProduct[];
  loading: boolean;
}) => {
  const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } =
    useProductCarousel();

  if (loading) return <CarouselSkeleton title="Produtos em Destaque" />;
  if (products.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-10">
      <SectionHeader
        title="Produtos em Destaque"
        badge={
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 text-[9px] font-black px-2 py-0.5 rounded-full">
            <TrendingUp className="w-2.5 h-2.5" />
            TOP
          </span>
        }
        link="/products?featured=true"
        onPrev={scrollPrev}
        onNext={scrollNext}
        disableNav={products.length <= 5}
      />
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 sm:gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_48%] xs:flex-[0_0_44%] sm:flex-[0_0_30%] md:flex-[0_0_23%] lg:flex-[0_0_19%] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <CarouselDots snaps={scrollSnaps} selected={selectedIndex} onSelect={scrollTo} />
    </div>
  );
};

// ─── Sidebar Banners ──────────────────────────────────────────────────────────
const SidebarBanners = ({ banners }: { banners: Banner[] }) => {
  if (banners.length === 0) return null;
  return (
    <section className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            to={banner.link || '#'}
            className="rounded-xl overflow-hidden relative h-32 sm:h-36 md:h-44 group"
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent p-4 sm:p-5 flex flex-col justify-center">
              {banner.discount_text && (
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-300 mb-1">
                  {banner.discount_text}
                </span>
              )}
              <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-[10px] text-white/80 mt-0.5">{banner.subtitle}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── Secondary Promo Cards ────────────────────────────────────────────────────
const SecondaryBanners = ({ promotions }: { promotions: Promotion[] }) => {
  const items = promotions.length > 0
    ? promotions
    : [
        { id: 1, title: 'TELEMÓVEIS', description: 'As melhores marcas disponíveis', discount: 'NOVO', image_url: 'https://picsum.photos/seed/phone/150/150', link: '/', background_color: 'bg-blue-50', border_color: 'border-blue-100', discount_badge_color: 'bg-orange-500' },
        { id: 2, title: 'SMARTWATCH', description: 'Tecnologia sempre consigo', discount: 'DESTAQUE', image_url: 'https://picsum.photos/seed/watch/150/150', link: '/', background_color: 'bg-orange-50', border_color: 'border-orange-100', discount_badge_color: 'bg-blue-900' },
        { id: 3, title: 'CÂMARAS', description: 'Capture cada momento especial', discount: 'POPULAR', image_url: 'https://picsum.photos/seed/camera/150/150', link: '/', background_color: 'bg-blue-50', border_color: 'border-blue-100', discount_badge_color: 'bg-orange-500' },
      ];

  return (
    <section className="px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.slice(0, 3).map((promo) => (
          <Link
            key={promo.id}
            to={promo.link || '#'}
            className={`${promo.background_color} border ${promo.border_color} rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 group hover:shadow-md transition-all`}
          >
            <div className="flex-1 min-w-0">
              <span className={`${promo.discount_badge_color} text-white text-[8px] font-black px-2 py-0.5 rounded-full mb-2 inline-block`}>
                {promo.discount}
              </span>
              <h3 className="text-sm sm:text-base font-black text-blue-900 uppercase leading-tight">
                {promo.title}
              </h3>
              {promo.description && (
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
              )}
            </div>
            <img
              src={promo.image_url}
              alt={promo.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition-transform flex-shrink-0"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

// ─── Sell CTA ─────────────────────────────────────────────────────────────────
const SellCTA = () => (
  <section className="px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
    <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl overflow-hidden shadow-xl relative">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 gap-5">
        <div className="text-white text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Store className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Para Vendedores</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black leading-tight mb-1.5">
            Venda no HSE Marketplace Angola!
          </h3>
          <p className="text-blue-200/80 text-xs sm:text-sm">
            Registe a sua empresa e comece a vender para todo o país.
          </p>
        </div>
        <Link
          to="/company/register"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap hover:scale-105"
        >
          <Store className="w-4 h-4" />
          Quero vender
        </Link>
      </div>
    </div>
  </section>
);

// ─── Newsletter ───────────────────────────────────────────────────────────────
const Newsletter = ({ config }: { config: SiteConfig }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setToast({ message: 'Introduza um e-mail válido', type: 'error' });
      return;
    }
    setLoading(true);
    const result = await homeService.subscribeNewsletter(email);
    setLoading(false);
    setToast({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) setEmail('');
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <section className="bg-blue-900 py-10 sm:py-14 md:py-16 px-4 lg:px-8 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-96 sm:h-96 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            <Mail className="w-3 h-3" />
            Newsletter
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Fique sempre actualizado
          </h2>
          <p className="text-white/60 text-sm mb-7">
            Subscreva a newsletter do HSE Marketplace e receba novidades, lançamentos e informações sobre os nossos produtos e parceiros.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col xs:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="O seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Inscrever'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>([]);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [sidebarBanners, setSidebarBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({} as SiteConfig);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await homeService.getHomeData();
      setCategories(
        data.categories_with_products.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image_url: c.image_url,
          products_count: c.products.length,
          is_global: true,
          company_name: undefined,
        }))
      );
      setCategoriesWithProducts(data.categories_with_products);
      setFeaturedProducts(data.featured_products);
      setHeroBanners(data.hero_banners);
      setPromoBanners(data.promo_banners);
      setSidebarBanners(data.sidebar_banners);
      setPromotions(data.promotions);
      setSiteConfig(data.site_config);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="overflow-x-hidden bg-gray-50/50 min-h-screen">
      <Hero banners={heroBanners} />
      <TrustBar />
      <CategoryCircles categories={categories} loading={loading} />
      <SidebarBanners banners={sidebarBanners} />

      {/* Categorias com produtos */}
      <section className="px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <CarouselSkeleton key={i} title="" />
              ))}
            </div>
          ) : (
            categoriesWithProducts.map((category) => (
              <CategoryCarousel key={category.id} category={category} />
            ))
          )}
        </div>
      </section>

      <PromoBanners banners={promoBanners} />

      <section className="px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <FeaturedCarousel products={featuredProducts} loading={loading} />
        </div>
      </section>

      <SecondaryBanners promotions={promotions} />
      <SellCTA />
      <Newsletter config={siteConfig} />
    </main>
  );
}