import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Building2,
  Eye,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ordersService, Order, OrderStats } from '../../services/orders';
import { companiesService } from '../../services/companies';
import { productsService } from '../../services/products';
import { getCurrentUser } from '../../services/auth';

interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  paidOrders: number;
  pendingOrders: number;
  revenueTrend: number;
  productsTrend: number;
  paidTrend: number;
  pendingTrend: number;
  totalCompanies: number;
  activeCompanies: number;
}

interface TopCompany {
  id: number;
  name: string;
  logo?: string;
  sales: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProducts: 0,
    paidOrders: 0,
    pendingOrders: 0,
    revenueTrend: 0,
    productsTrend: 0,
    paidTrend: 0,
    pendingTrend: 0,
    totalCompanies: 0,
    activeCompanies: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getCurrentUser();

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [orderStats, ordersResponse, productStats, companiesResponse] =
        await Promise.all([
          ordersService.getStats(),
          ordersService.list({ page_size: 10 }),
          productsService.getStats(),
          companiesService.list(),
        ]);

      setRecentOrders(ordersResponse.results.slice(0, 5));

      const companies = companiesResponse;

      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const firstDayOfLastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const lastDayOfLastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );

      const allOrdersResponse = await ordersService.list({ page_size: 1000 });
      const allOrders = allOrdersResponse.results;

      // Receita total: soma de TODOS os pedidos com status 'paid'
      const totalRevenue = allOrders
        .filter((order) => order.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      const monthlyOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.date);
        return orderDate >= firstDayOfMonth;
      });

      const lastMonthOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.date);
        return (
          orderDate >= firstDayOfLastMonth && orderDate <= lastDayOfLastMonth
        );
      });

      // Tendência de receita: compara pagos do mês atual vs mês anterior
      const monthlyRevenue = monthlyOrders
        .filter((o) => o.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      const lastMonthRevenue = lastMonthOrders
        .filter((o) => o.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      const revenueTrend =
        lastMonthRevenue > 0
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : monthlyRevenue > 0
          ? 100
          : 0;

      const monthlyPaid = monthlyOrders.filter(
        (o) => o.status === 'paid'
      ).length;
      const lastMonthPaid = lastMonthOrders.filter(
        (o) => o.status === 'paid'
      ).length;
      const paidTrend =
        lastMonthPaid > 0
          ? ((monthlyPaid - lastMonthPaid) / lastMonthPaid) * 100
          : monthlyPaid > 0
          ? 100
          : 0;

      const monthlyPending = monthlyOrders.filter(
        (o) => o.status === 'pending'
      ).length;
      const lastMonthPending = lastMonthOrders.filter(
        (o) => o.status === 'pending'
      ).length;
      const pendingTrend =
        lastMonthPending > 0
          ? ((monthlyPending - lastMonthPending) / lastMonthPending) * 100
          : monthlyPending > 0
          ? 100
          : 0;

      const companySales: Record<
        number,
        { revenue: number; sales: number; name: string; logo?: string }
      > = {};

      allOrders.forEach((order) => {
        if (order.company_id) {
          if (!companySales[order.company_id]) {
            companySales[order.company_id] = {
              revenue: 0,
              sales: 0,
              name: order.company || 'Empresa',
              logo: undefined,
            };
          }
          companySales[order.company_id].revenue += Number(order.total || 0);
          companySales[order.company_id].sales += 1;
        }
      });

      const companiesMap = new Map(companies.map((c) => [c.id, c]));

      const topCompaniesList = Object.entries(companySales)
        .map(([id, data]) => ({
          id: Number(id),
          name: companiesMap.get(Number(id))?.company_name || data.name,
          logo: companiesMap.get(Number(id))?.logo,
          sales: data.sales,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopCompanies(topCompaniesList);

      setStats({
        totalRevenue,
        totalProducts: productStats.total_products || 0,
        paidOrders: orderStats.paid || 0,
        pendingOrders: orderStats.pending || 0,
        revenueTrend,
        productsTrend: 0,
        paidTrend,
        pendingTrend,
        totalCompanies: companies.length,
        activeCompanies: companies.filter((c) => c.status === 'active').length,
      });
    } catch {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (value: number) =>
    `Kz ${value.toLocaleString()}`;

  const formatNumber = (value: number) => value.toLocaleString();

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { label: string; bgColor: string; textColor: string }
    > = {
      paid: {
        label: 'Pago',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-600',
      },
      pending: {
        label: 'Pendente',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
      },
      shipped: {
        label: 'Enviado',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
      },
      delivered: {
        label: 'Entregue',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
      },
      cancelled: {
        label: 'Cancelado',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
      },
    };
    return configs[status] || configs['pending'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoje, ${date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    if (diffDays === 1) {
      return `Ontem, ${date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-PT');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-bold mb-2">Erro ao carregar dados</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      label: 'Dinheiro Arrecadado',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: formatTrend(stats.revenueTrend),
      isUp: stats.revenueTrend >= 0,
    },
    {
      label: 'Produtos no Sistema',
      value: formatNumber(stats.totalProducts),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: formatTrend(stats.productsTrend),
      isUp: stats.productsTrend >= 0,
    },
    {
      label: 'Compras Pagas',
      value: formatNumber(stats.paidOrders),
      icon: CheckCircle2,
      color: 'bg-primary',
      trend: formatTrend(stats.paidTrend),
      isUp: stats.paidTrend >= 0,
    },
    {
      label: 'Compras Pendentes',
      value: formatNumber(stats.pendingOrders),
      icon: Clock,
      color: 'bg-orange-500',
      trend: formatTrend(stats.pendingTrend),
      isUp: stats.pendingTrend >= 0,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Bem-vindo de volta, {user?.username}! Aqui está o resumo da plataforma.
          </p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm self-start sm:self-auto">
          <p className="text-xs text-gray-400">Empresas Ativas</p>
          <p className="text-lg font-black text-primary">
            {stats.activeCompanies} / {stats.totalCompanies}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-1">
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
              >
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div
                className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-bold ${
                  stat.isUp ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {stat.isUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span className="whitespace-nowrap">{stat.trend}</span>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-tight">
              {stat.label}
            </p>
            <h3 className="text-base sm:text-2xl font-black text-gray-800 truncate">
              {stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Orders + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-800">Pedidos Recentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Últimos 5 pedidos da plataforma
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-4"
            >
              Ver todos
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">ID Pedido</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Empresa</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => {
                      const status = getStatusConfig(order.status);
                      return (
                        <tr
                          key={order.id}
                          className="text-sm hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 text-gray-500 max-w-[140px] truncate">
                            {order.customer_info?.full_name ||
                              order.customer ||
                              'Cliente'}
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {order.company || 'Loja Geral'}
                          </td>
                          <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                            Kz {Number(order.total || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${status.bgColor} ${status.textColor}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const status = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="px-4 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {order.order_number}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${status.bgColor} ${status.textColor}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {order.customer_info?.full_name ||
                          order.customer ||
                          'Cliente'}{' '}
                        · {order.company || 'Loja Geral'}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="font-black text-primary text-sm">
                          Kz {Number(order.total || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div>
              <h2 className="font-black text-gray-800">Top Empresas</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Maiores vendedores do mês
              </p>
            </div>
            <Link
              to="/admin/companies"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-4"
            >
              Ver todas
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {topCompanies.length > 0 ? (
            <div className="space-y-3">
              {topCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-xl transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs sm:text-sm">
                          {getInitials(company.name)}
                        </div>
                      )}
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">
                            1
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors truncate">
                        {company.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {company.sales}{' '}
                        {company.sales === 1 ? 'venda' : 'vendas'} este mês
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-primary whitespace-nowrap">
                      {formatCurrency(company.revenue)}
                    </p>
                    <Link
                      to={`/admin/companies/${company.id}`}
                      className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors"
                    >
                      Ver relatório
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold">Nenhuma venda</p>
              <p className="text-xs text-gray-300 mt-1">
                Aguardando primeiras vendas
              </p>
            </div>
          )}

          <Link
            to="/admin/companies"
            className="w-full mt-6 py-3 border-2 border-dashed border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver Todas Empresas
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {[
          {
            to: '/admin/companies/new',
            from: 'from-primary',
            to_color: 'to-primary/80',
            icon: Building2,
            title: 'Nova Empresa',
            desc: 'Cadastrar nova loja na plataforma',
          },
          {
            to: '/admin/products/new',
            from: 'from-blue-500',
            to_color: 'to-blue-400',
            icon: ShoppingBag,
            title: 'Novo Produto',
            desc: 'Adicionar produto ao catálogo',
          },
          {
            to: '/admin/categories/new',
            from: 'from-purple-500',
            to_color: 'to-purple-400',
            icon: TrendingUp,
            title: 'Nova Categoria',
            desc: 'Organizar produtos por categorias',
          },
          {
            to: '/admin/banners/new',
            from: 'from-orange-500',
            to_color: 'to-orange-400',
            icon: Eye,
            title: 'Novo Banner',
            desc: 'Adicionar banner à página inicial',
          },
        ].map(({ to, from, to_color, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className={`bg-gradient-to-r ${from} ${to_color} text-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group`}
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 opacity-80 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-sm sm:text-lg mb-0.5 sm:mb-1 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-white/80 hidden sm:block">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}