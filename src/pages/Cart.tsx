import React from 'react';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../utils/currency';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  // Agrupar produtos por loja/empresa
  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
          <ShoppingBag className="w-16 h-16 text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-3">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Parece que você ainda não adicionou nada ao seu carrinho. 
          Explore nossos produtos e encontre o que procura!
        </p>
        <Link 
          to="/" 
          className="bg-orange-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Começar a comprar
        </Link>

        {/* Sugestões */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Entrega Grátis</h3>
            <p className="text-xs text-gray-400">Para compras acima de Kz 50.000</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Pagamento Seguro</h3>
            <p className="text-xs text-gray-400">Suas informações estão protegidas</p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Parcele em até 12x</h3>
            <p className="text-xs text-gray-400">No cartão de crédito</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header com navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Continuar comprando"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-800">Seu Carrinho</h1>
            <p className="text-sm text-gray-400">
              {cartCount} {cartCount === 1 ? 'produto' : 'produtos'} no carrinho
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
              clearCart();
            }
          }}
          className="text-sm text-red-500 hover:text-red-600 font-bold flex items-center gap-2 self-start sm:self-center"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {Object.entries(groupedByStore).map(([storeName, items]) => (
            <motion.div
              key={storeName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Cabeçalho da loja */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Store className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{storeName}</h3>
                    <p className="text-xs text-gray-400">{items.length} produtos</p>
                  </div>
                </div>
              </div>

              {/* Produtos da loja */}
              <div className="divide-y divide-gray-50">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Imagem do produto */}
                      <Link 
                        to={`/product/${item.id}`}
                        className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:scale-105 transition-transform"
                      >
                        {item.image_url || item.image ? (
                          <img 
                            src={item.image_url || item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </Link>
                      
                      {/* Detalhes do produto */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-bold text-gray-800 mb-1 text-sm hover:text-orange-500 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          {item.category_name && (
                            <>
                              <span>{item.category_name}</span>
                              <span>•</span>
                            </>
                          )}
                          <span className={item.stock > 0 ? 'text-green-500' : 'text-red-500'}>
                            {item.stock > 0 ? 'Em estoque' : 'Fora de estoque'}
                          </span>
                        </div>

                        {/* Preço mobile */}
                        <div className="flex sm:hidden items-center justify-between">
                          <span className="text-orange-500 font-black">{formatCurrency(item.price)}</span>
                          <span className="text-xs text-gray-400">Total: {formatCurrency(itemTotal)}</span>
                        </div>
                      </div>

                      {/* Controles de quantidade e preço */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 999)}
                            className="p-2 hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block text-orange-500 font-black min-w-[100px] text-right">
                            {formatCurrency(itemTotal)}
                          </span>
                          
                          <button 
                            onClick={() => {
                              if (window.confirm('Remover produto do carrinho?')) {
                                removeFromCart(item.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Preço unitário */}
                      <span className="hidden sm:block text-xs text-gray-400 w-20 text-right">
                        {formatCurrency(item.price)} cada
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total da loja */}
              <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">Subtotal da loja</span>
                <span className="text-orange-500 font-black">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-32">
            <h2 className="text-xl font-black text-gray-800 mb-6">Resumo do Pedido</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entrega</span>
                <span className="text-green-500 font-bold">Grátis</span>
              </div>

              {cartTotal < 50000 && (
                <div className="flex justify-between text-sm text-orange-500">
                  <span>Faltam para frete grátis</span>
                  <span className="font-bold">{formatCurrency(50000 - cartTotal)}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-orange-500">{formatCurrency(cartTotal)}</span>
                  <p className="text-[10px] text-gray-400">ou em até 12x de {formatCurrency(cartTotal / 12)}</p>
                </div>
              </div>
            </div>

            {/* Cupom de desconto */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Cupom de desconto"
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  Aplicar
                </button>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 mb-3"
            >
              Finalizar Compra
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Compra segura</span>
              <CreditCard className="w-4 h-4 ml-2" />
              <span>Pagamento protegido</span>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-4 text-center border-t border-gray-100 pt-4">
              Ao finalizar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>

            {/* Métodos de pagamento */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Aceitamos</p>
              <div className="flex items-center justify-center gap-3">
                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" alt="Visa" className="h-6 opacity-50" />
                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png" alt="Mastercard" className="h-6 opacity-50" />
                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/maestro.png" alt="Maestro" className="h-6 opacity-50" />
                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png" alt="Amex" className="h-6 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}