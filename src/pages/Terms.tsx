import React from 'react';
import { FileText, Shield, AlertCircle, Scale, Users, ShoppingBag, CreditCard, Truck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Termos de Uso</h1>
            </div>
            <p className="text-gray-300 text-sm">Última actualização: Janeiro 2025</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-orange-500" /> 1. Aceitação dos Termos
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ao aceder ou usar o HSE Marketplace Angola, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá usar os nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" /> 2. Elegibilidade
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Para usar os nossos serviços, você deve:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Fornecer informações precisas e completas</li>
                <li>Manter a confidencialidade da sua conta</li>
                <li>Ser responsável por todas as actividades na sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> 3. Compras e Pagamentos
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Ao fazer uma compra, você concorda em pagar o valor total do pedido</li>
                <li>Os preços estão sujeitos a alterações sem aviso prévio</li>
                <li>Nos reservamos o direito de recusar ou cancelar pedidos</li>
                <li>Pagamentos são processados de forma segura por parceiros autorizados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" /> 4. Entrega e Devoluções
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Os prazos de entrega são estimativas e podem variar</li>
                <li>Você tem 7 dias após o recebimento para solicitar devolução</li>
                <li>Produtos danificados ou defeituosos serão trocados ou reembolsados</li>
                <li>Custos de envio para devoluções podem ser aplicados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" /> 5. Métodos de Pagamento
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Multicaixa Express</li>
                <li>Referência Multicaixa (ATM)</li>
                <li>E-Kwanza</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" /> 6. Limitação de Responsabilidade
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                O HSE Marketplace Angola actua como intermediário entre compradores e vendedores. Não nos responsabilizamos pela qualidade, segurança ou legalidade dos produtos vendidos por terceiros na nossa plataforma.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}