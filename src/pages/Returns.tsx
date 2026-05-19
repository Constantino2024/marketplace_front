import React from 'react';
import { RefreshCw, Package, CheckCircle, XCircle, Clock, Truck, FileText, HelpCircle } from 'lucide-react';

export default function Returns() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Política de Devoluções</h1>
            </div>
            <p className="text-gray-300 text-sm">Última actualização: Janeiro 2025</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" /> 1. Prazo para Devolução
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Você tem até <strong className="text-gray-900">7 dias corridos</strong> após o recebimento do produto para solicitar a devolução, conforme previsto no Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" /> 2. Motivos Aceites para Devolução
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Produto com defeito de fabrico</li>
                <li>Produto diferente do anunciado</li>
                <li>Arrependimento da compra (com prazo de 7 dias)</li>
                <li>Produto danificado durante o transporte</li>
                <li>Embalagem aberta ou violada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-500" /> 3. Condições para Devolução
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Produto deve estar na sua embalagem original</li>
                <li>Acessórios e manuais devem estar incluídos</li>
                <li>Produto não pode apresentar sinais de uso</li>
                <li>Factura deve ser apresentada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" /> 4. Processo de Devolução
              </h2>
              <div className="space-y-3">
                {[
                  'Entre em contacto com o nosso suporte informando o pedido e motivo',
                  'Aguarde a análise e autorização da devolução',
                  'Envie o produto para o endereço indicado',
                  'Aguardamos a análise do produto (até 5 dias úteis)',
                  'Aprovada a devolução, realizamos o reembolso ou troca'
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-orange-500">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" /> 5. Custos de Envio
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Para produtos com defeito: o custo de envio é por conta do vendedor</li>
                <li>Para arrependimento: o custo de envio é por conta do comprador</li>
                <li>Em caso de erro do vendedor: custo de envio por conta do vendedor</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" /> 6. Reembolso
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                O reembolso será processado no mesmo método de pagamento utilizado na compra, em até 10 dias úteis após a aprovação da devolução.
              </p>
            </section>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-orange-800 mb-1">Ainda tem dúvidas?</h3>
                  <p className="text-xs text-orange-600">
                    Entre em contacto com o nosso suporte através do e-mail contacto@caluloglobal.co.ao ou pelo WhatsApp +244 923 979 915
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