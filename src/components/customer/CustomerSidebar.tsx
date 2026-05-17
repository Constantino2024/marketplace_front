import React from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, Key, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, logout } from '../../services/auth';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  action?: () => void;  // Agora é uma função, não string
}

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeItem?: string;
  menuItems: MenuItem[];
  onLogout?: () => void;
  isMobile?: boolean;
  onActionClick?: (actionId: string) => void;  // Callback para ações
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  isOpen = false,
  onClose,
  activeItem,
  menuItems,
  onLogout,
  isMobile = false,
  onActionClick
}) => {
  const user = getCurrentUser();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      if (onLogout) onLogout();
    }
  };

  const handleActionClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (onActionClick && item.id) {
      onActionClick(item.id);
    }
    if (isMobile && onClose) onClose();
  };

  const SidebarContent = () => (
    <>
      {/* Perfil do Usuário */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{user?.username || 'Cliente'}</h3>
            <p className="text-white/70 text-xs truncate">{user?.email}</p>
          </div>
          {isMobile && onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          if (item.path) {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={isMobile && onClose ? onClose : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          }
          
          // Para itens com action (callback function)
          if (item.action || onActionClick) {
            return (
              <button
                key={item.id}
                onClick={() => handleActionClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-left ${
                  isActive
                    ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#F59E0B]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          }
          
          return null;
        })}

        <div className="pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  );
};