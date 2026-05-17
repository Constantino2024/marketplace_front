import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  Truck,
  Home,
  Smartphone,
  Landmark,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ordersService, Order, OrderStats } from '../../services/orders';
import { getCurrentUser } from '../../services/auth';
import { reportsService } from '../../services/reports';

// Componente de Toast
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 ${
      type === 'success'
        ? 'bg-emerald-500'
        : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    )}
    <p className="font-bold">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Componente de confirmação
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-black text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ITEMS_PER_PAGE = 8;

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    paid: 0,
    pending: 0,
    cancelled: 0,
    shipped: 0,
    delivered: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  const user = getCurrentUser();
  const isAdmin = user?.is_admin;
  const isCompany = user?.is_company;

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'express':
        return <Smartphone className="w-4 h-4" />;
      case 'reference':
        return <Landmark className="w-4 h-4" />;
      case 'ekwanza':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'express':
        return 'Multicaixa Express';
      case 'reference':
        return 'Referência Multicaixa';
      case 'ekwanza':
        return 'E-Kwanza';
      default:
        return method || 'Não informado';
    }
  };

  const handlePrintReport = async () => {
    if (orders.length === 0) {
      showToast('Não há pedidos para imprimir', 'error');
      return;
    }
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (companyFilter && companyFilter !== 'all') filters.company = companyFilter;
      await ordersService.downloadReport(filters);
      showToast('Relatório PDF gerado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar relatório', 'error');
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('Não há pedidos para exportar', 'error');
      return;
    }
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (companyFilter && companyFilter !== 'all') filters.company = companyFilter;
    reportsService.generateCSV(orders, filters);
    showToast('Arquivo CSV exportado com sucesso!', 'success');
  };

  const handlePrintInvoice = async (order: Order) => {
    try {
      await ordersService.downloadInvoice(order.id);
      showToast('Fatura gerada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar fatura', 'error');
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (companyFilter && isAdmin) params.company = companyFilter;

      let response;
      if (isAdmin) {
        response = await ordersService.list(params);
        try {
          const statsData = await ordersService.getStats();
          setStats(statsData);
        } catch (statsError) {
          console.error('Erro ao carregar estatísticas:', statsError);
        }
      } else if (isCompany) {
        response = await ordersService.listCompanyOrders(params);
      } else {
        response = await ordersService.listCustomerOrders(params);
      }

      if (response && response.results) {
        setOrders(response.results);
        setTotalItems(response.count);
        setTotalPages(Math.ceil(response.count / ITEMS_PER_PAGE));
      } else {
        setOrders([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showToast('Erro ao carregar pedidos', 'error');
      setOrders([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter, companyFilter]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; icon: any; label: string; bgColor: string }
    > = {
      paid: {
        color: 'text-emerald-600',
        icon: CheckCircle2,
        label: 'Pago',
        bgColor: 'bg-emerald-100',
      },
      pending: {
        color: 'text-orange-600',
        icon: Clock,
        label: 'Pendente',
        bgColor: 'bg-orange-100',
      },
      cancelled: {
        color: 'text-red-600',
        icon: XCircle,
        label: 'Cancelado',
        bgColor: 'bg-red-100',
      },
      shipped: {
        color: 'text-blue-600',
        icon: Truck,
        label: 'Enviado',
        bgColor: 'bg-blue-100',
      },
      delivered: {
        color: 'text-green-600',
        icon: Home,
        label: 'Entregue',
        bgColor: 'bg-green-100',
      },
    };
    return configs[status] || configs['pending'];
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      showToast('Status atualizado com sucesso!', 'success');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await ordersService.updateStatus(orderToCancel.id, 'cancelled');
      showToast('Pedido cancelado com sucesso!', 'success');
      loadOrders();
      if (selectedOrder?.id === orderToCancel.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      showToast('Erro ao cancelar pedido', 'error');
    } finally {
      setOrderToCancel(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleCancelOrder}
        title="Cancelar Pedido"
        message={`Tem certeza que deseja cancelar o pedido ${orderToCancel?.order_number}? Esta ação não pode ser desfeita.`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">
            Gestão de Pedidos
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Acompanhe e gerencie todos os pedidos realizados.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handlePrintReport}
            disabled={orders.length === 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Relatório PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Summary — apenas para admin */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: 'Pagos',
              value: stats.paid,
              icon: CheckCircle2,
              color: 'text-emerald-500',
              bg: 'bg-emerald-100',
            },
            {
              label: 'Pendentes',
              value: stats.pending,
              icon: Clock,
              color: 'text-orange-500',
              bg: 'bg-orange-100',
            },
            {
              label: 'Enviados',
              value: stats.shipped,
              icon: Truck,
              color: 'text-blue-500',
              bg: 'bg-blue-100',
            },
            {
              label: 'Entregues',
              value: stats.delivered,
              icon: Home,
              color: 'text-green-500',
              bg: 'bg-green-100',
            },
            {
              label: 'Cancelados',
              value: stats.cancelled,
              icon: XCircle,
              color: 'text-red-500',
              bg: 'bg-red-100',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {label}
                </p>
                <h3 className="text-lg sm:text-xl font-black text-gray-800">
                  {value || 0}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por ID, cliente ou empresa..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {isAdmin && (
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Todas as empresas</option>
              <option value="global">Loja Geral</option>
            </select>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">ID Pedido</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Empresa</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const status = getStatusConfig(order.status);
                    const StatusIcon = status.icon;
                    const customerInfo = order.customer_info || {
                      full_name: order.customer || 'Cliente',
                      email: order.email || '',
                      phone: order.phone || '',
                      address: order.address || '',
                    };

                    return (
                      <tr
                        key={order.id}
                        className="text-sm hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {customerInfo.full_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {customerInfo.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {order.company || 'Loja Geral'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-primary whitespace-nowrap">
                            Kz {order.total?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${status.bgColor} ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
                              title="Ver Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isAdmin &&
                              order.status !== 'cancelled' &&
                              order.status !== 'delivered' && (
                                <>
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(order.id, 'paid')
                                      }
                                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Marcar como Pago"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {order.status === 'paid' && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(order.id, 'shipped')
                                      }
                                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Marcar como Enviado"
                                    >
                                      <Truck className="w-4 h-4" />
                                    </button>
                                  )}
                                  {order.status === 'shipped' && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(
                                          order.id,
                                          'delivered'
                                        )
                                      }
                                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Marcar como Entregue"
                                    >
                                      <Home className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setOrderToCancel(order);
                                      setShowConfirmModal(true);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancelar Pedido"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-bold">Nenhum pedido encontrado</p>
                        <p className="text-sm mt-2">
                          Tente ajustar os filtros ou realizar uma nova busca.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {orders.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-bold">Nenhum pedido encontrado</p>
                  <p className="text-sm mt-2">
                    Tente ajustar os filtros ou realizar uma nova busca.
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  const status = getStatusConfig(order.status);
                  const StatusIcon = status.icon;
                  const customerInfo = order.customer_info || {
                    full_name: order.customer || 'Cliente',
                    email: order.email || '',
                  };

                  return (
                    <div key={order.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {customerInfo.full_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 flex-shrink-0 ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="font-black text-primary text-sm mt-0.5">
                            Kz {order.total?.toLocaleString() || 0}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isAdmin &&
                            order.status !== 'cancelled' &&
                            order.status !== 'delivered' && (
                              <>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(order.id, 'paid')
                                    }
                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Marcar como Pago"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === 'paid' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(order.id, 'shipped')
                                    }
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Marcar como Enviado"
                                  >
                                    <Truck className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === 'shipped' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(order.id, 'delivered')
                                    }
                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Marcar como Entregue"
                                  >
                                    <Home className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setOrderToCancel(order);
                                    setShowConfirmModal(true);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancelar Pedido"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500 font-bold text-center sm:text-left">
                  Mostrando{' '}
                  <span className="text-gray-800">{startIndex + 1}</span> a{' '}
                  <span className="text-gray-800">
                    {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                  </span>{' '}
                  de <span className="text-gray-800">{totalItems}</span>{' '}
                  pedidos
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col rounded-t-2xl"
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-gray-800 truncate">
                    Pedido {selectedOrder.order_number}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase flex-shrink-0 ${
                      getStatusConfig(selectedOrder.status).bgColor
                    } ${getStatusConfig(selectedOrder.status).color}`}
                  >
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {formatDate(selectedOrder.created_at)}
                  </span>
                  <span className="font-bold text-primary">
                    Kz {Number(selectedOrder.total || 0).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-black text-gray-400 uppercase">
                        Cliente
                      </h3>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-medium text-gray-800">
                        {selectedOrder.customer_info?.full_name ||
                          selectedOrder.customer ||
                          'Cliente'}
                      </p>
                      <p className="text-gray-500 text-xs break-all">
                        {selectedOrder.customer_info?.email ||
                          selectedOrder.email ||
                          '—'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {selectedOrder.customer_info?.phone ||
                          selectedOrder.phone ||
                          '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-black text-gray-400 uppercase">
                        Entrega
                      </h3>
                    </div>
                    <p className="text-gray-600 text-xs break-words">
                      {selectedOrder.customer_info?.address ||
                        selectedOrder.address ||
                        '—'}
                      {selectedOrder.customer_info?.city &&
                        `, ${selectedOrder.customer_info.city}`}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black text-gray-400 uppercase">
                      Pagamento
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(
                      selectedOrder.customer_info?.payment_method ||
                        selectedOrder.payment_method
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {getPaymentMethodName(
                        selectedOrder.customer_info?.payment_method ||
                          selectedOrder.payment_method
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black text-gray-400 uppercase">
                      Itens ({selectedOrder.items?.length || 0})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => {
                        const quantity = Number(item.quantity) || 0;
                        const price = Number(item.price) || 0;
                        const itemTotal = quantity * price;

                        return (
                          <div
                            key={item.id || index}
                            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100"
                          >
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name || 'Produto'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 mb-1 truncate">
                                {item.product_name || 'Produto'}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                <span className="text-gray-400">
                                  {quantity}x
                                </span>
                                <span className="text-gray-400">
                                  Kz {price.toLocaleString()}
                                </span>
                                <span className="text-primary font-medium ml-auto">
                                  Kz {itemTotal.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          Nenhum item encontrado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    className="flex-1 py-2.5 sm:py-3 bg-white text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Fatura</span>
                  </button>

                  {isAdmin &&
                    selectedOrder.status !== 'cancelled' &&
                    selectedOrder.status !== 'delivered' && (
                      <button
                        onClick={() => {
                          setOrderToCancel(selectedOrder);
                          setShowConfirmModal(true);
                          setSelectedOrder(null);
                        }}
                        className="flex-1 py-2.5 sm:py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    )}

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-2.5 sm:py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}