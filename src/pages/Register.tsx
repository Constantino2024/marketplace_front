import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\+?[0-9]{9,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Telefone inválido (9-13 dígitos)';
    }

    if (!formData.password) {
      newErrors.password = 'Palavra-passe é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A palavra-passe deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirme sua palavra-passe';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'As palavras-passe não coincidem';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Você deve aceitar os Termos e Condições';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await customerService.register(formData);
      
      if (result.success) {
        // Redirecionar para login com mensagem de sucesso
        navigate('/login', { 
          state: { 
            message: 'Registo realizado com sucesso! Faça login para continuar.' 
          } 
        });
      } else {
        // Mostrar erro
        setErrors({ form: result.error || 'Erro ao realizar registo' });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      setErrors({ form: 'Erro ao realizar registo. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-primary mb-2">Criar Conta</h2>
          <p className="text-gray-500 text-sm">Junte-se a nós e aproveite as melhores ofertas</p>
        </div>

        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nome Completo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                className={`w-full bg-gray-50 border ${
                  errors.full_name ? 'border-red-300' : 'border-gray-200'
                } rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@email.com"
                className={`w-full bg-gray-50 border ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                } rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Telefone <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+244 9XX XXX XXX"
                className={`w-full bg-gray-50 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-200'
                } rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Palavra-passe */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Palavra-passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-gray-50 border ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                } rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Palavra-passe */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Confirmar Palavra-passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-gray-50 border ${
                  errors.confirm_password ? 'border-red-300' : 'border-gray-200'
                } rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
            )}
          </div>

          {/* Termos e Condições */}
          <div className="flex items-start gap-2 py-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 accent-primary" 
            />
            <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
              Eu aceito os <a href="#" className="text-primary font-bold hover:underline">Termos e Condições</a> e a <a href="#" className="text-primary font-bold hover:underline">Política de Privacidade</a>.
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              'A processar...'
            ) : (
              <>
                Registrar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta? {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Fazer Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}