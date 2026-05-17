import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Store,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LogoutButton from '../LogoutButton';
import { getCurrentUser } from '../../services/auth';
import { companyService, CompanyProfile } from '../../services/company';

const storeMenuItems = [
  { icon: LayoutDashboard, label: 'Painel da Loja', path: '/store-admin' },
  { icon: Package, label: 'Meus Produtos', path: '/store-admin/products' },
  { icon: ListTree, label: 'Minhas Categorias', path: '/store-admin/categories' },
  { icon: ShoppingCart, label: 'Pedidos Recebidos', path: '/store-admin/orders' },
  { icon: BarChart3, label: 'Relatórios de Vendas', path: '/store-admin/reports' },
  { icon: Settings, label: 'Configurações da Loja', path: '/store-admin/settings' },
];

export default function StoreAdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications] = useState(3);
  const hasLoadedRef = useRef(false); // 👈 Controlar se já carregou

  const user = getCurrentUser();

  // Buscar perfil da empresa - com useCallback e dependências controladas
  const loadCompanyProfile = useCallback(async () => {
    // Evitar múltiplas chamadas
    if (hasLoadedRef.current) return;
    
    try {
      const profile = await companyService.getProfile();
      setCompanyProfile(profile);
      hasLoadedRef.current = true; // Marcar como carregado
    } catch (error) {
      console.error('Erro ao carregar perfil da empresa:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Sem dependências externas

  // useEffect com dependências controladas
  useEffect(() => {
    if (user?.is_company && !hasLoadedRef.current) {
      loadCompanyProfile();
    } else if (!user?.is_company) {
      setIsLoading(false);
    }
  }, [user?.is_company, loadCompanyProfile]); // Dependências controladas

  // Gerar iniciais para o avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="https://caluloglobal.ao/img/Market_Place1.webp" 
            alt="HSE Market Place" 
            className="h-8 w-auto object-contain"
          />
        </Link>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 hidden md:block">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://raw.githubusercontent.com/HSE-Market-Place/logo/main/logo.png" 
              alt="HSE Market Place" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-accent font-bold text-xl flex items-center gap-1">
              <Store className="w-6 h-6 fill-accent" />
              <span>Minha Loja</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {storeMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 hidden md:flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar pedidos, produtos..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notificações */}
            <button className="relative p-2 text-gray-400 hover:text-accent transition-colors">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {/* Informações da empresa */}
            {isLoading ? (
              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {companyProfile?.company_name || user?.company?.company_name || 'Minha Loja'}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">
                    {companyProfile?.status === 'active' ? 'Vendedor' : 'Pendente'}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black"
                  title={companyProfile?.company_name || 'Loja'}
                >
                  {companyProfile?.company_name 
                    ? getInitials(companyProfile.company_name)
                    : 'ML'}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}