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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminCustomersService, AdminCustomer, CustomerFilters, CustomerStats } from '../../services/adminCustomers';

// Componente de Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
     type === 'error' ? <AlertCircle className="w-5 h-5" /> :
     <AlertCircle className="w-5 h-5" />}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <X className="w-5 h-5" />
    </button>
  </motion.div>
);



// Modal de detalhes do cliente
const CustomerDetailsModal = ({ 
  customer, 
  onClose,
  isOpen 
}: { 
  customer: AdminCustomer | null; 
  onClose: () => void;
  isOpen: boolean;
}) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">{customer.full_name || 'Cliente'}</h2>
              <p className="text-sm text-white/80">@{customer.username}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/5 p-4 rounded-xl text-center">
              <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{customer.orders_count || 0}</p>
              <p className="text-xs text-gray-400">Pedidos</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">
                Kz {(customer.total_spent || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Total Gasto</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-black text-gray-800">
                {formatDate(customer.date_joined)}
              </p>
              <p className="text-xs text-gray-400">Desde</p>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Informações Pessoais</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="text-sm font-medium text-gray-800">{customer.phone || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-gray-400">Endereço</p>
                  <p className="text-sm font-medium text-gray-800">
                    {customer.address ? `${customer.address}${customer.city ? `, ${customer.city}` : ''}` : 'Não informado'}
                  </p>
                </div>
              </div>

              {customer.birth_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-gray-400">Data de Nascimento</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(customer.birth_date)}
                    </p>
                  </div>
                </div>
              )}

              {customer.tax_id && (
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-primary mt-1 font-bold text-xs">NIF</span>
                  <div>
                    <p className="text-xs text-gray-400">NIF / BI</p>
                    <p className="text-sm font-medium text-gray-800">{customer.tax_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status da Conta */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Status da Conta</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conta ativa</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                customer.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}>
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    active_today: 0,
    new_this_month: 0,
    top_cities: []
  });

  // Carregar clientes
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: CustomerFilters = {
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        ...filters
      };

      console.log('Chamando API com params:', params);
      const response = await adminCustomersService.list(params);
      console.log('Resposta da API processada:', response);
      
      // Garantir que estamos acessando os dados corretamente
      const customersList = response.results || response;
      const totalCount = response.count || (Array.isArray(customersList) ? customersList.length : 0);
      
      setCustomers(Array.isArray(customersList) ? customersList : []);
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

      try {
        const statsData = await adminCustomersService.getStats();
        console.log('Estatísticas:', statsData);
        setStats(statsData);
      } catch (statsError) {
        console.error('Erro ao carregar estatísticas:', statsError);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setToast({
        message: 'Erro ao carregar clientes',
        type: 'error'
      });
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
    <div className="space-y-8">
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

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-400">Gerencie todos os clientes registados na plataforma.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar Lista
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total de Clientes</p>
              <h3 className="text-2xl font-black text-gray-800">{stats.total_customers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Ativos Hoje</p>
              <h3 className="text-2xl font-black text-gray-800">{stats.active_today}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Novos este mês</p>
              <h3 className="text-2xl font-black text-gray-800">{stats.new_this_month}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Principal Cidade</p>
              <h3 className="text-2xl font-black text-gray-800">
                {stats.top_cities && stats.top_cities.length > 0 
                  ? stats.top_cities[0].city 
                  : 'Luanda'}
              </h3>
              {stats.top_cities && stats.top_cities.length > 0 && (
                <p className="text-[10px] text-gray-400">{stats.top_cities[0].count} clientes</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
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
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </button>
        </div>

        {/* Filtros Expandidos */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Cidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Luanda"
                    value={filters.city || ''}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data de Registro (de)</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data de Registro (até)</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setFilters({});
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    loadCustomers();
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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
                    <tr key={customer.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                            {customer.full_name?.charAt(0) || customer.username?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{customer.full_name || customer.username}</p>
                            <p className="text-xs text-gray-400">@{customer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-xs text-gray-400">{customer.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.city ? (
                          <span className="text-gray-600">{customer.city}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(customer.date_joined)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">
                        {customer.orders_count || 0}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        Kz {(customer.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          customer.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {customer.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-bold">Nenhum cliente encontrado</p>
                        <p className="text-sm mt-2">Tente ajustar os filtros ou realizar uma nova busca.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 font-bold">
                  Mostrando <span className="text-gray-800">{startIndex + 1}</span> a <span className="text-gray-800">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> de <span className="text-gray-800">{totalItems}</span> clientes
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-bold text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>

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