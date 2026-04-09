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
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService, CustomerProfile } from '../services/customer';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Buscar perfil
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

      // Buscar pedidos para estatísticas
      try {
        const ordersResponse = await customerService.getOrders({ page_size: 100 });
        
        // Garantir que ordersResponse.results existe e é um array
        const orders = ordersResponse?.results || [];
        
        // Calcular estatísticas com segurança
        const total_spent = orders.reduce((sum, order) => {
          return sum + (order?.total || 0);
        }, 0);
        
        const pending_orders = orders.filter(order => 
          order?.status === 'pending'
        ).length;
        
        setStats({
          total_orders: ordersResponse?.count || orders.length || 0,
          total_spent,
          pending_orders
        });
      } catch (ordersError) {
        console.error('Erro ao carregar pedidos para estatísticas:', ordersError);
        // Manter stats como 0
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            } text-white`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          title="Voltar para página inicial"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-800">Meu Perfil</h1>
          <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Página Inicial</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total de Pedidos</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.total_orders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Gasto</p>
            <h3 className="text-2xl font-black text-gray-800">Kz {stats.total_spent.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Pedidos Pendentes</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.pending_orders}</h3>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black">{profile?.full_name || 'Cliente'}</h2>
              <p className="text-white/80 text-sm">{profile?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-white/20 rounded-lg font-bold text-sm hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Perfil
            </button>
          )}
        </div>

        <div className="p-8">
          {isEditing ? (
            // Modo de edição
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Primeiro Nome
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Último Nome
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu endereço"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Cidade
                  </label>
                  <select
                    name="city"
                    value={editForm.city || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione uma cidade</option>
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Lubango">Lubango</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Cabinda">Cabinda</option>
                  </select>
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={editForm.birth_date?.split('T')[0] || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* NIF/Bilhete de Identidade */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    NIF / BI
                  </label>
                  <input
                    type="text"
                    name="tax_id"
                    value={editForm.tax_id || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="000000000"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            // Modo de visualização
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Nome Completo</p>
                    <p className="text-gray-800 font-medium">{profile?.full_name || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                    <p className="text-gray-800 font-medium">{profile?.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Telefone</p>
                    <p className="text-gray-800 font-medium">{profile?.phone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Endereço</p>
                    <p className="text-gray-800 font-medium">{profile?.address || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Cidade</p>
                    <p className="text-gray-800 font-medium">{profile?.city || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  Ver meus pedidos
                  <Package className="w-4 h-4" />
                </Link>
                
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Voltar ao início</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão flutuante para mobile */}
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-6 right-6 md:hidden bg-primary text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all z-50"
        title="Voltar para página inicial"
      >
        <Home className="w-6 h-6" />
      </button>
    </div>
  );
}