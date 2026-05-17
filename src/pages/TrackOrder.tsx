import React, { useState } from 'react';
import { Package, Search, MapPin, CheckCircle, Clock, Truck, Home, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    
    setIsSearching(true);
    // Simular busca
    setTimeout(() => {
      setTrackingInfo({
        status: 'shipped',
        estimatedDate: '2025-01-25',
        history: [
          { status: 'Pedido Confirmado', date: '2025-01-20 14:30', completed: true },
          { status: 'Pagamento Confirmado', date: '2025-01-20 14:35', completed: true },
          { status: 'Pedido em Separação', date: '2025-01-21 09:00', completed: true },
          { status: 'Produto Enviado', date: '2025-01-22 16:20', completed: true, trackingCode: 'BR123456789AO' },
          { status: 'Em Trânsito', date: '2025-01-23 08:15', completed: false },
          { status: 'Entregue', date: null, completed: false }
        ]
      });
      setIsSearching(false);
    }, 1500);
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) return <Clock className="w-5 h-5 text-gray-300" />;
    switch(status) {
      case 'Pedido Confirmado': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Pagamento Confirmado': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Pedido em Separação': return <Package className="w-5 h-5 text-blue-500" />;
      case 'Produto Enviado': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Em Trânsito': return <MapPin className="w-5 h-5 text-purple-500" />;
      case 'Entregue': return <Home className="w-5 h-5 text-emerald-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Como Rastrear seu Pedido</h1>
            </div>
            <p className="text-gray-300 text-sm">Acompanhe cada etapa da sua compra</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Formulário de Busca */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4">Rastrear Pedido</h2>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Digite o número do seu pedido"
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Rastrear
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-3">
                O número do pedido foi enviado para seu email após a confirmação da compra
              </p>
            </div>

            {/* Informações de Rastreio */}
            {trackingInfo && (
              <div>
                <div className="bg-orange-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Número do Pedido</p>
                      <p className="font-bold text-gray-900">{orderNumber}</p>
                    </div>
                    {trackingInfo.history.find(h => h.trackingCode) && (
                      <div>
                        <p className="text-xs text-gray-500">Código de Rastreio</p>
                        <p className="font-mono font-bold text-orange-600">
                          {trackingInfo.history.find(h => h.trackingCode)?.trackingCode}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Previsão de Entrega</p>
                      <p className="font-bold text-emerald-600">
                        {new Date(trackingInfo.estimatedDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {trackingInfo.history.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-6 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getStatusIcon(item.status, item.completed)}
                        </div>
                        {index < trackingInfo.history.length - 1 && (
                          <div className={`w-0.5 h-12 mt-1 ${item.completed ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-bold text-gray-800">{item.status}</p>
                        {item.date && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.date).toLocaleString('pt-PT')}
                          </p>
                        )}
                        {item.trackingCode && (
                          <p className="text-xs text-orange-500 mt-1">
                            Código: {item.trackingCode}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-blue-800 mb-2">Dicas importantes</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>O código de rastreio pode levar até 24h para aparecer após o envio</li>
                    <li>Verifique sua caixa de spam se não recebeu o email de confirmação</li>
                    <li>Em caso de atraso, entre em contato com o vendedor pela plataforma</li>
                    <li>Você também pode acompanhar seus pedidos na seção "Meus Pedidos"</li>
                  </ul>
                </div>
              </div>
            </div>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-orange-500 font-medium hover:gap-3 transition-all"
            >
              Ir para Meus Pedidos
              <CheckCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}