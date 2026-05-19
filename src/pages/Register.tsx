import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService } from '../services/customer';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validação específica para telefone
    if (name === 'phone') {
      // Remove qualquer caractere não numérico
      let cleaned = value.replace(/\D/g, '');
      
      // Limitar a 9 dígitos
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(0, 9);
      }
      
      // Verificar se o primeiro dígito é 9
      if (cleaned.length > 0 && cleaned[0] !== '9') {
        cleaned = ''; // Limpa se não começar com 9
      }
      
      // Formatar como 9XX XXX XXX
      let formatted = cleaned;
      if (cleaned.length >= 3) {
        formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
      } else if (cleaned.length >= 1) {
        formatted = cleaned;
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted.trim() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    let error = '';
    
    switch (field) {
      case 'full_name':
        if (!formData.full_name.trim()) {
          error = 'Nome completo é obrigatório';
        } else if (formData.full_name.trim().length < 3) {
          error = 'Nome deve ter pelo menos 3 caracteres';
        }
        break;
        
      case 'email':
        if (!formData.email.trim()) {
          error = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          error = 'E-mail inválido (exemplo: nome@dominio.com)';
        }
        break;
        
      case 'phone':
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) {
          error = 'Telefone é obrigatório';
        } else if (phoneDigits.length !== 9) {
          error = 'Telefone deve ter exactamente 9 dígitos';
        } else if (phoneDigits[0] !== '9') {
          error = 'Telefone deve começar com 9 (exemplo: 9XX XXX XXX)';
        }
        break;
        
      case 'password':
        if (!formData.password) {
          error = 'Palavra-passe é obrigatória';
        } else if (formData.password.length < 6) {
          error = 'Palavra-passe deve ter pelo menos 6 caracteres';
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
          error = 'Palavra-passe deve conter letras e números';
        }
        break;
        
      case 'confirm_password':
        if (!formData.confirm_password) {
          error = 'Confirme a sua palavra-passe';
        } else if (formData.password !== formData.confirm_password) {
          error = 'As palavras-passe não coincidem';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const fields = ['full_name', 'email', 'phone', 'password', 'confirm_password'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    if (!agreeTerms) {
      setErrors(prev => ({ ...prev, terms: 'Você deve aceitar os Termos e Condições' }));
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos os campos como tocados
    const allFields = ['full_name', 'email', 'phone', 'password', 'confirm_password'];
    const touched: Record<string, boolean> = {};
    allFields.forEach(field => { touched[field] = true; });
    setTouchedFields(touched);
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Limpar telefone antes de enviar (apenas números)
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const submitData = {
        ...formData,
        phone: cleanPhone
      };
      
      const result = await customerService.register(submitData);
      
      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'Registo realizado com sucesso! Faça login para continuar.',
            type: 'success'
          } 
        });
      } else {
        setErrors({ form: result.error || 'Erro ao realizar registo' });
      }
    } catch (error) {
      console.error('Erro no registo:', error);
      setErrors({ form: 'Erro ao realizar registo. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldStatus = (field: string) => {
    if (!touchedFields[field]) return null;
    if (errors[field]) return 'error';
    if (formData[field as keyof typeof formData] && !errors[field]) return 'success';
    return null;
  };

  const getInputStyles = (field: string) => {
    const status = getFieldStatus(field);
    if (status === 'error') {
      return 'border-red-300 focus:ring-red-500/20 focus:border-red-500';
    }
    if (status === 'success') {
      return 'border-green-300 focus:ring-green-500/20 focus:border-green-500';
    }
    return 'border-gray-200 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B]';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E3A5F] mb-2">Criar Conta</h2>
          <p className="text-xs sm:text-sm text-gray-500">Junte-se a nós e aproveite as melhores ofertas</p>
        </div>

        <AnimatePresence>
          {errors.form && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 sm:gap-3"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-600">{errors.form}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
              Nome Completo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={() => handleBlur('full_name')}
                placeholder="O seu nome completo"
                className={`w-full bg-gray-50 border ${getInputStyles('full_name')} rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              {getFieldStatus('full_name') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <AnimatePresence>
              {errors.full_name && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] sm:text-xs mt-1"
                >
                  {errors.full_name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
              E-mail <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="exemplo@email.com"
                className={`w-full bg-gray-50 border ${getInputStyles('email')} rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              {getFieldStatus('email') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] sm:text-xs mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
              Telefone <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="9XX XXX XXX"
                maxLength={11}
                className={`w-full bg-gray-50 border ${getInputStyles('phone')} rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              {getFieldStatus('phone') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
              Exemplo: 923 456 789 (9 dígitos começando com 9)
            </p>
            <AnimatePresence>
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] sm:text-xs mt-1"
                >
                  {errors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Palavra-passe */}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
              Palavra-passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full bg-gray-50 border ${getInputStyles('password')} rounded-lg pl-9 sm:pl-10 pr-12 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
              Mínimo 6 caracteres, incluindo letras e números
            </p>
            <AnimatePresence>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] sm:text-xs mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirmar Palavra-passe */}
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 sm:mb-2">
              Confirmar Palavra-passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                onBlur={() => handleBlur('confirm_password')}
                placeholder="••••••••"
                className={`w-full bg-gray-50 border ${getInputStyles('confirm_password')} rounded-lg pl-9 sm:pl-10 pr-12 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirm_password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-[10px] sm:text-xs mt-1"
                >
                  {errors.confirm_password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Termos e Condições */}
          <div className="flex items-start gap-2 py-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              className="mt-0.5 accent-[#F59E0B] w-3.5 h-3.5 sm:w-4 sm:h-4" 
            />
            <label htmlFor="terms" className="text-[9px] sm:text-xs text-gray-500 leading-relaxed">
              Eu aceito os <a href="#" className="text-[#F59E0B] font-bold hover:underline">Termos e Condições</a> e a <a href="#" className="text-[#F59E0B] font-bold hover:underline">Política de Privacidade</a>.
            </label>
          </div>
          <AnimatePresence>
            {errors.terms && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-[10px] sm:text-xs -mt-1"
              >
                {errors.terms}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F59E0B] text-white font-bold py-2.5 sm:py-4 rounded-lg sm:rounded-xl hover:bg-[#D97706] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base mt-4 sm:mt-6"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>A processar...</span>
              </div>
            ) : (
              <>
                Registar
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] sm:text-sm text-gray-500">
            Já tem uma conta? {' '}
            <Link to="/login" className="text-[#F59E0B] font-bold hover:underline">Fazer Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}