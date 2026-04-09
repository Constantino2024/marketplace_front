// components/LogoutButton.tsx
import React from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  className?: string;
}

export default function LogoutButton({ variant = 'header', className = '' }: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/login');
    }
  };

  const styles = {
    header: 'flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all',
    sidebar: 'flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all',
    mobile: 'flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all w-full'
  };

  return (
    <button
      onClick={handleLogout}
      className={`${styles[variant]} ${className}`}
      title="Sair"
      type="button"
    >
      <LogOut className="w-5 h-5" />
      <span>Sair</span>
    </button>
  );
}