import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft,
  Shield,
  Truck,
  CreditCard,
  Store,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../utils/currency';
import ProformaModal from '../components/ProformaModal';

{/** Imagens de Pagamentos aceitáveis */}
import express from '../img/express.webp';
import referencia from '../img/referencia.webp';
import ekwanza from '../img/ekwanza.png';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});

  // Agrupar produtos por loja/empresa
  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  const toggleStoreExpand = (storeName: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeName]: !prev[storeName]
    }));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[70vh] flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-white shadow-lg">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 mb-2 sm:mb-3 text-center">O seu carrinho está vazio</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 text-center max-w-md px-4">
          Parece que ainda não adicionou nada ao seu carrinho. 
          Explore os nossos produtos e encontre o que procura!
        </p>
        <Link 
          to="/" 
          className="bg-[#F59E0B] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold hover:bg-[#D97706] transition-all shadow-lg shadow-[#F59E0B]/20 flex items-center gap-2 group text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          Começar a comprar
        </Link>

        {/* Sugestões */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl px-4">
          <div className="text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B]" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Entrega Grátis</h3>
            <p className="text-[10px] sm:text-xs text-gray-400">Para compras acima de Kz 50.000,00</p>
          </div>
          <div className="text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Pagamento Seguro</h3>
            <p className="text-[10px] sm:text-xs text-gray-400">As suas informações estão protegidas</p>
          </div>
          <div className="text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Pagamento Facilitado</h3>
            <p className="text-[10px] sm:text-xs text-gray-400">Múltiplas formas de pagamento</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Cabeçalho com navegação */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/" 
              className="p-1.5 sm:p-2 hover:bg-white rounded-full transition-colors group shadow-sm"
              title="Continuar a comprar"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A5F] group-hover:text-[#F59E0B] transition-colors" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E3A5F]">O seu Carrinho</h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
                {cartCount} {cartCount === 1 ? 'produto' : 'produtos'} no carrinho
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tem a certeza que deseja limpar o carrinho?')) {
                clearCart();
              }
            }}
            className="text-red-500 hover:text-red-600 font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm self-start xs:self-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Limpar Carrinho
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          {/* Itens do Carrinho */}
          <div className="lg:flex-[2] space-y-4 sm:space-y-6 md:space-y-8">
            {Object.entries(groupedByStore).map(([storeName, items], storeIndex) => {
              const storeTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const isExpanded = expandedStores[storeName] !== false; // Expandido por padrão
              
              return (
                <motion.div
                  key={storeName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: storeIndex * 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Cabeçalho da loja */}
                  <button
                    onClick={() => toggleStoreExpand(storeName)}
                    className="w-full bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                        <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base">{storeName}</h3>
                        <p className="text-[9px] sm:text-xs text-gray-400">{items.length} {items.length === 1 ? 'produto' : 'produtos'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-[#F59E0B] font-black text-xs sm:text-sm">{formatCurrency(storeTotal)}</span>
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-90 transition-transform" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />}
                      </div>
                    </div>
                  </button>

                  {/* Produtos da loja */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="divide-y divide-gray-50"
                      >
                        {items.map((item) => {
                          const itemTotal = item.price * item.quantity;
                          
                          return (
                            <motion.div 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={item.id} 
                              className="p-3 sm:p-4 md:p-6 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                {/* Imagem do produto */}
                                <Link 
                                  to={`/product/${item.id}`}
                                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:scale-105 transition-transform mx-auto sm:mx-0"
                                >
                                  {item.image_url || item.image ? (
                                    <img 
                                      src={item.image_url || item.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                                    </div>
                                  )}
                                </Link>
                                
                                {/* Detalhes do produto */}
                                <div className="flex-1 min-w-0">
                                  <Link to={`/product/${item.id}`}>
                                    <h3 className="font-bold text-gray-800 text-sm sm:text-base hover:text-[#F59E0B] transition-colors line-clamp-2">
                                      {item.name}
                                    </h3>
                                  </Link>
                                  
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-400 mt-1 mb-2">
                                    {item.category_name && (
                                      <>
                                        <span>{item.category_name}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span className={item.stock > 0 ? 'text-green-500' : 'text-red-500'}>
                                      {item.stock > 0 ? 'Em stock' : 'Sem stock'}
                                    </span>
                                  </div>

                                  {/* Preço para telemóvel */}
                                  <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                    <div>
                                      <span className="text-[10px] text-gray-400">Preço unitário</span>
                                      <p className="text-[#F59E0B] font-black text-sm">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[10px] text-gray-400">Subtotal</span>
                                      <p className="text-gray-800 font-bold text-sm">{formatCurrency(itemTotal)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Controlos de quantidade e preço (Desktop) */}
                                <div className="hidden sm:flex items-center gap-4">
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      aria-label="Diminuir quantidade"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= (item.stock || 999)}
                                      className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      aria-label="Aumentar quantidade"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <div className="min-w-[90px] text-right">
                                    <span className="text-[#F59E0B] font-black text-sm">
                                      {formatCurrency(itemTotal)}
                                    </span>
                                    <p className="text-[9px] text-gray-400">{formatCurrency(item.price)} cada</p>
                                  </div>
                                  
                                  <button 
                                    onClick={() => {
                                      if (window.confirm('Remover produto do carrinho?')) {
                                        removeFromCart(item.id);
                                      }
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Controlos de quantidade (Telemóvel) */}
                                <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center border border-gray-200 rounded-lg">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="p-2 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= (item.stock || 999)}
                                      className="p-2 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  <button 
                                    onClick={() => {
                                      if (window.confirm('Remover produto do carrinho?')) {
                                        removeFromCart(item.id);
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Resumo da Encomenda */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 sticky top-24">
              <h2 className="text-lg sm:text-xl font-black text-[#1E3A5F] mb-4 sm:mb-6">Resumo da Encomenda</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Entrega</span>
                  <span className="text-green-500 font-bold">Grátis</span>
                </div>

                {cartTotal < 50000 && (
                  <div className="flex justify-between text-[10px] sm:text-xs text-[#F59E0B]">
                    <span>Faltam para entrega grátis</span>
                    <span className="font-bold">{formatCurrency(50000 - cartTotal)}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800">Total</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-[#F59E0B]">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cupão de desconto */}
              <div className="mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Cupão de desconto"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all"
                  />
                  <button className="px-4 sm:px-6 py-2 sm:py-3 bg-[#1E3A5F] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-[#2C4A6F] transition-colors">
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Botões de acção */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mb-3">
                <button
                  onClick={() => setShowProformaModal(true)}
                  className="flex-1 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-xs sm:text-sm"
                >
                  Factura Pró-Forma
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-1 py-2.5 sm:py-3 bg-[#F59E0B] text-white rounded-lg sm:rounded-xl font-bold hover:bg-[#D97706] transition-all shadow-lg shadow-[#F59E0B]/20 text-xs sm:text-sm"
                >
                  Finalizar Compra
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Compra segura</span>
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                <span>Pagamento protegido</span>
              </div>
              
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-3 sm:mt-4 text-center border-t border-gray-100 pt-3 sm:pt-4">
                Ao finalizar, concorda com os nossos Termos de Serviço e Política de Privacidade.
              </p>

              {/* Métodos de pagamento */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <p className="text-[10px] sm:text-xs text-gray-400 text-center mb-3 sm:mb-4">Aceitamos</p>
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  <img 
                    src={express} 
                    alt="Express" 
                    className="h-8 sm:h-10 md:h-12 opacity-100 object-contain" 
                  />
                  <img 
                    src={referencia} 
                    alt="Referência" 
                    className="h-8 sm:h-10 md:h-12 opacity-100 object-contain" 
                  />
                  <img 
                    src={ekwanza} 
                    alt="Ekwanza" 
                    className="h-8 sm:h-10 md:h-12 opacity-100 object-contain" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Factura Pró-Forma */}
        <ProformaModal
          isOpen={showProformaModal}
          onClose={() => setShowProformaModal(false)}
          items={cart}
          total={cartTotal}
        />

        {/* Botão flutuante para telemóvel - Finalizar compra rápido */}
        <button
          onClick={handleCheckout}
          className="fixed bottom-6 right-6 lg:hidden bg-[#F59E0B] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#D97706] transition-all z-40 flex items-center gap-2 text-sm font-bold"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Finalizar (Kz {formatCurrency(cartTotal)})</span>
        </button>
      </div>
    </div>
  );
}