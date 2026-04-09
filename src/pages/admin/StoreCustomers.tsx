import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  ShoppingBag,
  X,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Purchase {
  id: string;
  date: string;
  total: number;
  items: number;
  status: 'Entregue' | 'Processando' | 'Cancelado';
}

interface StoreCustomer {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  lastPurchase: string;
  productsBought: number;
  history: Purchase[];
}

const mockStoreCustomers: StoreCustomer[] = [
  { 
    id: 1, 
    name: 'António Agostinho', 
    email: 'antonio@email.ao', 
    totalSpent: 150000, 
    lastPurchase: '2024-03-15', 
    productsBought: 12,
    history: [
      { id: 'ORD-101', date: '2024-03-15', total: 45000, items: 3, status: 'Entregue' },
      { id: 'ORD-095', date: '2024-02-10', total: 105000, items: 9, status: 'Entregue' },
    ]
  },
  { 
    id: 2, 
    name: 'Isabel dos Santos', 
    email: 'isabel@email.ao', 
    totalSpent: 450000, 
    lastPurchase: '2024-03-20', 
    productsBought: 24,
    history: [
      { id: 'ORD-105', date: '2024-03-20', total: 250000, items: 10, status: 'Processando' },
      { id: 'ORD-088', date: '2024-01-15', total: 200000, items: 14, status: 'Entregue' },
    ]
  },
  { 
    id: 3, 
    name: 'Manuel Vicente', 
    email: 'manuel@email.ao', 
    totalSpent: 85000, 
    lastPurchase: '2024-03-10', 
    productsBought: 5,
    history: [
      { id: 'ORD-099', date: '2024-03-10', total: 85000, items: 5, status: 'Entregue' },
    ]
  },
];

export default function StoreCustomers() {
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockStoreCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Meus Clientes</h1>
        <p className="text-sm text-gray-400">Lista de clientes que realizaram compras na sua loja.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
          <Download className="w-4 h-4" />
          Exportar Lista
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total Gasto</th>
                <th className="px-6 py-4">Produtos Comprados</th>
                <th className="px-6 py-4">Última Compra</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-accent">Kz {customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 font-bold">{customer.productsBought} itens</td>
                  <td className="px-6 py-4 text-gray-400">{customer.lastPurchase}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-accent transition-colors" 
                      title="Ver Histórico"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-black">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">{selectedCustomer.name}</h2>
                  <p className="text-sm text-gray-400">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Gasto</p>
                  <p className="text-lg font-black text-accent">Kz {selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pedidos</p>
                  <p className="text-lg font-black text-gray-800">{selectedCustomer.history.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Itens Totais</p>
                  <p className="text-lg font-black text-gray-800">{selectedCustomer.productsBought}</p>
                </div>
              </div>

              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                Histórico de Pedidos
              </h3>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selectedCustomer.history.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-accent/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{purchase.id}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                          <Calendar className="w-3 h-3" />
                          {purchase.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-accent">Kz {purchase.total.toLocaleString()}</p>
                      <span className={`text-[10px] font-black uppercase ${
                        purchase.status === 'Entregue' ? 'text-emerald-500' : 
                        purchase.status === 'Processando' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedCustomer(null)}
                className="w-full mt-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
