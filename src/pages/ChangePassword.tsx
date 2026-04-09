// pages/ChangePassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { passwordResetService } from '../services/passwordReset';
import { logout } from '../services/auth';

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

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = () => {
    if (!currentPassword) {
      setError('Senha atual é obrigatória');
      return false;
    }
    if (!newPassword) {
      setError('Nova senha é obrigatória');
      return false;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem');
      return false;
    }
    if (currentPassword === newPassword) {
      setError('A nova senha deve ser diferente da senha atual');
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
      const result = await passwordResetService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      if (result.success) {
        setToast({
          message: result.message || 'Senha alterada com sucesso! Faça login novamente.',
          type: 'success'
        });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2 className="text-3xl font-black text-primary mb-2">Alterar Senha</h2>
            <p className="text-gray-500 text-sm">
              Altere sua senha atual por uma nova
            </p>
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
                Senha Atual <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nova Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Confirmar Nova Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                'Alterar Senha'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm text-gray-500 hover:text-primary font-bold inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}