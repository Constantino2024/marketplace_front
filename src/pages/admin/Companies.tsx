// pages/admin/Companies.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Printer,
  Filter,
  Download,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Key,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Briefcase,
  Users,
  Settings,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { companiesService, Company, CreateCompanyData } from '../../services/companies';

// Componente de Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> :
     type === 'error' ? <AlertCircle className="w-5 h-5" /> :
     <AlertCircle className="w-5 h-5" />}
    <p className="font-bold">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Modal de confirmação
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-black text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de Aprovação/Rejeição
const ApprovalModal = ({ 
  isOpen, 
  onClose, 
  company, 
  onApprove, 
  onReject 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  company: Company | null; 
  onApprove: (companyId: number) => Promise<void>;
  onReject: (companyId: number, reason: string) => Promise<void>;
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      if (action === 'approve') {
        await onApprove(company.id);
      } else {
        await onReject(company.id, reason);
      }
      onClose();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-800">
            {action === 'approve' ? 'Aprovar Empresa' : 'Rejeitar Empresa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            <strong>Empresa:</strong> {company.company_name}
          </p>
          <p className="text-gray-600 mt-1">
            <strong>Email:</strong> {company.email}
          </p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setAction('approve')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              action === 'approve'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Aprovar
          </button>
          <button
            onClick={() => setAction('reject')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              action === 'reject'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Rejeitar
          </button>
        </div>

        {action === 'reject' && (
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Motivo da Rejeição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="Informe o motivo da rejeição..."
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (action === 'reject' && !reason.trim())}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              action === 'approve'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {action === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Aprovação
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Confirmar Rejeição
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Componente de Progresso
const StepProgress = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const steps = [
    { number: 1, label: 'Login', icon: Key },
    { number: 2, label: 'Empresa', icon: Building2 },
    { number: 3, label: 'Contacto', icon: Users },
    { number: 4, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex-1 relative">
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-[60%] w-full h-0.5 ${
                  isCompleted ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
              
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' :
                  isCompleted ? 'bg-primary text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-bold mt-2 ${
                  isActive ? 'text-primary' :
                  isCompleted ? 'text-gray-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modal de empresa com etapas (para criação e edição)
const CompanyModal = ({ 
  isOpen, 
  onClose, 
  company, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  company?: Company | null; 
  onSave: (data: CreateCompanyData) => Promise<void>;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateCompanyData>({
    username: '',
    email: '',
    password: '',
    company_name: '',
    nif: '',
    address: '',
    phone: '',
    website: '',
    logo: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    status: 'pending',
    is_verified: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        username: company.username || '',
        email: company.email || '',
        password: '',
        company_name: company.company_name || '',
        nif: company.nif || '',
        address: company.address || '',
        phone: company.phone || '',
        website: company.website || '',
        logo: company.logo || '',
        contact_name: company.contact_name || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        status: company.status || 'pending',
        is_verified: company.is_verified || false
      });
      setCurrentStep(1);
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        company_name: '',
        nif: '',
        address: '',
        phone: '',
        website: '',
        logo: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        status: 'pending',
        is_verified: false
      });
      setCurrentStep(1);
    }
    setErrors({});
    setShowGeneratedPassword(false);
  }, [company, isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.username?.trim()) {
        newErrors.username = 'Username é obrigatório';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username deve ter pelo menos 3 caracteres';
      }
      
      if (!formData.email?.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!company && !formData.password) {
        newErrors.password = 'Senha é obrigatória (ou clique em "Gerar Senha")';
      } else if (!company && formData.password && formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    if (step === 2) {
      if (!formData.company_name?.trim()) {
        newErrors.company_name = 'Nome da empresa é obrigatório';
      }
      if (!formData.nif?.trim()) {
        newErrors.nif = 'NIF é obrigatório';
      }
      if (!formData.address?.trim()) {
        newErrors.address = 'Endereço é obrigatório';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Telefone é obrigatório';
      }
    }

    if (step === 3) {
      if (!formData.contact_name?.trim()) {
        newErrors.contact_name = 'Nome do contacto é obrigatório';
      }
      if (!formData.contact_email?.trim()) {
        newErrors.contact_email = 'Email do contacto é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        newErrors.contact_email = 'Email inválido';
      }
      if (!formData.contact_phone?.trim()) {
        newErrors.contact_phone = 'Telefone do contacto é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const generateUniqueUsername = () => {
    if (company) return;
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newUsername = `empresa_${timestamp}_${random}`;
    setFormData(prev => ({ ...prev, username: newUsername }));
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const generatePassword = () => {
    if (company) {
      if (window.confirm('Deseja gerar uma nova senha para esta empresa? A senha atual será substituída.')) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
        setShowGeneratedPassword(true);
        setTimeout(() => setShowGeneratedPassword(false), 10000);
      }
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData(prev => ({ ...prev, password }));
      setShowGeneratedPassword(true);
      setTimeout(() => setShowGeneratedPassword(false), 10000);
    }
    
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name: string, field: React.ReactNode) => (
    <div>
      {field}
      {errors[name] && (
        <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {company ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
            </h2>
            {company && (
              <p className="text-sm text-gray-400 mt-1">
                Editando: <span className="font-bold text-primary">{company.company_name}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <StepProgress currentStep={currentStep} totalSteps={4} />

        <AnimatePresence>
          {showGeneratedPassword && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
            >
              <p className="text-sm font-bold text-yellow-700 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Nova senha gerada: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{formData.password}</span>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Guarde esta senha. Por segurança, ela não será mostrada novamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 -mx-8 -mt-8 px-8 py-6 rounded-t-3xl mb-6">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Dados de Login
                </h3>
                <p className="text-blue-100 text-sm">
                  {company 
                    ? 'Edite as informações de acesso da empresa' 
                    : 'Informações para acesso da empresa ao sistema'}
                </p>
              </div>

              <div className="space-y-4">
                {renderField('username', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: e.target.value });
                          setErrors({ ...errors, username: '' });
                        }}
                        disabled={!!company}
                        className={`flex-1 ${
                          company 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-50'
                        } border ${
                          errors.username ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200`}
                        placeholder="usuario_da_empresa"
                      />
                      {!company && (
                        <button
                          type="button"
                          onClick={generateUniqueUsername}
                          className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold"
                        >
                          Gerar
                        </button>
                      )}
                    </div>
                    {company && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        O username não pode ser alterado após a criação
                      </p>
                    )}
                  </div>
                ))}

                {renderField('email', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full bg-gray-50 border ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200`}
                      placeholder="empresa@exemplo.ao"
                    />
                  </div>
                ))}

                {renderField('password', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      {company ? 'Nova Senha (opcional)' : 'Senha'}
                      {!company && <span className="text-gray-400"> (deixe em branco para gerar)</span>}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            setErrors({ ...errors, password: '' });
                          }}
                          className={`w-full bg-gray-50 border ${
                            errors.password ? 'border-red-300' : 'border-gray-200'
                          } rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200`}
                          placeholder={company ? "Deixar em branco para manter atual" : "••••••••"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold whitespace-nowrap"
                      >
                        {company ? 'Gerar Nova' : 'Gerar Senha'}
                      </button>
                    </div>
                    {company && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Preencha apenas se quiser alterar a senha atual
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 -mx-8 -mt-8 px-8 py-6 rounded-t-3xl mb-6">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dados da Empresa
                </h3>
                <p className="text-purple-100 text-sm">Informações cadastrais da empresa</p>
              </div>

              <div className="space-y-4">
                {renderField('company_name', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Nome da Empresa <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => {
                        setFormData({ ...formData, company_name: e.target.value });
                        setErrors({ ...errors, company_name: '' });
                      }}
                      className={`w-full bg-gray-50 border ${
                        errors.company_name ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200`}
                      placeholder="Ex: Loja de Luanda"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('nif', (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                        NIF <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nif}
                        onChange={(e) => {
                          setFormData({ ...formData, nif: e.target.value });
                          setErrors({ ...errors, nif: '' });
                        }}
                        className={`w-full bg-gray-50 border ${
                          errors.nif ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200`}
                        placeholder="123456789"
                      />
                    </div>
                  ))}

                  {renderField('phone', (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                        Telefone <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setErrors({ ...errors, phone: '' });
                        }}
                        className={`w-full bg-gray-50 border ${
                          errors.phone ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200`}
                        placeholder="+244 123 456 789"
                      />
                    </div>
                  ))}
                </div>

                {renderField('address', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Endereço <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        setErrors({ ...errors, address: '' });
                      }}
                      rows={2}
                      className={`w-full bg-gray-50 border ${
                        errors.address ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200`}
                      placeholder="Endereço completo da empresa"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="https://www.exemplo.ao"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      URL do Logo
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 -mx-8 -mt-8 px-8 py-6 rounded-t-3xl mb-6">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contacto Principal
                </h3>
                <p className="text-green-100 text-sm">Pessoa responsável pela empresa</p>
              </div>

              <div className="space-y-4">
                {renderField('contact_name', (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Nome do Contacto <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => {
                        setFormData({ ...formData, contact_name: e.target.value });
                        setErrors({ ...errors, contact_name: '' });
                      }}
                      className={`w-full bg-gray-50 border ${
                        errors.contact_name ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200`}
                      placeholder="Nome do responsável"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('contact_email', (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                        Email do Contacto <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => {
                          setFormData({ ...formData, contact_email: e.target.value });
                          setErrors({ ...errors, contact_email: '' });
                        }}
                        className={`w-full bg-gray-50 border ${
                          errors.contact_email ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200`}
                        placeholder="contacto@exemplo.ao"
                      />
                    </div>
                  ))}

                  {renderField('contact_phone', (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                        Telefone do Contacto <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => {
                          setFormData({ ...formData, contact_phone: e.target.value });
                          setErrors({ ...errors, contact_phone: '' });
                        }}
                        className={`w-full bg-gray-50 border ${
                          errors.contact_phone ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200`}
                        placeholder="+244 123 456 789"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 -mx-8 -mt-8 px-8 py-6 rounded-t-3xl mb-6">
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações
                </h3>
                <p className="text-orange-100 text-sm">Status e permissões da empresa</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-200"
                  />
                  <label htmlFor="is_verified" className="text-sm font-medium text-gray-700">
                    Empresa verificada
                  </label>
                </div>

                <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                  <h4 className="font-black text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Resumo do Cadastro
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dados de Login</p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">Username:</span>{' '}
                        <span className="font-bold">{formData.username}</span>
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">Email:</span>{' '}
                        <span className="font-bold">{formData.email}</span>
                      </p>
                      {formData.password && (
                        <p className="text-sm">
                          <span className="text-gray-500">Senha:</span>{' '}
                          <span className="font-mono text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">
                            {company ? 'Nova senha definida' : '********'}
                          </span>
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Empresa</p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">Nome:</span>{' '}
                        <span className="font-bold">{formData.company_name}</span>
                      </p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">NIF:</span>{' '}
                        <span className="font-mono">{formData.nif}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Telefone:</span>{' '}
                        <span>{formData.phone}</span>
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Contacto</p>
                      <p className="text-sm mb-2">
                        <span className="text-gray-500">Nome:</span>{' '}
                        <span className="font-bold">{formData.contact_name}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Email / Telefone:</span>{' '}
                        <span>{formData.contact_email} / {formData.contact_phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      Editar Login
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                    >
                      Editar Empresa
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="text-xs text-green-500 hover:underline flex items-center gap-1"
                    >
                      Editar Contacto
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    'A processar...'
                  ) : (
                    <>
                      {company ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Componente principal Companies
export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [stats, setStats] = useState({ total_companies: 0, active_companies: 0, total_sales: 0 });

  // Carregar empresas
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const data = await companiesService.list();
      setCompanies(data);
      setFilteredCompanies(data);
      
      // Carregar estatísticas
      try {
        const statsData = await companiesService.getStats();
        setStats(statsData);
      } catch (statsError) {
        console.error('Erro ao carregar estatísticas:', statsError);
      }
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        showToast('Erro ao carregar empresas', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Filtrar empresas
  useEffect(() => {
    const filtered = companies.filter(company => 
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nif.includes(searchTerm)
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Aprovar empresa
  const handleApproveCompany = async (companyId: number) => {
    try {
      const result = await companiesService.approveCompany(companyId);
      if (result.success) {
        showToast('Empresa aprovada com sucesso!', 'success');
        await loadCompanies();
      } else {
        showToast(result.error || 'Erro ao aprovar empresa', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao aprovar empresa:', error);
      showToast(error.response?.data?.error || 'Erro ao aprovar empresa', 'error');
      throw error;
    }
  };

  // Rejeitar empresa
  const handleRejectCompany = async (companyId: number, reason: string) => {
    try {
      const result = await companiesService.rejectCompany(companyId, reason);
      if (result.success) {
        showToast('Empresa rejeitada!', 'success');
        await loadCompanies();
      } else {
        showToast(result.error || 'Erro ao rejeitar empresa', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao rejeitar empresa:', error);
      showToast(error.response?.data?.error || 'Erro ao rejeitar empresa', 'error');
      throw error;
    }
  };

  // Criar/Atualizar empresa
  const handleSaveCompany = async (data: CreateCompanyData) => {
    try {
      if (selectedCompany) {
        const updateData = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await companiesService.update(selectedCompany.id, updateData);
        showToast('Empresa atualizada com sucesso!', 'success');
      } else {
        const newCompany = await companiesService.create(data);
        if ((newCompany as any).generated_password) {
          showToast(`Empresa criada! Senha: ${(newCompany as any).generated_password}`, 'info');
        } else {
          showToast('Empresa criada com sucesso!', 'success');
        }
      }
      await loadCompanies();
      setSelectedCompany(null);
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erro ao salvar empresa';
        
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
          }
        }
        
        showToast(errorMessage, 'error');
      } else {
        showToast('Erro ao salvar empresa', 'error');
      }
      
      throw error;
    }
  };

  // Deletar empresa
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      await companiesService.delete(selectedCompany.id);
      showToast('Empresa eliminada com sucesso!', 'success');
      await loadCompanies();
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      showToast('Erro ao deletar empresa', 'error');
    } finally {
      setSelectedCompany(null);
    }
  };

  // Resetar senha
  const handleResetPassword = async (company: Company) => {
    try {
      const result = await companiesService.resetPassword(company.id);
      showToast(`Senha resetada: ${result.new_password}`, 'info');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      showToast('Erro ao resetar senha', 'error');
    }
  };

  // Ativar/desativar
  const handleToggleStatus = async (company: Company) => {
    try {
      await companiesService.toggleStatus(company.id);
      showToast(`Empresa ${company.status === 'active' ? 'desativada' : 'ativada'} com sucesso!`, 'success');
      await loadCompanies();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showToast('Erro ao alterar status', 'error');
    }
  };

  // Traduzir status
  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente',
      'suspended': 'Suspenso'
    };
    return map[status] || status;
  };

  // Cor do status
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'active': 'bg-emerald-100 text-emerald-600',
      'inactive': 'bg-gray-100 text-gray-600',
      'pending': 'bg-yellow-100 text-yellow-600',
      'suspended': 'bg-red-100 text-red-600'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleDeleteCompany}
        title="Eliminar Empresa"
        message={`Tem certeza que deseja eliminar a empresa "${selectedCompany?.company_name}"? Esta ação não pode ser desfeita.`}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onApprove={handleApproveCompany}
        onReject={handleRejectCompany}
      />

      {/* Company Modal */}
      <CompanyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSave={handleSaveCompany}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Gestão de Empresas</h1>
          <p className="text-sm text-gray-400">Gerencie todas as lojas parceiras na plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            Relatório Geral
          </button>
          <button 
            onClick={() => {
              setSelectedCompany(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total de Empresas</p>
          <p className="text-3xl font-black text-gray-800">{stats.total_companies}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Empresas Ativas</p>
          <p className="text-3xl font-black text-emerald-500">{stats.active_companies}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Vendas Totais</p>
          <p className="text-3xl font-black text-primary">Kz {stats.total_sales.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, email ou NIF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Empresa / Usuário</th>
                  <th className="px-6 py-4">NIF</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Produtos</th>
                  <th className="px-6 py-4">Vendas Totais</th>
                  <th className="px-6 py-4">Data de Adesão</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.company_name}
                            className="w-10 h-10 rounded-xl object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement?.classList.add('bg-primary/10', 'flex', 'items-center', 'justify-center');
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                            {company.company_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800">{company.company_name}</p>
                          <p className="text-xs text-gray-400">{company.email || 'Email não disponível'}</p>
                          <p className="text-[10px] text-gray-300">
                            Username: {company.username || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">{company.nif}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-500">{company.contact_name}</p>
                        <p className="text-xs text-gray-400">{company.contact_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(company.status)}`}>
                        {translateStatus(company.status)}
                      </span>
                      {company.is_verified && (
                        <span className="ml-2 text-[10px] font-bold text-primary">✓ Verificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-500">{company.products_count}</td>
                    <td className="px-6 py-4 font-black text-primary">Kz {company.total_sales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(company.joined_date).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botões para empresas pendentes */}
                        {company.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowApprovalModal(true);
                              }}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Aprovar Empresa"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowApprovalModal(true);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeitar Empresa"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleToggleStatus(company)}
                          className={`p-2 rounded-lg transition-colors ${
                            company.status === 'active' 
                              ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' 
                              : company.status === 'pending'
                              ? 'text-gray-400 cursor-not-allowed opacity-50'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={company.status === 'active' ? 'Desativar' : company.status === 'pending' ? 'Aguardando aprovação' : 'Ativar'}
                          disabled={company.status === 'pending'}
                        >
                          {company.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(company)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Resetar Senha"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowConfirmModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-20">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Nenhuma empresa encontrada</p>
                <button
                  onClick={() => {
                    setSelectedCompany(null);
                    setShowModal(true);
                  }}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Cadastrar primeira empresa
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}