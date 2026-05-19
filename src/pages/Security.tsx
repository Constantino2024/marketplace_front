import React from 'react';
import { Shield, Lock, Eye, Database, CreditCard, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Criptografia SSL',
      description: 'Todas as informações são transmitidas com criptografia de 256 bits',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Eye,
      title: 'Protecção de Dados',
      description: 'Os seus dados pessoais nunca são partilhados com terceiros',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CreditCard,
      title: 'Pagamento Seguro',
      description: 'Processamento de pagamentos por parceiros certificados',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Smartphone,
      title: 'Autenticação em Duas Etapas',
      description: 'Camada extra de segurança para a sua conta',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Segurança</h1>
            </div>
            <p className="text-gray-300 text-sm">Como protegemos os seus dados e transacções</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className={`${feature.bgColor} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 ${feature.color} flex-shrink-0`} />
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recomendações */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4">Recomendações de Segurança</h2>
              <div className="space-y-3">
                {[
                  'Use uma palavra-passe forte e única para a sua conta',
                  'Nunca partilhe a sua palavra-passe com ninguém',
                  'Verifique sempre se está no site oficial antes de fazer login',
                  'Active a autenticação em duas etapas',
                  'Não clique em links suspeitos enviados por e-mail',
                  'Mantenha o seu dispositivo e navegador actualizados'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protecção ao Consumidor */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-emerald-800 mb-2">Protecção ao Consumidor</h3>
                  <p className="text-sm text-emerald-700">
                    O HSE Marketplace oferece garantia de reembolso caso o produto não seja entregue ou 
                    esteja em desacordo com o anunciado. Você tem até 7 dias após o recebimento para solicitar devolução.
                  </p>
                </div>
              </div>
            </div>

            {/* Contacto para Segurança */}
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-orange-800 mb-2">Reportar problema de segurança</h3>
                  <p className="text-sm text-orange-700">
                    Se você identificou alguma actividade suspeita ou vulnerabilidade na nossa plataforma, 
                    entre em contacto imediatamente pelo e-mail: <strong>security@hsemarketplace.ao</strong>
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