import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from './services/auth';
import { 
  LogOut,
  Search, 
  User, 
  UserIcon, 
  ShoppingCart, 
  ChevronDown, 
  Menu,
  Settings,
  Store,
  Facebook,
  Twitter,
  Instagram,
  Loader2
} from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Companies from './pages/admin/Companies';
import ProductsAdmin from './pages/admin/Products';
import CategoriesAdmin from './pages/admin/Categories';
import OrdersAdmin from './pages/admin/Orders';
import BannerAdmin from './pages/admin/Banners';
import StoreAdminLayout from './components/admin/StoreAdminLayout';
import StoreDashboard from './pages/admin/StoreDashboard';
import StoreCustomers from './pages/admin/StoreCustomers';
import StoreReports from './pages/admin/StoreReports';
import AdminCustomers from './pages/admin/Customers';
import { CartProvider, useCart } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import SearchResults from './pages/SearchResults';
import { useDebounce } from './hooks/useDebounce';
import { searchService } from './services/search';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// --- Shared Components ---

const Header = () => {
  const { cartCount, cartTotal } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para o Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms de espera
  const navigate = useNavigate();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  // Efeito para buscar sugestões
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchService.getSuggestions(debouncedSearch);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Erro ao buscar sugestões', error);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="bg-white border-b border-gray-100 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo (mantido igual) */}
        <Link to="/" className="flex items-center gap-2">
           <img src="https://caluloglobal.ao/img/Market_Place1.webp" alt="Logo" className="h-30 w-auto object-contain" />
        </Link>

        {/* Search Bar com Autocomplete */}
        <div className="flex-1 w-full max-w-2xl relative">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="O que você está procurando hoje?" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isSearching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                <button type="submit">
                  <Search className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </form>

          {/* Menu de Sugestões (Dropdown) */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <>
                {/* Backdrop invisível para fechar ao clicar fora */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSuggestions(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-2">Sugestões de busca</p>
                    {suggestions.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(term)}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg flex items-center gap-3 transition-colors group"
                      >
                        <Search className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6 relative">
          {/* User Menu */}
          <div className="relative">
            {authenticated ? (
              <>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs text-gray-400">Olá,</p>
                    <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2">
                    {/* Informações do usuário */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-[10px] font-bold uppercase mt-1 text-primary">
                        {user?.is_admin ? 'Administrador' : user?.is_company ? 'Vendedor' : 'Cliente'}
                      </p>
                    </div>

                    {/* Links baseados no tipo de usuário */}
                    {user?.is_admin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Dashboard Admin
                      </Link>
                    )}
                    
                    {user?.is_company && (
                      <Link
                        to="/store-admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Store className="w-4 h-4" />
                        Minha Loja
                      </Link>
                    )}
                    
                    {user?.is_customer && (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          Meu Perfil
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Meus Pedidos
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (window.confirm('Tem certeza que deseja sair?')) {
                          logout();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-bold text-gray-700 hidden md:block">Entrar</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Carrinho</span>
            <span className="font-bold text-sm text-primary">Kz {cartTotal.toLocaleString()}</span>
          </div>
          <Link to="/cart" className="relative cursor-pointer">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white pt-16 pb-8 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase mb-6">FRUTAS E VEGETAIS</h5>
          <ul className="flex flex-col gap-3 text-[11px] text-gray-500 font-medium">
            <li><a href="#" className="hover:text-primary">Vegetais frescos</a></li>
            <li><a href="#" className="hover:text-primary">Ervas e temperos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas frescas</a></li>
            <li><a href="#" className="hover:text-primary">Cortes e Brotos</a></li>
            <li><a href="#" className="hover:text-primary">Produtos embalados</a></li>
            <li><a href="#" className="hover:text-primary">Bandejas para Festas</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase mb-6">CAFÉ DA MANHÃ E LATICÍNIOS</h5>
          <ul className="flex flex-col gap-3 text-[11px] text-gray-500 font-medium">
            <li><a href="#" className="hover:text-primary">Vegetais frescos</a></li>
            <li><a href="#" className="hover:text-primary">Ervas e temperos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas frescas</a></li>
            <li><a href="#" className="hover:text-primary">Cortes e Brotos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas e Vegetais Exóticos</a></li>
            <li><a href="#" className="hover:text-primary">Produtos embalados</a></li>
            <li><a href="#" className="hover:text-primary">Bandejas para Festas</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase mb-6">CARNES E FRUTOS DO MAR</h5>
          <ul className="flex flex-col gap-3 text-[11px] text-gray-500 font-medium">
            <li><a href="#" className="hover:text-primary">Vegetais frescos</a></li>
            <li><a href="#" className="hover:text-primary">Ervas e temperos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas frescas</a></li>
            <li><a href="#" className="hover:text-primary">Cortes e Brotos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas e Vegetais Exóticos</a></li>
            <li><a href="#" className="hover:text-primary">Produtos embalados</a></li>
            <li><a href="#" className="hover:text-primary">Bandejas para Festas</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase mb-6">BEBIDAS</h5>
          <ul className="flex flex-col gap-3 text-[11px] text-gray-500 font-medium">
            <li><a href="#" className="hover:text-primary">Vegetais frescos</a></li>
            <li><a href="#" className="hover:text-primary">Ervas e temperos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas frescas</a></li>
            <li><a href="#" className="hover:text-primary">Cortes e Brotos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas e Vegetais Exóticos</a></li>
            <li><a href="#" className="hover:text-primary">Produtos embalados</a></li>
            <li><a href="#" className="hover:text-primary">Bandejas para Festas</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-800 uppercase mb-6">PÃES E PADARIA</h5>
          <ul className="flex flex-col gap-3 text-[11px] text-gray-500 font-medium">
            <li><a href="#" className="hover:text-primary">Vegetais frescos</a></li>
            <li><a href="#" className="hover:text-primary">Ervas e temperos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas frescas</a></li>
            <li><a href="#" className="hover:text-primary">Cortes e Brotos</a></li>
            <li><a href="#" className="hover:text-primary">Frutas e Vegetais Exóticos</a></li>
            <li><a href="#" className="hover:text-primary">Produtos embalados</a></li>
            <li><a href="#" className="hover:text-primary">Bandejas para Festas</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-gray-400">Hse Marketplace &copy; 2026. Todos os direitos reservados.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
          <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
        </div>
      </div>
    </div>
  </footer>
);

const PublicLayout = () => (
  <>
    <div className="sticky top-0 z-50 shadow-sm">
      <Header />
    </div>
    <Outlet />
    <Footer />
  </>
);

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white">
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
            
            {/* Admin Routes - Apenas Admin */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="companies" element={<Companies />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="banners" element={<BannerAdmin/>} />
              <Route path="admins" element={<div className="p-8">Gestão de Administradores (Em breve)</div>} />
              <Route path="settings" element={<div className="p-8">Configurações (Em breve)</div>} />
            </Route>

            {/* Store Admin Routes - Apenas Empresas */}
            <Route 
              path="/store-admin" 
              element={
                <ProtectedRoute requireCompany={true}>
                  <StoreAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StoreDashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="customers" element={<StoreCustomers />} />
              <Route path="reports" element={<StoreReports />} />
              <Route path="settings" element={<div className="p-8">Configurações da Loja (Em breve)</div>} />
            </Route>

            {/* Rotas para Clientes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requireCustomer={true}>
                  <MyOrders />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}