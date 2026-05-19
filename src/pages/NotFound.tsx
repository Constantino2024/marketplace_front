// pages/NotFound.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  HelpCircle,
  TrendingUp,
  Package,
  Users,
  Store,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { getCurrentUser, isAuthenticated } from '../services/auth';

export default function NotFound() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  // Sugestões de categorias populares
  const popularCategories = [
    { name: 'Electrónicos', icon: Package, path: '/category/eletronicos' },
    { name: 'Moda', icon: ShoppingBag, path: '/category/moda' },
    { name: 'Calçados', icon: Store, path: '/category/calcados' },
    { name: 'Mantimentos', icon: Package, path: '/category/mantimentos' },
  ];

  // Links rápidos baseados no tipo de utilizador
  const quickLinks = [
    ...(authenticated ? [
      ...(user?.is_admin ? [{ name: 'Dashboard Admin', path: '/admin', icon: Users }] : []),
      ...(user?.is_company ? [{ name: 'Minha Loja', path: '/store-admin', icon: Store }] : []),
      ...(user?.is_customer ? [{ name: 'Meus Pedidos', path: '/orders', icon: ShoppingBag }] : []),
    ] : []),
    { name: 'Produtos em Destaque', path: '/products/featured', icon: TrendingUp },
    { name: 'Ajuda', path: '/help', icon: HelpCircle },
  ];

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Conteúdo Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Ilustração 404 */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="text-8xl md:text-9xl font-black text-gray-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertTriangle className="w-20 h-20 md:w-24 md:h-24 text-primary opacity-30" />
              </div>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
              Página Não Encontrada
            </h1>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Ops! A página que procura pode ter sido removida, 
              renomeada ou está temporariamente indisponível.
            </p>

            {/* Botões de Acção */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Home className="w-5 h-5" />
                Página Inicial
              </Link>
            </div>
          </motion.div>
        </motion.div>

        
        {/* Barra de Pesquisa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Encontrar Produto
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input.value.trim()) {
                  navigate(`/search?q=${encodeURIComponent(input.value.trim())}`);
                }
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Pesquisar
              </button>
            </form>
          </div>
        </motion.div>

        {/* Dicas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-400">
            Se acredita que isto é um erro, entre em contacto com o nosso{' '}
            <a href="mailto:suporte@hsemarketplace.ao" className="text-primary font-bold hover:underline">
              suporte
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}