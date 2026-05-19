import React from 'react';
import { Truck, MapPin, Clock, Package, DollarSign, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function ShippingPolicy() {
  const deliveryTimes = [
    { region: 'Luanda', time: '2 - 3 dias úteis', icon: MapPin, color: 'text-orange-500' },
    { region: 'Benguela, Huambo, Lubango', time: '3 - 5 dias úteis', icon: MapPin, color: 'text-blue-500' },
    { region: 'Cabinda, Malanje, Kuito', time: '5 - 7 dias úteis', icon: MapPin, color: 'text-emerald-500' },
    { region: 'Demais províncias', time: '7 - 10 dias úteis', icon: MapPin, color: 'text-purple-500' }
  ];

  const shippingCosts = [
    { range: 'Até 5.000 Kz', cost: '1.500 Kz', icon: Package },
    { range: '5.001 - 15.000 Kz', cost: '2.500 Kz', icon: Package },
    { range: '15.001 - 50.000 Kz', cost: '5.000 Kz', icon: Package },
    { range: 'Acima de 50.000 Kz', cost: 'Grátis', icon: DollarSign, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Política de Entregas</h1>
            </div>
            <p className="text-gray-300 text-sm">Saiba como funciona a entrega dos seus pedidos</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Prazos de Entrega */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Prazos de Entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deliveryTimes.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.color.replace('text', 'bg') + '/10'} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.region}</p>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * Os prazos começam a contar a partir da confirmação do pagamento
              </p>
            </div>

            {/* Custos de Entrega */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                Custos de Entrega
              </h2>
              <div className="space-y-2">
                {shippingCosts.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center p-4 rounded-xl ${
                        item.highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span className="text-sm text-gray-700">{item.range}</span>
                      </div>
                      <span className={`font-bold ${item.highlight ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {item.cost}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Processo de Entrega */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Processo de Entrega
              </h2>
              <div className="space-y-3">
                {[
                  'Após a confirmação do pagamento, o pedido é separado e embalado',
                  'O vendedor gera o código de rastreio e envia o produto',
                  'Você recebe o código por e-mail e pode acompanhar a entrega',
                  'O entregador entra em contacto para combinar a entrega',
                  'Assine o comprovativo de recebimento ao receber o produto'
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Problemas na Entrega */}
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-red-800 mb-2">O que fazer se houver problema na entrega?</h3>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Entre em contacto com o vendedor através da plataforma</li>
                    <li>Acompanhe o rastreio para verificar o estado</li>
                    <li>Após 10 dias úteis sem actualização, accione o nosso suporte</li>
                    <li>Em caso de produto danificado, registe uma reclamação em até 48h</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Portes Grátis */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-emerald-800 mb-2">Portes Grátis</h3>
                  <p className="text-sm text-emerald-700">
                    Compras acima de <strong>50.000 Kz</strong> têm portes grátis para todo o país!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}