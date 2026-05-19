import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Download, DollarSign,
  ShoppingBag, Loader2, AlertCircle, Package, Users,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { reportsService, SalesStats, MonthlySales } from '../../services/reports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const toDateParam = (d: string) => (d ? new Date(d) : undefined);

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, bgClass, growth, showGrowth,
}: {
  title: string; value: string; icon: React.ElementType;
  bgClass: string; growth?: number; showGrowth?: boolean;
}) {
  const isUp = (growth ?? 0) >= 0;
  const GrowthIcon = isUp ? TrendingUp : TrendingDown;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${bgClass} rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        {showGrowth && growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
            <GrowthIcon className="w-3 h-3" />
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
    </div>
  );
}

function GrowthBadge({ value }: { value: string }) {
  const isNeg = value.startsWith('-');
  const isZero = value === '+0%' || value === '0%';
  const Icon = isNeg ? TrendingDown : TrendingUp;
  const cls = isNeg
    ? 'bg-red-50 text-red-600 border-red-100'
    : isZero
    ? 'bg-gray-50 text-gray-500 border-gray-200'
    : 'bg-emerald-50 text-emerald-600 border-emerald-100';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls}`}>
      <Icon className="w-3 h-3" />
      {value}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StoreReports() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: toDateParam(filters.startDate),
        endDate: toDateParam(filters.endDate),
        status: filters.status || undefined,
      };
      const [s, m] = await Promise.all([
        reportsService.getSalesStats(params),
        reportsService.getMonthlySales(params),
      ]);
      setStats(s);
      setMonthly(m);
    } catch {
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (type: 'pdf' | 'csv') => {
    setExporting(type);
    try {
      const params = {
        startDate: toDateParam(filters.startDate),
        endDate: toDateParam(filters.endDate),
        status: filters.status || undefined,
      };
      type === 'pdf'
        ? await reportsService.exportPDF(params)
        : await reportsService.exportCSV(params);
    } catch {
      setError(`Erro ao exportar ${type.toUpperCase()}. Tente novamente.`);
    } finally {
      setExporting(null);
    }
  };

  const growth = stats?.growth_percentage ?? 0;
  const isGrowthUp = growth >= 0;
  const GrowthIcon = isGrowthUp ? TrendingUp : TrendingDown;

  const statsCards = [
    { title: 'Receita Total',    value: fmt(stats?.total_sales ?? 0),            icon: DollarSign,  bgClass: 'bg-emerald-500', showGrowth: true },
    { title: 'Total de Pedidos', value: String(stats?.total_orders ?? 0),        icon: ShoppingBag, bgClass: 'bg-orange-500'  },
    { title: 'Total Produtos',   value: String(stats?.total_products ?? 0),      icon: Package,     bgClass: 'bg-blue-500'    },
    { title: 'Total Clientes',   value: String(stats?.total_customers ?? 0),     icon: Users,       bgClass: 'bg-violet-500'  },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-orange-400" />
        </div>
      </div>
      <p className="text-sm text-gray-400 font-medium">A carregar dados…</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !stats) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-sm text-gray-600 font-medium">{error}</p>
      <button onClick={load} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">
        Tentar novamente
      </button>
    </div>
  );

  // ── Page ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-6 pb-6">

      {/* inline error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors">
            ✕
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">Relatórios de Vendas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Analise o desempenho financeiro da sua loja</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-orange-500 hover:border-orange-300 flex items-center justify-center transition-all flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {exporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>
        </div>
      </div>

      {/* ── Filters (collapsible on mobile) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setFiltersOpen(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 sm:hidden"
        >
          <span className="text-sm font-bold text-gray-600">Filtrar período</span>
          {filtersOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <div className={`${filtersOpen ? 'block' : 'hidden'} sm:block px-5 py-4 sm:py-5`}>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Data inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Data final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Estado</label>
              <select
                value={filters.status}
                onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              >
                <option value="">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            {(filters.startDate || filters.endDate || filters.status) && (
              <button
                onClick={() => setFilters({ startDate: '', endDate: '', status: '' })}
                className="px-4 py-2.5 text-xs font-bold text-orange-500 hover:text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all whitespace-nowrap"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Growth banner ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-orange-100 text-xs font-semibold mb-1">Crescimento mensal</p>
            <div className="flex items-center gap-2">
              <GrowthIcon className="w-6 h-6" />
              <span className="text-3xl sm:text-4xl font-black">{Math.abs(growth)}%</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-100 text-xs font-semibold mb-1">Período</p>
            <p className="font-bold text-sm">Este mês vs mês anterior</p>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((c, i) => (
          <StatCard key={i} {...c} growth={growth} />
        ))}
      </div>

      {/* ── Monthly table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-black text-gray-800 text-sm sm:text-base">Vendas por Período</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {monthly.length} {monthly.length === 1 ? 'período' : 'períodos'}
          </span>
        </div>

        {monthly.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Nenhum dado para o período seleccionado</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="block sm:hidden divide-y divide-gray-50">
              {monthly.map((row, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-800 text-sm">{row.month} {row.year}</p>
                    <GrowthBadge value={row.growth} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pedidos</p>
                      <p className="text-sm font-bold text-gray-600 mt-0.5">{row.orders_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receita</p>
                      <p className="text-base font-black text-orange-500 mt-0.5">{fmt(row.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Mês / Ano</th>
                    <th className="px-6 py-4">Pedidos</th>
                    <th className="px-6 py-4">Receita Bruta</th>
                    <th className="px-6 py-4">Crescimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {monthly.map((row, i) => (
                    <tr key={i} className="text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{row.month} {row.year}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{row.orders_count}</td>
                      <td className="px-6 py-4 font-black text-orange-500">{fmt(row.revenue)}</td>
                      <td className="px-6 py-4"><GrowthBadge value={row.growth} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}