// pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { passwordResetService } from '../services/passwordReset';

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">×</button>
  </motion.div>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token inválido');
        setIsValidating(false);
        return;
      }

      const result = await passwordResetService.validateToken(token);
      if (result.valid) {
        setIsTokenValid(true);
        setEmail(result.email || '');
      } else {
        setError(result.error || 'Token inválido ou expirado');
      }
      setIsValidating(false);
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    if (!newPassword) {
      setError('Nova palavra-passe é obrigatória');
      return false;
    }
    if (newPassword.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await passwordResetService.confirmReset({
        token: token!,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      if (result.success) {
        setToast({
          message: result.message || 'Palavra-passe alterada com sucesso!',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao redefinir palavra-passe');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Link Inválido</h2>
          <p className="text-gray-500 mb-6">
            {error || 'Este link de redefinição de palavra-passe é inválido ou já expirou.'}
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-primary mb-2">Nova Palavra-passe</h2>
            <p className="text-gray-500 text-sm">
              Crie uma nova palavra-passe para a sua conta
            </p>
            {email && (
              <p className="text-xs text-gray-400 mt-2">
                Para: <span className="font-bold">{email}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nova Palavra-passe <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Confirmar Palavra-passe <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A processar...
                </>
              ) : (
                'Redefinir Palavra-passe'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-primary font-bold inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}