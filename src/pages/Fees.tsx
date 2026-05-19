import React from 'react';
import { Percent, DollarSign, TrendingUp, Shield, CheckCircle, Info } from 'lucide-react';

export default function Fees() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Percent className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Taxas e Comissões</h1>
            </div>
            <p className="text-gray-300 text-sm">Transparência total para você vender com confiança</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Tabela de Taxas */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-black text-gray-900">Tipo de Taxa</th>
                    <th className="text-right py-3 px-4 font-black text-gray-900">Valor</th>
                    <th className="text-left py-3 px-4 font-black text-gray-900">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Comissão por Venda</td>
                    <td className="py-3 px-4 text-right font-bold text-orange-500">5% - 12%</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">Varia conforme a categoria do produto</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Taxa de Anúncio</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-500">Grátis</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">Registo de produtos sem custo</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Mensalidade</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-500">Grátis</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">Sem mensalidade para manter a sua loja</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-800">Taxa de Levantamento</td>
                    <td className="py-3 px-4 text-right font-bold text-orange-500">2% (mín. 200 Kz)</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">Para transferência bancária</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tabela de Categorias */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Comissão por Categoria
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { category: 'Electrónicos', fee: '8%' },
                  { category: 'Moda e Acessórios', fee: '10%' },
                  { category: 'Casa e Decoração', fee: '7%' },
                  { category: 'Beleza e Saúde', fee: '10%' },
                  { category: 'Alimentos', fee: '5%' },
                  { category: 'Automóveis', fee: '12%' },
                  { category: 'Desportos', fee: '8%' },
                  { category: 'Brinquedos', fee: '9%' },
                ].map((item) => (
                  <div key={item.category} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-orange-500">{item.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-blue-800 mb-1">Informações Importantes</h3>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>A comissão é calculada sobre o valor total da venda (produto + portes)</li>
                    <li>Não cobramos taxa de cancelamento de pedido</li>
                    <li>O seu levantamento pode ser solicitado a qualquer momento (mínimo 5.000 Kz)</li>
                    <li>O pagamento é processado em até 3 dias úteis após a confirmação da entrega</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-black mb-2">Comece a vender hoje mesmo!</h3>
              <p className="text-orange-100 text-sm mb-4">Registo gratuito e primeiros 30 dias com comissão reduzida</p>
              <a
                href="/company/register"
                className="inline-flex items-center gap-2 bg-white text-orange-500 px-6 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Abrir a minha loja
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}