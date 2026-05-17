import React, { useState } from 'react';
import { PageHeader } from './customer/PageHeader';
import { CustomerSidebar, MenuItem } from './customer/CustomerSidebar';
import { Toast, ToastMessage } from './customer/Toast';
import { PasswordModal } from './customer/PasswordModal';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  menuItems: MenuItem[];
  activeItem: string;
  toast: ToastMessage | null;
  setToast: (toast: ToastMessage | null) => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onShowPasswordModal?: () => void;  // Callback opcional
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  title,
  subtitle,
  menuItems,
  activeItem,
  toast,
  setToast,
  onChangePassword,
  onShowPasswordModal
}) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (onChangePassword) {
      return await onChangePassword(currentPassword, newPassword);
    }
    return false;
  };

  // Processar ações do menu
  const handleMenuAction = (actionId: string) => {
    if (actionId === 'change-password') {
      setShowPasswordModal(true);
    }
    // Adicione outras ações aqui se necessário
  };

  // Atualizar menuItems com ações como funções
  const enhancedMenuItems = menuItems.map(item => {
    if (item.id === 'change-password') {
      return {
        ...item,
        action: () => setShowPasswordModal(true)
      };
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <PageHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          showBackButton={true}
        />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <CustomerSidebar
            menuItems={enhancedMenuItems}
            activeItem={activeItem}
            onActionClick={handleMenuAction}
            isMobile={false}
          />
          
          <CustomerSidebar
            menuItems={enhancedMenuItems}
            activeItem={activeItem}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onActionClick={handleMenuAction}
            isMobile={true}
          />

          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>

        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onChangePassword={handlePasswordChange}
        />

        <button
          onClick={() => navigate('/')}
          className="fixed bottom-6 right-6 lg:hidden bg-[#F59E0B] text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-[#D97706] transition-all z-40"
          title="Voltar para página inicial"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};