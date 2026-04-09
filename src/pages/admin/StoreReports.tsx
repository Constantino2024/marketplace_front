import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  Printer,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

export default function StoreReports() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Relatórios de Vendas</h1>
          <p className="text-sm text-gray-400">Analise o desempenho financeiro da sua loja.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20">
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Receita Total</p>
              <h2 className="text-3xl font-black text-gray-800">Kz 15.840.000</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+24% em relação ao mês passado</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total de Pedidos</p>
              <h2 className="text-3xl font-black text-gray-800">1,452</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12% em relação ao mês passado</span>
          </div>
        </div>
      </div>

      {/* Visual Placeholder for Charts */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-96 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-black text-gray-800 mb-2">Gráfico de Desempenho</h3>
        <p className="text-sm text-gray-400 max-w-xs">Aqui você verá a evolução das suas vendas ao longo do tempo (Gráfico em desenvolvimento).</p>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-black text-gray-800">Vendas por Período</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Mês</th>
                <th className="px-6 py-4">Pedidos</th>
                <th className="px-6 py-4">Receita Bruta</th>
                <th className="px-6 py-4">Crescimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { month: 'Março 2024', orders: 452, revenue: 4250000, growth: '+15%' },
                { month: 'Fevereiro 2024', orders: 380, revenue: 3800000, growth: '+8%' },
                { month: 'Janeiro 2024', orders: 320, revenue: 3100000, growth: '+12%' },
              ].map((row, i) => (
                <tr key={i} className="text-sm hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{row.month}</td>
                  <td className="px-6 py-4 text-gray-500">{row.orders}</td>
                  <td className="px-6 py-4 font-black text-accent">Kz {row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-500 font-bold">{row.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
