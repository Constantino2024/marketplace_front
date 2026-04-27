// pages/CompanyRegister.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Mail, Phone, MapPin, Globe, User, 
  Key, Eye, EyeOff, AlertCircle, CheckCircle, 
  ArrowRight, X, Store, CreditCard, Truck, Shield,
  Users, Briefcase, FileText, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TermsModal from '../components/TermsModal';
import { companyRegistrationService, CompanyRegistrationData } from '../services/companyRegistration';

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">×</button>
  </motion.div>
);

const StepProgress = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const steps = [
    { number: 1, label: 'Dados da Empresa', icon: Building2 },
    { number: 2, label: 'Dados de Login', icon: Key },
    { number: 3, label: 'Contacto', icon: Users },
    { number: 4, label: 'Confirmar', icon: CheckCircle },
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
                  isCompleted ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110' :
                  isCompleted ? 'bg-orange-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-bold mt-2 ${
                  isActive ? 'text-orange-500' :
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

export default function CompanyRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    nif: '',
    address: '',
    phone: '',
    website: '',
    logo: '',
    email: '',
    password: '',
    confirm_password: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Funções de validação
  const validateRequired = (value: string, fieldName: string): string => {
    if (!value || !value.trim()) return `${fieldName} é obrigatório`;
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone || !phone.trim()) return 'Telefone é obrigatório';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) return 'Telefone deve ter exatamente 9 dígitos';
    if (!cleanPhone.startsWith('9')) return 'Telefone deve começar com 9';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email || !email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return '';
  };

  // NIF pode conter letras e números (formato alfanumérico)
  const validateNif = (nif: string): string => {
    if (!nif || !nif.trim()) return 'NIF é obrigatório';
    // Aceita letras maiúsculas, números e espaços
    const nifRegex = /^[A-Za-z0-9\s]{5,20}$/;
    if (!nifRegex.test(nif)) return 'NIF inválido (use apenas letras e números)';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return '';
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const companyNameError = validateRequired(formData.company_name, 'Nome da empresa');
    if (companyNameError) newErrors.company_name = companyNameError;
    
    const nifError = validateNif(formData.nif);
    if (nifError) newErrors.nif = nifError;
    
    const addressError = validateRequired(formData.address, 'Endereço');
    if (addressError) newErrors.address = addressError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    
    // Marcar campos como tocados
    setTouched(prev => ({
      ...prev,
      company_name: true,
      nif: true,
      address: true,
      phone: true
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'As senhas não coincidem';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    
    // Marcar campos como tocados
    setTouched(prev => ({
      ...prev,
      email: true,
      password: true,
      confirm_password: true
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const contactNameError = validateRequired(formData.contact_name, 'Nome do contacto');
    if (contactNameError) newErrors.contact_name = contactNameError;
    
    const contactEmailError = validateEmail(formData.contact_email);
    if (contactEmailError) newErrors.contact_email = contactEmailError;
    
    const contactPhoneError = validatePhone(formData.contact_phone);
    if (contactPhoneError) newErrors.contact_phone = contactPhoneError;
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    
    // Marcar campos como tocados
    setTouched(prev => ({
      ...prev,
      contact_name: true,
      contact_email: true,
      contact_phone: true
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'phone' || name === 'contact_phone') {
      formattedValue = value.replace(/\D/g, '').slice(0, 9);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo específico ao perder o foco
    let error = '';
    if (name === 'company_name') error = validateRequired(formData.company_name, 'Nome da empresa');
    if (name === 'nif') error = validateNif(formData.nif);
    if (name === 'address') error = validateRequired(formData.address, 'Endereço');
    if (name === 'phone') error = validatePhone(formData.phone);
    if (name === 'email') error = validateEmail(formData.email);
    if (name === 'password') error = validatePassword(formData.password);
    if (name === 'confirm_password' && formData.password !== formData.confirm_password) {
      error = 'As senhas não coincidem';
    }
    if (name === 'contact_name') error = validateRequired(formData.contact_name, 'Nome do contacto');
    if (name === 'contact_email') error = validateEmail(formData.contact_email);
    if (name === 'contact_phone') error = validatePhone(formData.contact_phone);
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      setToast({
        message: 'Por favor, preencha todos os campos corretamente antes de continuar.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setToast({
        message: 'Você precisa aceitar os Termos e Condições para continuar',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // Validar todos os passos antes de enviar
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      setToast({
        message: 'Por favor, preencha todos os campos corretamente.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      setCurrentStep(1);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await companyRegistrationService.register(formData);
      
      if (result.success) {
        setToast({
          message: result.message || 'Empresa registrada com sucesso! Aguarde aprovação.',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Cadastro realizado! Aguarde a aprovação do administrador.' 
            } 
          });
        }, 3000);
      } else {
        const errorMessages = result.errors || { form: result.error || 'Erro ao registrar' };
        const firstError = Object.values(errorMessages)[0];
        setToast({
          message: typeof firstError === 'string' ? firstError : 'Erro ao registrar empresa',
          type: 'error'
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Erro:', error);
      setToast({
        message: 'Erro ao registrar empresa. Tente novamente.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name: string, field: React.ReactNode) => (
    <div>
      {field}
      {touched[name] && errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal de Termos */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-800">Cadastro de Empresa</h2>
            <p className="text-gray-500 text-sm mt-1">
              Junte-se à nossa plataforma e comece a vender hoje mesmo!
            </p>
          </div>

          <StepProgress currentStep={currentStep} totalSteps={4} />

          <form onSubmit={handleSubmit}>
            {/* ETAPA 1: DADOS DA EMPRESA */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-orange-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-orange-700 font-medium">Informações da sua empresa</p>
                </div>

                {renderField('company_name', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Nome da Empresa <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="Ex: Loja de Luanda"
                      />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('nif', (
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                        NIF <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="nif"
                          value={formData.nif}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          placeholder="123456789 ou ABC123"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Letras e números (5-20 caracteres)</p>
                    </div>
                  ))}

                  {renderField('phone', (
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                        Telefone <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          maxLength={9}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          placeholder="923456789"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">9 dígitos, começa com 9</p>
                    </div>
                  ))}
                </div>

                {renderField('address', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Endereço <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                        placeholder="Rua Principal, 123, Luanda"
                      />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="https://www.exemplo.ao"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      URL do Logo
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: DADOS DE LOGIN */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-blue-700 font-medium">Informações de acesso à plataforma</p>
                </div>

                {renderField('email', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="empresa@exemplo.ao"
                      />
                    </div>
                  </div>
                ))}

                {renderField('password', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Mínimo de 6 caracteres</p>
                  </div>
                ))}

                {renderField('confirm_password', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Confirmar Senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="••••••••"
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
                ))}
              </motion.div>
            )}

            {/* ETAPA 3: CONTACTO */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-green-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-green-700 font-medium">Pessoa responsável pela empresa</p>
                </div>

                {renderField('contact_name', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Nome do Contacto <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                ))}

                {renderField('contact_email', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Email do Contacto <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="contacto@exemplo.ao"
                      />
                    </div>
                  </div>
                ))}

                {renderField('contact_phone', (
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Telefone do Contacto <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={9}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="923456789"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">9 dígitos, começa com 9</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ETAPA 4: CONFIRMAÇÃO */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-emerald-50 p-5 rounded-xl mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-lg font-black text-gray-800">Confirmar Cadastro</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Revise os dados antes de finalizar o cadastro. Após a confirmação, 
                    sua empresa será analisada pela nossa equipe.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      Dados da Empresa
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{formData.company_name}</span></div>
                      <div><span className="text-gray-500">NIF:</span> <span className="font-mono">{formData.nif}</span></div>
                      <div><span className="text-gray-500">Telefone:</span> <span>{formData.phone}</span></div>
                      <div><span className="text-gray-500">Endereço:</span> <span className="truncate">{formData.address}</span></div>
                      {formData.website && <div><span className="text-gray-500">Website:</span> <span className="truncate">{formData.website}</span></div>}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Key className="w-4 h-4 text-orange-500" />
                      Dados de Login
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Email:</span> <span>{formData.email}</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Contacto
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div><span className="text-gray-500">Nome:</span> <span>{formData.contact_name}</span></div>
                      <div><span className="text-gray-500">Email:</span> <span>{formData.contact_email}</span></div>
                      <div><span className="text-gray-500">Telefone:</span> <span>{formData.contact_phone}</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-700">
                    ⚠️ Ao finalizar, sua empresa ficará em análise. Você receberá um email quando for aprovada.
                  </p>
                </div>

                {/* Aceitação dos Termos */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setShowTermsModal(true);
                        } else {
                          setTermsAccepted(true);
                        }
                      }}
                      className="mt-0.5 w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-gray-800">
                        Li e aceito os{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-orange-500 hover:underline"
                        >
                          Termos e Condições
                        </button>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Concordo que minha empresa comercializará exclusivamente produtos relacionados à Saúde, Segurança e Ergonomia (HSE).
                      </p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Botões de navegação */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Anterior
                </button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !termsAccepted}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Finalizar Cadastro
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-orange-500 font-bold hover:underline">
                Fazer Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}