import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Package,
  Calendar,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { companyService, CompanyStats } from '../../services/company';
import { formatCurrency } from '../../utils/currency';

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats>({
    total_sales: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    recent_orders: [],
    top_products: [],
    sales_by_day: []
  });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    loadDashboardData();
    
    // Monitorar resize da janela para atualizar os gráficos
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await companyService.getDashboardData();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular tendências baseadas nos dados reais
  const getTrend = () => {
    const sales_by_day = stats.sales_by_day;
    if (sales_by_day.length < 2) return { value: '0%', isUp: true };
    
    const currentWeek = sales_by_day.slice(-7);
    const previousWeek = sales_by_day.slice(-14, -7);
    
    const currentTotal = currentWeek.reduce((sum, day) => sum + day.total, 0);
    const previousTotal = previousWeek.reduce((sum, day) => sum + day.total, 0);
    
    if (previousTotal === 0) return { value: '+100%', isUp: true };
    const change = ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      isUp: change > 0
    };
  };

  const trend = getTrend();

  const statCards = [
    { 
      label: 'Receita Total', 
      value: formatCurrency(stats.total_sales), 
      icon: DollarSign, 
      color: 'bg-emerald-500',
      trend: trend
    },
    { 
      label: 'Pedidos', 
      value: stats.total_orders.toString(), 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      trend: trend
    },
    { 
      label: 'Produtos', 
      value: stats.total_products.toString(), 
      icon: Package, 
      color: 'bg-primary',
      trend: { value: '0%', isUp: true }
    },
    { 
      label: 'Clientes', 
      value: stats.total_customers.toString(), 
      icon: Users, 
      color: 'bg-orange-500',
      trend: trend
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'paid': 'bg-emerald-100 text-emerald-600',
      'pending': 'bg-orange-100 text-orange-600',
      'shipped': 'bg-blue-100 text-blue-600',
      'delivered': 'bg-green-100 text-green-600',
      'cancelled': 'bg-red-100 text-red-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg">
          <p className="text-xs font-bold text-gray-400 mb-1">
            {new Date(label).toLocaleDateString('pt-PT', { 
              day: '2-digit', 
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm font-black text-primary">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-[10px] text-emerald-500 font-bold">
            {payload[0].payload.orders_count} {payload[0].payload.orders_count === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Verificar se há dados para os gráficos
  const hasSalesData = stats.sales_by_day && stats.sales_by_day.length > 0;
  const hasOrdersData = stats.sales_by_day && stats.sales_by_day.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Painel de Controle</h1>
          <p className="text-sm text-gray-400">Visão geral das vendas e desempenho da loja.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend.value}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de Vendas Principal - com verificação de dados */}
      {hasSalesData && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-black text-gray-800">Faturamento Diário</h2>
              <p className="text-xs text-gray-400">Desempenho financeiro dos últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
              <Calendar className="w-3 h-3" />
              Última semana
            </div>
          </div>
          
          {/* Container com altura e largura definidas */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sales_by_day}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }}
                  tickFormatter={(str) => new Date(str).toLocaleDateString('pt-PT', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#1e3a8a" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1500}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de Barras - com verificação de dados */}
      {hasOrdersData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="font-black text-gray-800 mb-6 text-sm">Volume de Pedidos</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sales_by_day}>
                  <Bar 
                    dataKey="orders_count" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]} 
                    barSize={Math.max(20, Math.min(50, windowWidth / 15))}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#9ca3af' }}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('pt-PT', { 
                      weekday: 'short' 
                    })}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ 
                      borderRadius: '10px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                    }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-6">Produtos Mais Vendidos</h2>
            <div className="space-y-4">
              {stats.top_products.length > 0 ? (
                stats.top_products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-400">{product.total_sold} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-black text-primary">
                        {formatCurrency(product.total_revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum produto vendido ainda</p>
                </div>
              )}
            </div>
            <Link 
              to="/store-admin/products" 
              className="w-full mt-6 py-3 border-2 border-dashed border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-primary hover:text-primary transition-all text-center block"
            >
              Ver Todos Produtos
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-black text-gray-800">Pedidos Recentes</h2>
          <Link to="/store-admin/orders" className="text-xs font-bold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recent_orders.length > 0 ? (
                stats.recent_orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-800 line-clamp-1">{order.customer_name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/store-admin/orders`}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="font-bold">Nenhum pedido encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}