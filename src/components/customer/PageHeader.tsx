import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onMenuClick,
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
      {showBackButton && (
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-white rounded-full transition-colors group shadow-sm"
          title="Voltar para página inicial"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A5F] group-hover:text-[#F59E0B] transition-colors" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E3A5F]">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{subtitle}</p>
        )}
      </div>
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 bg-white rounded-lg shadow-sm text-[#1E3A5F] hover:text-[#F59E0B] transition-colors"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </div>
  );
};