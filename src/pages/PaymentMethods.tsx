import React from 'react';
import { CreditCard, Smartphone, Landmark, Banknote, CheckCircle, Clock, Shield, AlertCircle } from 'lucide-react';

export default function PaymentMethods() {
  const methods = [
    {
      icon: Smartphone,
      title: 'Multicaixa Express',
      description: 'Pagamento instantâneo através da aplicação do seu banco',
      steps: [
        'Seleccione "Multicaixa Express" no checkout',
        'Informe o seu número de telefone associado à conta',
        'Abra a app do seu banco e autorize o pagamento',
        'Pagamento confirmado em segundos'
      ],
      time: 'Processamento: Imediato',
      fee: 'Sem taxas adicionais',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Landmark,
      title: 'Referência Multicaixa',
      description: 'Pague em qualquer caixa ATM ou homebanking',
      steps: [
        'Seleccione "Referência Multicaixa" no checkout',
        'Anote a entidade e referência geradas',
        'Dirija-se a uma caixa ATM ou app do banco',
        'Seleccione "Pagamento de Serviços" e digite os dados',
        'Confirme o valor e conclua o pagamento'
      ],
      time: 'Validade: 72 horas',
      fee: 'Sem taxas adicionais',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: CreditCard,
      title: 'E-Kwanza',
      description: 'Pagamento via carteira digital E-Kwanza',
      steps: [
        'Seleccione "E-Kwanza" no checkout',
        'Informe o seu número de telefone',
        'Leia o Código QR ou utilize o código gerado',
        'Confirme o pagamento na app E-Kwanza'
      ],
      time: 'Processamento: Imediato',
      fee: 'Sem taxas adicionais',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Formas de Pagamento</h1>
            </div>
            <p className="text-gray-300 text-sm">Conheça todas as opções para pagar as suas compras</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {methods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className={`${method.bgColor} rounded-2xl p-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{method.title}</h2>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Como pagar
                      </h3>
                      <ul className="space-y-2">
                        {method.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-black text-gray-500 flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{method.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{method.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Informações de Segurança */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-gray-800 mb-2">Pagamento Seguro</h3>
                  <p className="text-sm text-gray-600">
                    Todas as transacções são processadas com criptografia de ponta a ponta. 
                    Os seus dados financeiros nunca são armazenados nos nossos servidores.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-amber-800 mb-2">Importante</h3>
                  <p className="text-sm text-amber-700">
                    Nunca realize pagamentos fora da plataforma. O HSE Marketplace não se responsabiliza 
                    por transacções feitas por meios não oficiais.
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