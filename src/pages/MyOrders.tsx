import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Home,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Key,
  Heart,
  MapPin,
  CreditCard,
  Menu,
  X,
  Shield,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService, CustomerOrder } from '../services/customer';
import { getCurrentUser, logout } from '../services/auth';

const ITEMS_PER_PAGE = 10;

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await customerService.getOrders({
        page: currentPage,
        page_size: ITEMS_PER_PAGE
      });
      
      setOrders(response?.results || []);
      setTotalItems(response?.count || 0);
      setTotalPages(Math.ceil((response?.count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      // Simular chamada de API para alterar senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Senha alterada com sucesso!', 'success');
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setPasswordError('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string; bgColor: string }> = {
      'paid': { 
        color: 'text-emerald-600', 
        icon: CheckCircle2, 
        label: 'Pago',
        bgColor: 'bg-emerald-100'
      },
      'pending': { 
        color: 'text-orange-600', 
        icon: Clock, 
        label: 'Pendente',
        bgColor: 'bg-orange-100'
      },
      'cancelled': { 
        color: 'text-red-600', 
        icon: XCircle, 
        label: 'Cancelado',
        bgColor: 'bg-red-100'
      },
      'shipped': { 
        color: 'text-blue-600', 
        icon: Truck, 
        label: 'Enviado',
        bgColor: 'bg-blue-100'
      },
      'delivered': { 
        color: 'text-green-600', 
        icon: Truck, 
        label: 'Entregue',
        bgColor: 'bg-green-100'
      },
    };
    return configs[status] || configs['pending'];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '0,00';
    return value.toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Menu items para área do cliente
  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
    { id: 'orders', label: 'Meus Pedidos', icon: Package, path: '/orders' },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart, path: '/wishlist' },
    { id: 'addresses', label: 'Meus Endereços', icon: MapPin, path: '/addresses' },
    { id: 'change-password', label: 'Alterar Senha', icon: Key, action: () => setShowPasswordModal(true) },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const renderContent = () => {
    if (activeTab === 'orders') {
      return (
        <>
          {/* Orders List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <>
                <div className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const status = getStatusConfig(order.status);
                    const StatusIcon = status.icon;

                    return (
                      <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="font-bold text-gray-800 text-sm sm:text-base">{order.order_number}</span>
                              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase inline-flex items-center gap-1 ${status.bgColor} ${status.color}`}>
                                <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {status.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                              <span>Data: {formatDate(order.created_at)}</span>
                              <span>•</span>
                              <span>{order.items_count} {order.items_count === 1 ? 'item' : 'itens'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                            <div className="text-left md:text-right">
                              <p className="text-[10px] sm:text-xs text-gray-400">Total</p>
                              <p className="text-base sm:text-lg font-black text-[#F59E0B]">Kz {formatCurrency(order.total)}</p>
                            </div>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 sm:p-3 text-gray-400 hover:text-[#F59E0B] hover:bg-[#F59E0B]/5 rounded-xl transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold">
                      Mostrando <span className="text-gray-800">{startIndex + 1}</span> a <span className="text-gray-800">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> de <span className="text-gray-800">{totalItems}</span> pedidos
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      
                      <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 sm:p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Você ainda não realizou nenhuma compra.</p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#F59E0B] text-white rounded-lg sm:rounded-xl font-bold hover:bg-[#D97706] transition-all text-sm sm:text-base"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Começar a comprar
                </Link>
              </div>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-xl z-50 flex items-center gap-2 sm:gap-3 text-sm sm:text-base max-w-[90%] sm:max-w-md ${
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              } text-white`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
              <p className="font-bold flex-1 text-xs sm:text-sm">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-full transition-colors group shadow-sm"
            title="Voltar para página inicial"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A5F] group-hover:text-[#F59E0B] transition-colors" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E3A5F]">Meus Pedidos</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Acompanhe o status de todos os seus pedidos</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 bg-white rounded-lg shadow-sm text-[#1E3A5F] hover:text-[#F59E0B] transition-colors"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Layout com Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              {/* Perfil do Usuário */}
              <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{user?.username || 'Cliente'}</h3>
                    <p className="text-white/70 text-xs truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  if (item.path) {
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                          isActive
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  
                  if (item.action) {
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                          isActive
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  
                  return null;
                })}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Sidebar Mobile (Drawer) */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div 
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
                >
                  {/* Perfil */}
                  <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{user?.username || 'Cliente'}</h3>
                          <p className="text-white/70 text-xs truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Menu */}
                  <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      
                      if (item.path) {
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]"
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      }
                      
                      if (item.action) {
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.action();
                              setSidebarOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]"
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                      
                      return null;
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          handleLogout();
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">Detalhes do Pedido</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Número do Pedido</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{selectedOrder.order_number}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {React.createElement(getStatusConfig(selectedOrder.status).icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" })}
                      <span className="font-bold text-gray-800 text-sm sm:text-base">{getStatusConfig(selectedOrder.status).label}</span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Data do Pedido</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{formatDate(selectedOrder.created_at)}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Total</p>
                    <p className="text-lg sm:text-xl font-black text-[#F59E0B]">Kz {formatCurrency(selectedOrder.total)}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Itens</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{selectedOrder.items_count} produtos</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        navigate('/');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 py-2.5 sm:py-3 bg-[#F59E0B] text-white rounded-lg sm:rounded-xl font-bold hover:bg-[#D97706] transition-all text-sm"
                    >
                      Continuar Comprando
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Alterar Senha */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">Alterar Senha</h3>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError('');
                      setPasswordForm({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {passwordError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordError('');
                        setPasswordForm({
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        });
                      }}
                      className="flex-1 py-2.5 border-2 border-gray-200 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex-1 py-2.5 bg-[#F59E0B] text-white rounded-lg font-bold hover:bg-[#D97706] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        'Alterar Senha'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Botão flutuante para mobile */}
        <button
          onClick={() => navigate('/')}
          className="fixed bottom-6 right-6 lg:hidden bg-[#F59E0B] text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-[#D97706] transition-all z-40"
          title="Voltar para página inicial"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}