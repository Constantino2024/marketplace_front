import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  adminCustomersService,
  AdminCustomer,
  CustomerFilters,
  CustomerStats,
} from '../../services/adminCustomers';

// ─── Toast ────────────────────────────────────────────────────────────────────
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
    exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 max-w-sm ${
      type === 'success'
        ? 'bg-emerald-500'
        : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
    ) : (
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
    )}
    <p className="font-bold flex-1 text-sm">{message}</p>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity ml-2">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// ─── Customer Details Modal ───────────────────────────────────────────────────
const CustomerDetailsModal = ({
  customer,
  onClose,
  isOpen,
}: {
  customer: AdminCustomer | null;
  onClose: () => void;
  isOpen: boolean;
}) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
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

  const initials = (customer.full_name || customer.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col rounded-t-2xl"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-gray-800 truncate">
              {customer.full_name || customer.username || 'Cliente'}
            </h2>
            <p className="text-xs text-gray-400">@{customer.username}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/5 p-3 sm:p-4 rounded-xl text-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xl sm:text-2xl font-black text-gray-800">
                {customer.orders_count || 0}
              </p>
              <p className="text-[10px] text-gray-400">Pedidos</p>
            </div>
            <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl text-center col-span-2 sm:col-span-1">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-base sm:text-xl font-black text-gray-800 truncate">
                Kz {(customer.total_spent || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Total Gasto</p>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl text-center col-span-3 sm:col-span-1">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1.5" />
              <p className="text-sm font-black text-gray-800">
                {formatDate(customer.date_joined)}
              </p>
              <p className="text-[10px] text-gray-400">Desde</p>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={customer.email} />
              <InfoRow icon={<Phone className="w-4 h-4 text-primary" />} label="Telefone" value={customer.phone || 'Não informado'} />
              <InfoRow
                icon={<MapPin className="w-4 h-4 text-primary" />}
                label="Endereço"
                value={
                  customer.address
                    ? `${customer.address}${customer.city ? `, ${customer.city}` : ''}`
                    : 'Não informado'
                }
              />
              {customer.birth_date && (
                <InfoRow
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                  label="Data de Nascimento"
                  value={formatDate(customer.birth_date)}
                />
              )}
              {customer.tax_id && (
                <InfoRow
                  icon={<span className="w-4 h-4 text-primary font-black text-[10px] flex items-center">NIF</span>}
                  label="NIF / BI"
                  value={customer.tax_id}
                />
              )}
            </div>
          </div>

          {/* Status da Conta */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
              Status da Conta
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conta ativa</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  customer.is_active
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {customer.is_active ? 'Sim' : 'Não'}
              </span>
            </div>
            {customer.last_login && (
              <p className="text-xs text-gray-400 mt-2">
                Último acesso: {formatDateTime(customer.last_login)}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all text-sm"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Info Row helper ──────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

// ─── Stats Card helper ────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider leading-tight">
        {label}
      </p>
      <h3 className="text-lg sm:text-2xl font-black text-gray-800 truncate">{value}</h3>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    active_today: 0,
    new_this_month: 0,
    top_cities: [],
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: CustomerFilters = {
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        ...filters,
      };

      const response = await adminCustomersService.list(params);

      const customersList = response.results ?? response;
      const totalCount = response.count ?? (Array.isArray(customersList) ? customersList.length : 0);

      setCustomers(Array.isArray(customersList) ? customersList : []);
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

      try {
        const statsData = await adminCustomersService.getStats();
        setStats(statsData);
      } catch {
        // stats são secundárias, falha silenciosa aceitável
      }
    } catch {
      showToast('Erro ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const topCity =
    stats.top_cities && stats.top_cities.length > 0 ? stats.top_cities[0] : null;

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gerencie todos os clientes registados na plataforma.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Lista
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Total de Clientes"
          value={stats.total_customers}
        />
        <StatCard
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          label="Ativos Hoje"
          value={stats.active_today}
        />
        <StatCard
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
          label="Novos este Mês"
          value={stats.new_this_month}
        />
        <StatCard
          icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          label="Principal Cidade"
          value={topCity?.city ?? 'Luanda'}
          sub={topCity ? `${topCity.count} clientes` : undefined}
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, telefone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Luanda"
                    value={filters.city || ''}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Registro de
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Registro até
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => {
                    setFilters({});
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadCustomers();
                  }}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
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
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">Localização</th>
                    <th className="px-6 py-4">Registro</th>
                    <th className="px-6 py-4">Pedidos</th>
                    <th className="px-6 py-4">Total Gasto</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="text-sm hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                            {(customer.full_name || customer.username || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate max-w-[140px]">
                              {customer.full_name || customer.username}
                            </p>
                            <p className="text-xs text-gray-400">@{customer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 truncate max-w-[160px]">
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={customer.city ? 'text-gray-600' : 'text-gray-400'}>
                          {customer.city || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {formatDate(customer.date_joined)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">
                        {customer.orders_count || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                        Kz {(customer.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            customer.is_active
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {customer.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                        <p className="font-bold">Nenhum cliente encontrado</p>
                        <p className="text-sm mt-1">
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
              {customers.length === 0 ? (
                <div className="px-4 py-16 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                  <p className="font-bold">Nenhum cliente encontrado</p>
                  <p className="text-sm mt-1">
                    Tente ajustar os filtros ou realizar uma nova busca.
                  </p>
                </div>
              ) : (
                customers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                        {(customer.full_name || customer.username || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">
                              {customer.full_name || customer.username}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${
                              customer.is_active
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {customer.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {customer.city && <span>{customer.city}</span>}
                            <span>{customer.orders_count || 0} pedidos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-primary text-sm">
                              Kz {(customer.total_spent || 0).toLocaleString()}
                            </span>
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500 font-bold">
                  Mostrando{' '}
                  <span className="text-gray-800">{startIndex + 1}</span> a{' '}
                  <span className="text-gray-800">
                    {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                  </span>{' '}
                  de <span className="text-gray-800">{totalItems}</span> clientes
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white shadow-md shadow-primary/20'
                              : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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
    </div>
  );
}