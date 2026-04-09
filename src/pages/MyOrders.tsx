import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Home,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { customerService, CustomerOrder } from '../services/customer';

const ITEMS_PER_PAGE = 10;

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await customerService.getOrders({
        page: currentPage,
        page_size: ITEMS_PER_PAGE
      });
      
      // Garantir que response e response.results existam
      setOrders(response?.results || []);
      setTotalItems(response?.count || 0);
      setTotalPages(Math.ceil((response?.count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string; bgColor: string }> = {
      'paid': { 
        color: 'text-emerald-600', 
        icon: CheckCircle2, 
        label: 'Pago',
        bgColor: 'bg-emerald-100'
      },
      'pending': { 
        color: 'text-orange-600', 
        icon: Clock, 
        label: 'Pendente',
        bgColor: 'bg-orange-100'
      },
      'cancelled': { 
        color: 'text-red-600', 
        icon: XCircle, 
        label: 'Cancelado',
        bgColor: 'bg-red-100'
      },
      'shipped': { 
        color: 'text-blue-600', 
        icon: Truck, 
        label: 'Enviado',
        bgColor: 'bg-blue-100'
      },
      'delivered': { 
        color: 'text-green-600', 
        icon: Truck, 
        label: 'Entregue',
        bgColor: 'bg-green-100'
      },
    };
    return configs[status] || configs['pending'];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          title="Voltar para página inicial"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-800">Meus Pedidos</h1>
          <p className="text-sm text-gray-400">Acompanhe o status de todos os seus pedidos</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Página Inicial</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-800">{order.order_number}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Data: {formatDate(order.created_at)}</span>
                          <span>•</span>
                          <span>{order.items_count} {order.items_count === 1 ? 'item' : 'itens'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="text-lg font-black text-primary">Kz {order.total.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 font-bold">
                  Mostrando <span className="text-gray-800">{startIndex + 1}</span> a <span className="text-gray-800">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> de <span className="text-gray-800">{totalItems}</span> pedidos
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-bold text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-400 mb-6">Você ainda não realizou nenhuma compra.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Começar a comprar
            </Link>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Detalhes do Pedido</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Número do Pedido</p>
                  <p className="font-bold text-gray-800">{selectedOrder.order_number}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {React.createElement(getStatusConfig(selectedOrder.status).icon, { className: "w-5 h-5 text-primary" })}
                    <span className="font-bold text-gray-800">{getStatusConfig(selectedOrder.status).label}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Data do Pedido</p>
                  <p className="font-bold text-gray-800">{formatDate(selectedOrder.created_at)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-xl font-black text-primary">Kz {selectedOrder.total.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Itens</p>
                  <p className="font-bold text-gray-800">{selectedOrder.items_count} produtos</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert('Funcionalidade de rastreamento em desenvolvimento');
                    }}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    Acompanhar
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Início
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Botão flutuante para mobile */}
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-6 right-6 md:hidden bg-primary text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all z-50"
        title="Voltar para página inicial"
      >
        <Home className="w-6 h-6" />
      </button>
    </div>
  );
}