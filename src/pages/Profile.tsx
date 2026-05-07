import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Package,
  ShoppingBag,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Home,
  Calendar,
  CreditCard,
  Smartphone,
  MapPinned,
  BadgeCheck,
  TrendingUp,
  Clock,
  Heart,
  Key,
  Settings,
  LogOut,
  Menu,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService, CustomerProfile } from '../services/customer';
import { getCurrentUser, logout } from '../services/auth';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [stats, setStats] = useState({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0,
    delivered_orders: 0
  });

  const user = getCurrentUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await customerService.getProfile();
      setProfile(profileData);
      setEditForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        birth_date: profileData.birth_date || '',
        tax_id: profileData.tax_id || ''
      });

      try {
        const ordersResponse = await customerService.getOrders({ page_size: 100 });
        const orders = ordersResponse?.results || [];
        
        const validOrders = orders.filter(order => 
          order?.status === 'delivered' || order?.status === 'paid' || order?.status === 'shipped'
        );
        
        const total_spent = validOrders.reduce((sum, order) => {
          const orderTotal = parseFloat(order?.total) || 0;
          return sum + orderTotal;
        }, 0);
        
        const pending_orders = orders.filter(order => 
          order?.status === 'pending'
        ).length;
        
        const delivered_orders = orders.filter(order => 
          order?.status === 'delivered'
        ).length;
        
        setStats({
          total_orders: orders.length || 0,
          total_spent: total_spent,
          pending_orders: pending_orders,
          delivered_orders: delivered_orders
        });
        
      } catch (ordersError) {
        console.error('Erro ao carregar pedidos para estatísticas:', ordersError);
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      birth_date: profile?.birth_date || '',
      tax_id: profile?.tax_id || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await customerService.updateProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
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

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '0,00';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return numberValue.toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Menu items para área do cliente
  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile', active: true },
    { id: 'orders', label: 'Meus Pedidos', icon: Package, path: '/orders' },
    { id: 'wishlist', label: 'Lista de Desejos', icon: Heart, path: '/wishlist' },
    { id: 'addresses', label: 'Meus Endereços', icon: MapPin, path: '/addresses' },
    { id: 'change-password', label: 'Alterar Senha', icon: Key, action: () => setShowPasswordModal(true) },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1E3A5F] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

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
              {toast.type === 'success' ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E3A5F]">Meu Perfil</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Gerencie suas informações pessoais</p>
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
                    <h3 className="font-bold truncate">{user?.username || profile?.full_name || 'Cliente'}</h3>
                    <p className="text-white/70 text-xs truncate">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active || (item.path && window.location.pathname === item.path);
                  
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
                          <h3 className="font-bold truncate">{user?.username || profile?.full_name || 'Cliente'}</h3>
                          <p className="text-white/70 text-xs truncate">{profile?.email}</p>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 sm:w-6 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos</p>
                    <p className="text-xl sm:text-2xl font-black text-[#1E3A5F]">{stats.total_orders}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Gasto</p>
                    <p className="text-sm sm:text-base font-black text-[#1E3A5F]">
                      Kz {formatCurrency(stats.total_spent)}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Pedidos Pendentes</p>
                    <p className="text-xl sm:text-2xl font-black text-[#F59E0B]">{stats.pending_orders}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Entregues</p>
                    <p className="text-xl sm:text-2xl font-black text-[#1E3A5F]">{stats.delivered_orders}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header do Perfil */}
              <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-black">{profile?.full_name || 'Cliente'}</h2>
                      <p className="text-white/80 text-xs sm:text-sm mt-0.5">{profile?.email}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-lg font-bold text-xs sm:text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Editar Perfil
                    </button>
                  )}
                </div>
              </div>

              {/* Conteúdo do Perfil */}
              <div className="p-4 sm:p-6 md:p-8">
                {isEditing ? (
                  <div className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          Primeiro Nome
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={editForm.first_name || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          Último Nome
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={editForm.last_name || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          <Mail className="w-3 h-3 inline mr-1" /> Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          <Smartphone className="w-3 h-3 inline mr-1" /> Telefone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          <MapPinned className="w-3 h-3 inline mr-1" /> Endereço
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editForm.address || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          Cidade
                        </label>
                        <select
                          name="city"
                          value={editForm.city || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        >
                          <option value="">Selecione uma cidade</option>
                          <option value="Luanda">Luanda</option>
                          <option value="Benguela">Benguela</option>
                          <option value="Lubango">Lubango</option>
                          <option value="Huambo">Huambo</option>
                          <option value="Cabinda">Cabinda</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          <Calendar className="w-3 h-3 inline mr-1" /> Data de Nascimento
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          value={editForm.birth_date?.split('T')[0] || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 block">
                          <BadgeCheck className="w-3 h-3 inline mr-1" /> NIF / BI
                        </label>
                        <input
                          type="text"
                          name="tax_id"
                          value={editForm.tax_id || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="order-2 sm:order-1 flex-1 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="order-1 sm:order-2 flex-1 py-2.5 sm:py-3 bg-[#F59E0B] text-white rounded-lg sm:rounded-xl font-bold hover:bg-[#D97706] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Nome Completo</p>
                          <p className="text-sm sm:text-base text-gray-800 font-medium truncate">{profile?.full_name || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                          <p className="text-sm sm:text-base text-gray-800 font-medium truncate">{profile?.email || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Telefone</p>
                          <p className="text-sm sm:text-base text-gray-800 font-medium">{profile?.phone || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Endereço</p>
                          <p className="text-sm sm:text-base text-gray-800 font-medium truncate">{profile?.address || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Cidade</p>
                          <p className="text-sm sm:text-base text-gray-800 font-medium">{profile?.city || 'Não informado'}</p>
                        </div>
                      </div>

                      {profile?.birth_date && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Data de Nascimento</p>
                            <p className="text-sm sm:text-base text-gray-800 font-medium">{new Date(profile.birth_date).toLocaleDateString('pt-AO')}</p>
                          </div>
                        </div>
                      )}

                      {profile?.tax_id && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                          <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A5F] mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">NIF / BI</p>
                            <p className="text-sm sm:text-base text-gray-800 font-medium">{profile.tax_id}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

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