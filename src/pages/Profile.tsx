import React, { useState, useEffect } from 'react';
import {
  User, Mail, Smartphone, MapPin, Building, Calendar, BadgeCheck,
  Edit, Save, X, Loader2, TrendingUp, ShoppingBag, Clock, Package,
  Heart, Key, Settings, MapPinned, ChevronRight, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerLayout } from '../components/CustomerLayout';
import { customerService, CustomerProfile } from '../services/customer';
import { formatCurrency } from '../utils/currency';

const menuItems = [
  { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
  { id: 'orders', label: 'Meus Pedidos', icon: Package, path: '/orders' },
  { id: 'favorites', label: 'Meus Favoritos', icon: Heart, path: '/favorites' },
  { id: 'addresses', label: 'Meus Endereços', icon: MapPin, path: '/addresses' },
  { id: 'change-password', label: 'Alterar Senha', icon: Key, action: 'password' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
];

const angolaCities = ['Luanda', 'Benguela', 'Lubango', 'Huambo', 'Cabinda', 'Malanje', 'Namibe', 'Soyo', 'Uíge', 'Saurimo'];

type StatItem = {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  accent: string;
  bg: string;
  subtext?: string;
};

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
      style={{ background: stat.bg }}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${stat.accent}`}>
        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-gray-800 leading-none">{stat.value}</p>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1.5">{stat.label}</p>
      </div>
      {/* decorative circle */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: stat.accent.includes('amber') ? '#F59E0B' : stat.accent.includes('emerald') ? '#10B981' : stat.accent.includes('blue') ? '#3B82F6' : '#1E3A5F' }} />
    </motion.div>
  );
}

type FieldDisplayProps = { icon: React.FC<{ className?: string }>; label: string; value: string | undefined | null };

function FieldDisplay({ icon: Icon, label, value }: FieldDisplayProps) {
  return (
    <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-4 h-4 text-[#1E3A5F]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-700 truncate">{value || <span className="text-gray-400 font-normal italic">Não informado</span>}</p>
      </div>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  icon?: React.FC<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
};

function InputField({ label, name, type = 'text', value, onChange, icon: Icon, className = '', children }: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}{label}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 font-medium
            focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 focus:border-[#F59E0B] transition-all"
        />
      )}
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState({ total_orders: 0, total_spent: 0, pending_orders: 0, delivered_orders: 0 });

  useEffect(() => { loadProfile(); }, []);

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
        tax_id: profileData.tax_id || '',
      });
      const ordersResponse = await customerService.getOrders({ page_size: 100 });
      const orders = ordersResponse?.results || [];
      const validOrders = orders.filter(o => ['delivered', 'paid', 'shipped'].includes(o?.status));
      setStats({
        total_orders: orders.length,
        total_spent: validOrders.reduce((s, o) => s + (parseFloat(o?.total) || 0), 0),
        pending_orders: orders.filter(o => o?.status === 'pending').length,
        delivered_orders: orders.filter(o => o?.status === 'delivered').length,
      });
    } catch {
      showToast('Erro ao carregar perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

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
    } catch {
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Senha alterada com sucesso!', 'success');
      return true;
    } catch { return false; }
  };

  const statsData: StatItem[] = [
    {
      label: 'Total de Pedidos',
      value: stats.total_orders,
      icon: ShoppingBag,
      accent: 'bg-[#1E3A5F] text-white',
      bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    },
    {
      label: 'Total Gasto',
      value: `Kz ${formatCurrency(stats.total_spent)}`,
      icon: TrendingUp,
      accent: 'bg-emerald-500 text-white',
      bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    },
    {
      label: 'Pendentes',
      value: stats.pending_orders,
      icon: Clock,
      accent: 'bg-amber-400 text-white',
      bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    },
    {
      label: 'Entregues',
      value: stats.delivered_orders,
      icon: Package,
      accent: 'bg-blue-500 text-white',
      bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'CL';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#F59E0B] animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Carregando seu perfil…</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerLayout
      title="Meu Perfil"
      subtitle="Gerencie suas informações pessoais"
      menuItems={menuItems}
      activeItem="profile"
      toast={toast}
      setToast={setToast}
      onChangePassword={handleChangePassword}
    >
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsData.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* ── Profile card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* ── Hero banner ── */}
        <div className="relative h-28 sm:h-36" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2A5298 50%, #1E3A5F 100%)' }}>
          {/* subtle grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {/* edit button top-right */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl
                bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-sm
                border border-white/20 transition-all duration-200 group"
            >
              <Edit className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              Editar
            </button>
          )}
        </div>

        {/* ── Avatar + Name ── */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 mb-6 sm:mb-8">
            {/* avatar */}
            <div className="relative flex-shrink-0 self-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F59E0B] to-[#D97706]
                flex items-center justify-center text-white font-black text-xl sm:text-2xl
                ring-4 ring-white shadow-lg">
                {initials}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#1E3A5F] text-white rounded-xl
                  flex items-center justify-center shadow-md hover:bg-[#2A5298] transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* name block */}
            <div className="pb-1">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{profile?.full_name || 'Cliente'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
              {profile?.city && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#1E3A5F] bg-blue-50 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3 h-3" />{profile.city}
                </span>
              )}
            </div>
          </div>

          {/* ── EDIT FORM ── */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Section title */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-5 rounded-full bg-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Informações Pessoais</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <InputField label="Primeiro Nome" name="first_name" value={editForm.first_name || ''} onChange={handleChange} />
                  <InputField label="Último Nome" name="last_name" value={editForm.last_name || ''} onChange={handleChange} />
                  <InputField label="Email" name="email" type="email" value={editForm.email || ''} onChange={handleChange} icon={Mail} />
                  <InputField label="Telefone" name="phone" type="tel" value={editForm.phone || ''} onChange={handleChange} icon={Smartphone} />
                  <InputField label="Endereço" name="address" value={editForm.address || ''} onChange={handleChange} icon={MapPinned} className="sm:col-span-2" />
                  <InputField label="Cidade" name="city" value={editForm.city || ''} onChange={handleChange}>
                    <select name="city" value={editForm.city || ''} onChange={handleChange}
                      className="h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 font-medium
                        focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40 focus:border-[#F59E0B] transition-all appearance-none cursor-pointer">
                      <option value="">Selecione uma cidade</option>
                      {angolaCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputField>
                  <InputField label="Data de Nascimento" name="birth_date" type="date" icon={Calendar}
                    value={editForm.birth_date?.split('T')[0] || ''} onChange={handleChange} />
                  <InputField label="NIF / BI" name="tax_id" value={editForm.tax_id || ''} onChange={handleChange} icon={BadgeCheck} />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1 h-11 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm
                      hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 h-11 rounded-xl bg-[#F59E0B] text-white font-bold text-sm
                      hover:bg-[#D97706] active:scale-[0.98] transition-all flex items-center justify-center gap-2
                      disabled:opacity-50 shadow-sm shadow-amber-200"
                  >
                    {isSaving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</>
                      : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Personal Info */}
                <SectionHeader label="Informações Pessoais" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <FieldDisplay icon={User} label="Nome Completo" value={profile?.full_name} />
                  <FieldDisplay icon={Mail} label="Email" value={profile?.email} />
                  <FieldDisplay icon={Smartphone} label="Telefone" value={profile?.phone} />
                  <FieldDisplay icon={Building} label="Cidade" value={profile?.city} />
                  <FieldDisplay icon={MapPin} label="Endereço" value={profile?.address} />
                  {profile?.birth_date && (
                    <FieldDisplay icon={Calendar} label="Data de Nascimento"
                      value={new Date(profile.birth_date).toLocaleDateString('pt-AO')} />
                  )}
                  {profile?.tax_id && (
                    <FieldDisplay icon={BadgeCheck} label="NIF / BI" value={profile.tax_id} />
                  )}
                </div>

                {/* Quick actions */}
                <SectionHeader label="Acesso Rápido" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Package, label: 'Meus Pedidos', sub: `${stats.total_orders} pedidos`, path: '/orders' },
                    { icon: Heart, label: 'Favoritos', sub: 'Ver lista', path: '/favorites' },
                    { icon: Key, label: 'Alterar Senha', sub: 'Segurança', path: null },
                  ].map(item => (
                    <button key={item.label}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100
                        transition-colors text-left group w-full">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <item.icon className="w-4 h-4 text-[#1E3A5F]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-5 rounded-full bg-[#F59E0B]" />
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</h3>
    </div>
  );
}