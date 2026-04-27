import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginUser } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<{ emailOrUsername?: string; password?: string; form?: string }>({});

  // Mostrar mensagem de sucesso do registro (se houver)
  useEffect(() => {
    if (location.state?.message) {
      setToast({
        message: location.state.message,
        type: 'success'
      });
      // Limpar o state para não mostrar novamente
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateForm = (): boolean => {
    const newErrors: { emailOrUsername?: string; password?: string } = {};

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email ou username é obrigatório';
    }

    if (!password) {
      newErrors.password = 'Palavra-passe é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginUser(emailOrUsername, password);

      if (result.success) {
        // Redirecionar baseado no tipo de usuário
        if (result.isAdmin) {
          navigate('/admin');
        } else if (result.user?.is_company) {
          navigate('/store-admin');
        } else {
          navigate('/');
        }
      } else {
        setErrors({ form: result.error || 'Credenciais inválidas' });
        setToast({
          message: result.error || 'Erro ao fazer login',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErrors({ form: 'Erro ao fazer login. Tente novamente.' });
      setToast({
        message: 'Erro ao fazer login. Tente novamente.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            } text-white`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-primary mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm">
              Entre na sua conta para continuar comprando
            </p>
          </div>

          {/* Mensagem de erro no formulário */}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email ou Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => {
                    setEmailOrUsername(e.target.value);
                    if (errors.emailOrUsername) setErrors({ ...errors, emailOrUsername: undefined });
                  }}
                  className={`w-full bg-gray-50 border ${
                    errors.emailOrUsername ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                  placeholder="seu@email.com ou username"
                  disabled={isLoading}
                />
              </div>
              {errors.emailOrUsername && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.emailOrUsername}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Palavra-passe <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full bg-gray-50 border ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                  placeholder="••••••••"
                  disabled={isLoading}
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
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Esqueceu a senha? */}
            <div className="text-right">
              <Link 
                to="/forgot-password"
                className="text-xs text-primary font-bold hover:underline"
              >
                Esqueceu a palavra-passe?
              </Link>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'A processar...'
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link para registro */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Criar conta
              </Link>
            </p>
            <Link to="/company/register" className="text-xs text-gray-500 hover:text-orange-500">
              Quero vender na plataforma?
            </Link>
          </div>

          

        </motion.div>
      </div>
    </>
  );
}