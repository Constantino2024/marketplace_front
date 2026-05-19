import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../services/auth';
import {
  LogOut, Search, User, UserIcon, ShoppingCart,
  ChevronDown, Menu, Settings, Store, Loader2,
  MapPin, Bell, Heart, Tag, Flame, ChevronRight, X,
  Home, LayoutGrid, Box, CreditCard, HelpCircle, Gift, Truck, Shield, Award, FileText, Star
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchService } from '../services/search';
import { homeService, HomeCategory } from '../services/home';

const Header: React.FC = () => {
  const { cartCount, cartTotal } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Detectar categoria activa baseada na URL
  useEffect(() => {
    const match = location.pathname.match(/^\/category\/([^/]+)/);
    if (match) {
      setActiveCategorySlug(match[1]);
    } else {
      setActiveCategorySlug(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Buscar categorias do back-end
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await homeService.getFeaturedCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchService.getSuggestions(debouncedSearch);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch {
          // silencioso
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleMobileSearchClose = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Função para verificar se uma categoria está activa
  const isCategoryActive = (categorySlug: string) => {
    return activeCategorySlug === categorySlug;
  };

  // Função para verificar se está na home
  const isHomeActive = () => {
    return location.pathname === '/' || location.pathname === '';
  };

  return (
    <header
      className={`bg-white w-full transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* ── Barra Superior (Desktop) ── */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/80">
            <MapPin className="w-3 h-3" />
            <span>Entrega em <strong className="text-white">Luanda</strong></span>
            <span className="text-white/30 mx-2">|</span>
            <Link to="/help" className="hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Ajuda
            </Link>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <Link to="/company/register" className="hover:text-white transition-colors flex items-center gap-1">
              <Store className="w-3 h-3" />
              Vender no HSE
            </Link>
            <span className="text-white/30">|</span>
            <Link to="/offers" className="hover:text-white transition-colors flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Ofertas
            </Link>
            <span className="text-white/30">|</span>
            {authenticated ? (
              <span className="text-white">Olá, <strong>{user?.username}</strong></span>
            ) : (
              <Link to="/login" className="hover:text-white transition-colors">
                Entrar / Cadastrar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Barra Principal ── */}
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Layout Desktop e Tablet */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5">
            {/* Menu Mobile Button (Tablet) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://caluloglobal.ao/img/Market_Place1.webp"
                alt="HSE Marketplace"
                className="h-28 w-auto object-contain"
              />
            </Link>

            {/* Barra de Busca Desktop */}
            <div className="flex-1 min-w-0 relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    placeholder="Pesquisar produtos, marcas e categorias…"
                    className="w-full h-11 bg-gray-50 border-2 border-gray-200 rounded-l-xl px-4 pr-10 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 bg-primary hover:bg-primary/90 text-white rounded-r-xl transition-colors flex items-center gap-2 font-medium text-sm flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </form>

              {/* Sugestões Desktop */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="p-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1.5 tracking-wider">
                          Sugestões
                        </p>
                        {suggestions.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(term)}
                            className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center gap-3 transition-colors group"
                          >
                            <Search className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary flex-shrink-0" />
                            <span className="truncate">{term}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Acções lado direito Desktop/Tablet */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {/* Favoritos */}
              <Link
                to="/favorites"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Heart className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="text-[10px] text-gray-500 group-hover:text-primary transition-colors">Favoritos</span>
              </Link>

              {/* Notificações */}
              {authenticated && (
                <button className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-gray-500 group-hover:text-primary transition-colors">Avisos</span>
                  <span className="absolute top-1 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
              )}

              {/* Utilizador */}
              <div className="relative">
                {authenticated ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] text-gray-500 group-hover:text-primary transition-colors flex items-center gap-0.5">
                        {user?.username?.split(' ')[0]}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>

                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {user?.is_admin ? 'Administrador' : user?.is_company ? 'Vendedor' : 'Cliente'}
                            </span>
                          </div>
                          <div className="p-1.5">
                            {user?.is_admin && (
                              <Link to="/admin" onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                <Settings className="w-4 h-4 text-gray-400" /> Dashboard Admin
                              </Link>
                            )}
                            {user?.is_company && (
                              <Link to="/store-admin" onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                <Store className="w-4 h-4 text-gray-400" /> Minha Loja
                              </Link>
                            )}
                            {user?.is_customer && (
                              <>
                                <Link to="/profile" onClick={() => setShowUserMenu(false)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                  <UserIcon className="w-4 h-4 text-gray-400" /> Meu Perfil
                                </Link>
                                <Link to="/orders" onClick={() => setShowUserMenu(false)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                  <ShoppingCart className="w-4 h-4 text-gray-400" /> Meus Pedidos
                                </Link>
                                <Link to="/favorites" onClick={() => setShowUserMenu(false)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                  <Heart className="w-4 h-4 text-gray-400" /> Favoritos
                                </Link>
                              </>
                            )}
                            <div className="my-1 border-t border-gray-100" />
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                if (window.confirm('Tem a certeza que deseja sair?')) logout();
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full"
                            >
                              <LogOut className="w-4 h-4" /> Sair
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link to="/login"
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
                    <User className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-primary transition-colors">Entrar</span>
                  </Link>
                )}
              </div>

              {/* Carrinho */}
              <Link to="/cart"
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-primary">
                  Kz {cartTotal.toLocaleString()}
                </span>
              </Link>
            </div>

            {/* Acções Tablet (md a lg) */}
            <div className="flex lg:hidden items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {authenticated ? (
                <button onClick={() => setShowUserMenu(true)}
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary" />
                </button>
              ) : (
                <Link to="/login" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </Link>
              )}
            </div>
          </div>

          {/* Layout Mobile */}
          <div className="flex md:hidden items-center justify-between gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>

            <Link to="/" className="flex-shrink-0">
              <img
                src="https://caluloglobal.ao/img/Market_Place1.webp"
                alt="HSE Marketplace"
                className="h-22 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {authenticated ? (
                <button onClick={() => setShowUserMenu(true)}
                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary" />
                </button>
              ) : (
                <Link to="/login" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra de Categorias (Desktop/Tablet) ── */}
      <div className="hidden md:block border-t border-gray-100 bg-white overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <nav className="flex items-center gap-0.5 whitespace-nowrap">
            {isLoadingCategories ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="px-3.5 py-2.5">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              <>
                {/* Link Início - activo quando na home */}
                <Link
                  to="/"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                    isHomeActive()
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-gray-600 border-transparent hover:text-primary hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Início
                </Link>

                {/* Links das Categorias - activo quando na página da categoria */}
                {categories.slice(0, 7).map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                      isCategoryActive(category.slug)
                        ? 'text-primary border-primary bg-primary/5'
                        : 'text-gray-600 border-transparent hover:text-primary hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {category.name}
                    {category.products_count > 0 && (
                      <span className={`text-[10px] ${
                        isCategoryActive(category.slug) ? 'text-primary' : 'text-gray-400'
                      }`}>
                        ({category.products_count})
                      </span>
                    )}
                  </Link>
                ))}
              </>
            )}
            <Link
              to="/categories"
              className={`inline-flex items-center gap-1 px-3.5 py-2.5 text-xs font-medium transition-colors border-b-2 ml-auto flex-shrink-0 ${
                location.pathname === '/categories'
                  ? 'text-primary border-primary bg-primary/5'
                  : 'text-gray-400 border-transparent hover:text-primary hover:border-primary'
              }`}
            >
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Barra de Categorias Mobile (Scroll horizontal) ── */}
      <div className="md:hidden border-t border-gray-100 bg-white overflow-x-auto scrollbar-none">
        <div className="px-4">
          <nav className="flex items-center gap-1 whitespace-nowrap py-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                isHomeActive()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Home className="w-3 h-3" />
              Início
            </Link>
            
            {!isLoadingCategories && categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isCategoryActive(category.slug)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
            
            <Link
              to="/categories"
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                location.pathname === '/categories'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ver mais
              <ChevronRight className="w-3 h-3" />
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile Search Overlay ── */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={handleMobileSearchClose} />
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 bg-white z-50 shadow-lg"
            >
              <div className="p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={mobileSearchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="O que está à procura?"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 pr-10 text-base focus:outline-none focus:border-primary transition-colors"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                  </div>
                  <button
                    type="submit"
                    className="h-12 px-5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMobileSearchClose}
                    className="h-12 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </form>

                {/* Sugestões Mobile */}
                {suggestions.length > 0 && (
                  <div className="mt-3 max-h-96 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase px-2 py-2 tracking-wider">
                      Sugestões
                    </p>
                    {suggestions.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(term)}
                        className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-primary/5 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Drawer Mobile (Menu Lateral) - Actualizado com categoria activa ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              {/* Cabeçalho do Drawer */}
              <div className="p-4 bg-primary text-white">
                <div className="flex items-center justify-between mb-3">
                  
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {authenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{user?.username}</p>
                      <p className="text-xs text-white/80 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-white/20 text-white rounded-full">
                        {user?.is_admin ? 'Admin' : user?.is_company ? 'Vendedor' : 'Cliente'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2 tracking-wider">
                  Navegação
                </p>
                
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-colors group ${
                    isHomeActive()
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Home className={`w-5 h-5 ${
                    isHomeActive() ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                  } transition-colors`} />
                  Início
                  {isHomeActive() && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </Link>
                
                <Link 
                  to="/categories" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-colors group ${
                    location.pathname === '/categories'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className={`w-5 h-5 ${
                    location.pathname === '/categories' ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                  } transition-colors`} />
                  Todas Categorias
                  {location.pathname === '/categories' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </Link>
                
                <Link 
                  to="/offers" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <Gift className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Ofertas
                  <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                    HOT
                  </span>
                </Link>
                
                <Link 
                  to="/cart" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Carrinho
                  {cartCount > 0 && (
                    <span className="ml-auto bg-accent text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                      {cartCount} itens
                    </span>
                  )}
                </Link>
                
                <Link 
                  to="/favorites" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <Heart className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Favoritos
                </Link>

                {/* Categorias do Back-end */}
                {!isLoadingCategories && categories.length > 0 && (
                  <>
                    <div className="pt-2">
                      <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2 tracking-wider">
                        Categorias Populares
                      </p>
                    </div>
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-colors group ${
                          isCategoryActive(category.slug)
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Box className={`w-5 h-5 ${
                          isCategoryActive(category.slug) ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                        } transition-colors`} />
                        {category.name}
                        {category.products_count > 0 && (
                          <span className={`text-[10px] ${
                            isCategoryActive(category.slug) ? 'text-primary' : 'text-gray-400'
                          }`}>
                            ({category.products_count})
                          </span>
                        )}
                        {isCategoryActive(category.slug) && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    ))}
                  </>
                )}

                <div className="pt-3">
                  <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2 tracking-wider">
                    Informações
                  </p>
                </div>

                <Link 
                  to="/help" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Central de Ajuda
                </Link>

                <Link 
                  to="/shipping" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <Truck className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Entregas
                </Link>

                <Link 
                  to="/returns" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <Shield className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Trocas e Devoluções
                </Link>

                {!authenticated && (
                  <>
                    <div className="pt-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2 tracking-wider">
                        Vender
                      </p>
                    </div>
                    <Link 
                      to="/company/register" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <Store className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                      Vender no HSE
                    </Link>
                  </>
                )}

                {authenticated && (
                  <>
                    <div className="pt-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2 tracking-wider">
                        Minha Conta
                      </p>
                    </div>
                    
                    {user?.is_admin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        <Settings className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        Dashboard Admin
                      </Link>
                    )}
                    
                    {user?.is_company && (
                      <Link 
                        to="/store-admin" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                        <Store className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        Minha Loja
                      </Link>
                    )}
                    
                    {user?.is_customer && (
                      <>
                        <Link 
                          to="/profile" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                        >
                          <UserIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                          Meu Perfil
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                        >
                          <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                          Meus Pedidos
                        </Link>
                      </>
                    )}
                    
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (window.confirm('Tem a certeza que deseja sair?')) logout();
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors group"
                      >
                        <LogOut className="w-5 h-5" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </nav>

              {/* Rodapé do Drawer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>© {new Date().getFullYear()} HSE Marketplace</span>
                  <div className="flex gap-3">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <Award className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet Mobile (User Menu) ── */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowUserMenu(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
              <div className="p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                  <div>
                    <p className="font-bold text-gray-800">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={() => setShowUserMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {user?.is_admin && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                      <Settings className="w-5 h-5 text-gray-400" /> Dashboard Admin
                    </Link>
                  )}
                  {user?.is_company && (
                    <Link to="/store-admin" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                      <Store className="w-5 h-5 text-gray-400" /> Minha Loja
                    </Link>
                  )}
                  {user?.is_customer && (
                    <>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                        <UserIcon className="w-5 h-5 text-gray-400" /> Meu Perfil
                      </Link>
                      <Link to="/orders" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">
                        <ShoppingCart className="w-5 h-5 text-gray-400" /> Meus Pedidos
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (window.confirm('Tem a certeza que deseja sair?')) logout();
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full border-t border-gray-100 mt-2 pt-3"
                  >
                    <LogOut className="w-5 h-5" /> Sair
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;