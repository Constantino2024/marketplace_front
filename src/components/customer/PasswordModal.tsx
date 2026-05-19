import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Loader2, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onChangePassword
}) => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('As palavras-passe não coincidem');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setError('A nova palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChanging(true);
    setError('');
    
    try {
      const success = await onChangePassword(passwordForm.current_password, passwordForm.new_password);
      if (success) {
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        onClose();
      } else {
        setError('Erro ao alterar palavra-passe. Verifique a sua palavra-passe actual.');
      }
    } catch {
      setError('Erro ao alterar palavra-passe. Verifique a sua palavra-passe actual.');
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setError('');
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-base sm:text-lg">Alterar Palavra-passe</h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Palavra-passe Actual
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Nova Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Confirmar Nova Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChanging}
                  className="flex-1 py-2.5 bg-[#F59E0B] text-white rounded-lg font-bold hover:bg-[#D97706] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {isChanging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A alterar...
                    </>
                  ) : (
                    'Alterar Palavra-passe'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};