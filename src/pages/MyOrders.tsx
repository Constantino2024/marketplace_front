import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ShoppingBag,
  User,
  Heart,
  MapPin,
  Key,
  Settings,
  X,
  ArrowRight,
  Hash,
  Calendar,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Loader2,
  Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerLayout } from '../components/CustomerLayout';
import { customerService, CustomerOrder, CustomerOrderItem } from '../services/customer';
import { formatCurrency } from '../utils/currency';

const ITEMS_PER_PAGE = 10;

const menuItems = [
  { id: 'profile', label: 'Meu Perfil', icon: User, path: '/profile' },
  { id: 'orders', label: 'Meus Pedidos', icon: Package, path: '/orders' },
  { id: 'favorites', label: 'Meus Favoritos', icon: Heart, path: '/favorites' },
  { id: 'addresses', label: 'Meus Endereços', icon: MapPin, path: '/addresses' },
  { id: 'change-password', label: 'Alterar Senha', icon: Key, action: 'password' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<
  string,
  { label: string; dotClass: string; pillClass: string; icon: React.ElementType }
> = {
  paid: {
    label: 'Pago',
    dotClass: 'bg-emerald-500',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    dotClass: 'bg-amber-400',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: Clock,
  },
  cancelled: {
    label: 'Cancelado',
    dotClass: 'bg-red-400',
    pillClass: 'bg-red-50 text-red-600 border-red-100',
    icon: XCircle,
  },
  shipped: {
    label: 'Enviado',
    dotClass: 'bg-blue-500',
    pillClass: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: Truck,
  },
  delivered: {
    label: 'Entregue',
    dotClass: 'bg-green-500',
    pillClass: 'bg-green-50 text-green-700 border-green-100',
    icon: CheckCircle2,
  },
};
const getStatus = (s: string) => STATUS_MAP[s] ?? STATUS_MAP.pending;

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

// ─── Payment method helpers ───────────────────────────────────────────────────
const PAYMENT_MAP: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  express: {
    label: 'Multicaixa Express',
    icon: Smartphone,
    color: 'text-orange-500',
  },
  reference: {
    label: 'Referência Multicaixa',
    icon: Landmark,
    color: 'text-blue-600',
  },
  ekwanza: {
    label: 'E-Kwanza',
    icon: Wallet,
    color: 'text-emerald-600',
  },
};
const getPayment = (method?: string) =>
  method ? (PAYMENT_MAP[method] ?? null) : null;

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  index,
  onView,
}: {
  order: CustomerOrder;
  index: number;
  onView: () => void;
}) {
  const st = getStatus(order.status);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/6 flex items-center justify-center flex-shrink-0 hidden sm:flex">
        <Package className="w-5 h-5 text-[#1E3A5F]/50" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-gray-800 text-sm">{order.order_number}</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.pillClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
            {st.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(order.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {order.items_count} {order.items_count === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5">
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
          <p className="text-base font-black text-[#F59E0B]">
            Kz {formatCurrency(order.total)}
          </p>
        </div>
        <button
          onClick={onView}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#F59E0B] hover:text-[#F59E0B] text-gray-400 flex items-center justify-center transition-all group-hover:shadow-sm cursor-pointer"
          aria-label="Ver detalhes"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({
  order,
  onClose,
}: {
  order: CustomerOrder;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<CustomerOrder>(order);
  const [loading, setLoading] = useState(!order.items);

  // Fetch full details if items not already loaded
  useEffect(() => {
    if (order.items) return;
    setLoading(true);
    customerService
      .getOrderDetails(order.id)
      .then((data) => setDetails(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order.id, order.items]);

  const st = getStatus(details.status);
  const payment = getPayment(details.payment_method);
  const PaymentIcon = payment?.icon ?? CreditCard;

  const statusSteps: Array<{ key: string; label: string; icon: React.ElementType }> = [
    { key: 'pending', label: 'Pendente', icon: Clock },
    { key: 'paid', label: 'Pago', icon: CheckCircle2 },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregue', icon: Home },
  ];
  const isCancelled = details.status === 'cancelled';
  const currentStepIndex = isCancelled
    ? -1
    : statusSteps.findIndex((s) => s.key === details.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              Detalhes do Pedido
            </p>
            <h3 className="text-base font-black text-gray-900">{details.order_number}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
            </div>
          ) : (
            <>
              {/* Status pill */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.pillClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                  {st.label}
                </span>
                <span className="text-xs text-gray-400">{formatDate(details.created_at)}</span>
              </div>

              {/* Progress tracker (hide if cancelled) */}
              {!isCancelled && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between relative">
                    {/* connecting line */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 mx-8 z-0" />
                    <div
                      className="absolute left-0 top-4 h-0.5 bg-[#F59E0B] z-0 transition-all duration-500"
                      style={{
                        marginLeft: '2rem',
                        width: `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 4rem)`,
                      }}
                    />
                    {statusSteps.map((step, i) => {
                      const done = i <= currentStepIndex;
                      const StepIcon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1 z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              done
                                ? 'bg-[#F59E0B] border-[#F59E0B] text-white'
                                : 'bg-white border-gray-200 text-gray-300'
                            }`}
                          >
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[9px] font-bold text-center leading-tight ${
                              done ? 'text-[#F59E0B]' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Itens
                  </p>
                  <p className="text-lg font-black text-gray-800">{details.items_count}</p>
                  <p className="text-[10px] text-gray-400">
                    produto{details.items_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-[#F59E0B]/5 rounded-xl p-3 border border-[#F59E0B]/10">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="text-lg font-black text-[#F59E0B]">
                    Kz {formatCurrency(details.total)}
                  </p>
                </div>
              </div>

              {/* Payment method */}
              {payment && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                    Método de Pagamento
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <PaymentIcon className={`w-4 h-4 ${payment.color}`} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">{payment.label}</p>
                  </div>
                </div>
              )}

              {/* Products */}
              {details.items && details.items.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-3">
                    Produtos ({details.items.length})
                  </p>
                  <div className="space-y-2">
                    {details.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        {/* Image */}
                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.quantity}× Kz {formatCurrency(item.price)}
                          </p>
                        </div>

                        {/* Line total */}
                        <p className="text-sm font-black text-gray-800 flex-shrink-0">
                          Kz {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order total footer */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Total do pedido</span>
                    <span className="text-base font-black text-[#F59E0B]">
                      Kz {formatCurrency(details.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* No items fallback */}
              {(!details.items || details.items.length === 0) && !loading && (
                <div className="text-center py-4">
                  <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Detalhes dos produtos não disponíveis</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#1E3A5F] text-white font-bold text-sm hover:bg-[#162d4a] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Fechar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await customerService.getOrders({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
      });
      setOrders(response?.results || []);
      setTotalItems(response?.count || 0);
      setTotalPages(Math.ceil((response?.count || 0) / ITEMS_PER_PAGE));
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (_: string, __: string) => {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      return true;
    } catch {
      return false;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <CustomerLayout
      title="Meus Pedidos"
      subtitle="Acompanhe o status de todos os seus pedidos"
      menuItems={menuItems}
      activeItem="orders"
      toast={toast}
      setToast={setToast}
      onChangePassword={handleChangePassword}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#F59E0B]/20 border-t-[#F59E0B] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-4 h-4 text-[#F59E0B]" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">A carregar pedidos…</p>
          </div>
        ) : orders.length > 0 ? (
          <>
            {/* Column headers — desktop only */}
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
              <div className="w-10 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Pedido
                </p>
              </div>
              <div className="w-32 text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Total
                </p>
              </div>
              <div className="w-9" />
            </div>

            <div>
              {orders.map((order, i) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  index={i}
                  onView={() => setSelectedOrder(order)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 sm:px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400 font-semibold">
                  {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de{' '}
                  {totalItems} pedidos
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-[#F59E0B] text-white shadow-sm'
                            : 'border border-gray-200 bg-white text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
              <Package className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1.5">Nenhum pedido ainda</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Você ainda não realizou nenhuma compra. Comece a explorar os nossos produtos!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-white rounded-xl font-bold text-sm hover:bg-[#D97706] transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Começar a comprar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
}