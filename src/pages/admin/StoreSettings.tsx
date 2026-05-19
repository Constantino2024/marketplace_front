import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  User, 
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Store,
  FileText,
  Smartphone,
  Briefcase,
  Calendar as CalendarIcon,
  Upload,
  Trash2,
  Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { companyService, CompanyProfile, CompanyUpdateData } from '../../services/company';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 text-sm ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

// Calendar Icon component
const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Package Icon component
const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default function StoreSettings() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para edição de perfil
  const [editForm, setEditForm] = useState<CompanyUpdateData>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para alteração de palavra-passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
  setIsLoading(true);
  try {
    const data = await companyService.getProfile();
    setProfile(data);
    // Usar logo_url ou logo
    const logoUrl = data.logo_url || data.logo;
    setLogoPreview(logoUrl || null);
    setEditForm({
      company_name: data.company_name,
      nif: data.nif,
      address: data.address,
      phone: data.phone,
      website: data.website || '',
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
    });
  } catch (error) {
    showToast('Erro ao carregar dados da loja', 'error');
  } finally {
    setIsLoading(false);
  }
};

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Formato não permitido. Use JPEG, PNG ou WEBP', 'error');
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 2MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const result = await companyService.uploadLogo(file);
      setLogoPreview(result.logo_url);
      if (profile) {
        setProfile({ ...profile, logo_url: result.logo_url });
      }
      showToast('Logótipo actualizado com sucesso!', 'success');
    } catch (error: any) {
      const errorMsg = error?.error || 'Erro ao fazer upload do logótipo';
      showToast(errorMsg, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Tem a certeza que deseja remover o logótipo da loja?')) return;
    
    setIsUploading(true);
    try {
      await companyService.removeLogo();
      setLogoPreview(null);
      if (profile) {
        setProfile({ ...profile, logo_url: undefined });
      }
      showToast('Logótipo removido com sucesso!', 'success');
    } catch (error: any) {
      const errorMsg = error?.error || 'Erro ao remover logótipo';
      showToast(errorMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updated = await companyService.updateProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
      showToast('Dados da loja actualizados com sucesso!', 'success');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Erro ao actualizar dados';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        company_name: profile.company_name,
        nif: profile.nif,
        address: profile.address,
        phone: profile.phone,
        website: profile.website || '',
        contact_name: profile.contact_name,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('As palavras-passe não coincidem');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setPasswordError('A nova palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      await companyService.changePassword(
        passwordForm.current_password,
        passwordForm.new_password,
        passwordForm.confirm_password
      );
      showToast('Palavra-passe alterada com sucesso!', 'success');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      const errorMsg = error?.error || error?.message || 'Erro ao alterar palavra-passe';
      setPasswordError(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Activo', class: 'bg-emerald-100 text-emerald-700' },
      inactive: { text: 'Inactivo', class: 'bg-gray-100 text-gray-700' },
      pending: { text: 'Pendente', class: 'bg-yellow-100 text-yellow-700' },
      suspended: { text: 'Suspenso', class: 'bg-red-100 text-red-700' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.class}`}>{config.text}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">A carregar dados da loja...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Erro ao carregar dados da loja</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Dados da Loja', icon: Store },
    { id: 'password', label: 'Alterar Palavra-passe', icon: Key },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Configurações da Loja</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as informações da sua loja e a sua conta</p>
        </div>
        {activeTab === 'profile' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-orange-500/20"
          >
            <Save className="w-4 h-4" />
            Editar Dados
          </button>
        )}
        {activeTab === 'profile' && isEditing && (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-0 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-xl ${
                isActive
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Dados da Loja */}
        {activeTab === 'profile' && (
          <div className="p-6 sm:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-5 h-5 opacity-80" />
                  <span className="text-xs opacity-80">Vendas Totais</span>
                </div>
                <p className="text-2xl font-black">{formatCurrency(profile.total_sales)}</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <PackageIcon className="w-5 h-5 opacity-80" />
                  <span className="text-xs opacity-80">Produtos</span>
                </div>
                <p className="text-2xl font-black">{profile.products_count}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 opacity-80" />
                  <span className="text-xs opacity-80">Estado</span>
                </div>
                <div className="text-sm font-black">
                  {getStatusBadge(profile.status)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 opacity-80" />
                  <span className="text-xs opacity-80">Desde</span>
                </div>
                <p className="text-sm font-black">{formatDate(profile.joined_date)}</p>
              </div>
            </div>

            {/* Logo Section - SEMPRE VISÍVEL, não depende do modo de edição */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-500" />
                Logótipo da Empresa
              </h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logótipo da empresa" 
                      className="w-full h-full object-cover"
                      onError={() => setLogoPreview(null)}
                    />
                  ) : (
                    <Store className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <label className="cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <span className={`inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? 'A enviar...' : 'Fazer upload'}
                      </span>
                    </label>
                    {logoPreview && (
                      <button
                        onClick={handleRemoveLogo}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Formatos aceites: JPG, PNG, WEBP. Tamanho máximo: 2MB.
                    <br />Recomendado: 200x200px.
                  </p>
                </div>
              </div>
            </div>

            {isEditing ? (
              // Formulário de edição
              <div className="space-y-8">
                {/* Dados Principais */}
                <div className="space-y-6">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-500" />
                    Informações da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <Store className="w-3 h-3 inline mr-1" /> Nome da Loja *
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={editForm.company_name || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <FileText className="w-3 h-3 inline mr-1" /> NIF *
                      </label>
                      <input
                        type="text"
                        name="nif"
                        value={editForm.nif || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <Phone className="w-3 h-3 inline mr-1" /> Telefone da Loja *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <Globe className="w-3 h-3 inline mr-1" /> Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={editForm.website || ''}
                        onChange={handleEditChange}
                        placeholder="https://www.minhaloja.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" /> Endereço Completo *
                      </label>
                      <textarea
                        name="address"
                        value={editForm.address || ''}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto da Loja */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Contacto da Loja
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        Nome do Contacto *
                      </label>
                      <input
                        type="text"
                        name="contact_name"
                        value={editForm.contact_name || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <Mail className="w-3 h-3 inline mr-1" /> Email do Contacto *
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        value={editForm.contact_email || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                        <Smartphone className="w-3 h-3 inline mr-1" /> Telefone do Contacto *
                      </label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={editForm.contact_phone || ''}
                        onChange={handleEditChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Visualização dos dados
              <div className="space-y-8">
                {/* Dados Principais */}
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-500" />
                    Informações da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nome da Loja</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{profile.company_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">NIF</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{profile.nif}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Telefone</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{profile.phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Website</p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          'Não informado'
                        )}
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Endereço</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{profile.address}</p>
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Contacto da Loja
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nome</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{profile.contact_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 break-all">{profile.contact_email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Telefone</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{profile.contact_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Estado e Datas */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Estado</p>
                      <div className="mt-1">{getStatusBadge(profile.status)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Verificado</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {profile.is_verified ? (
                          <span className="text-emerald-600 flex items-center gap-1">✓ Verificado</span>
                        ) : (
                          <span className="text-yellow-600">Pendente</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Data de Adesão</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(profile.joined_date)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Última Actualização</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(profile.updated_at) || formatDate(profile.joined_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alterar Palavra-passe */}
        {activeTab === 'password' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Key className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Alterar Palavra-passe</h2>
                <p className="text-sm text-gray-500 mt-1">Mantenha a sua conta segura</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                    Palavra-passe Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                    Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                    Confirmar Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> A alterar...</>
                  ) : (
                    <><Key className="w-4 h-4" /> Alterar Palavra-passe</>
                  )}
                </button>
              </form>

              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-blue-800 mb-1">Requisitos da palavra-passe</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Mínimo de 6 caracteres</li>
                      <li>Use letras, números e caracteres especiais</li>
                      <li>Não use palavras-passe óbvias como "123456" ou "password"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}