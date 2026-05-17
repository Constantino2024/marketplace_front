import React from 'react';
import { Shield, Lock, Eye, Database, FileText, CheckCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Política de Privacidade</h1>
            </div>
            <p className="text-gray-300 text-sm">Última atualização: Janeiro 2025</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" /> 1. Introdução
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                A sua privacidade é importante para nós. Esta Política de Privacidade descreve como o HSE Marketplace Angola coleta, usa, compartilha e protege suas informações pessoais quando você utiliza nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" /> 2. Informações que Coletamos
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Informações de cadastro (nome, email, telefone, endereço)</li>
                <li>Informações de pagamento (processadas de forma segura por terceiros)</li>
                <li>Histórico de compras e navegação</li>
                <li>Dados de dispositivo e localização</li>
                <li>Comunicações e interações com nosso suporte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-500" /> 3. Como Usamos suas Informações
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Processar e entregar seus pedidos</li>
                <li>Personalizar sua experiência de compra</li>
                <li>Enviar atualizações sobre seus pedidos</li>
                <li>Melhorar nossos serviços e produtos</li>
                <li>Enviar ofertas e novidades (com seu consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" /> 4. Compartilhamento de Informações
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Não vendemos suas informações pessoais. Compartilhamos apenas com:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Vendedores para processar seus pedidos</li>
                <li>Parceiros de pagamento e logística</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" /> 5. Seus Direitos
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato através do nosso email de suporte.
              </p>
            </section>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Ao utilizar o HSE Marketplace Angola, você concorda com os termos desta Política de Privacidade.
                Para dúvidas, entre em contato pelo email: contacto@caluloglobal.co.ao
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}