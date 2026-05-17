import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, CreditCard, MapPin, CheckCircle, ArrowRight, Truck, Shield, Smartphone, Landmark } from 'lucide-react';

export default function HowToBuy() {
  const steps = [
    {
      icon: Search,
      title: '1. Encontre o Produto',
      description: 'Use a busca ou navegue por categorias para encontrar o produto desejado.',
      tip: 'Dica: Utilize filtros para refinar sua busca por preço, marca ou vendedor.'
    },
    {
      icon: ShoppingCart,
      title: '2. Adicione ao Carrinho',
      description: 'Selecione a quantidade desejada e clique em "Comprar agora" ou "Adicionar ao carrinho".',
      tip: 'Dica: Verifique as especificações do produto antes de adicionar ao carrinho.'
    },
    {
      icon: CreditCard,
      title: '3. Escolha o Pagamento',
      description: 'Selecione seu método de pagamento preferido e preencha os dados necessários.',
      tip: 'Dica: Pagamentos via Multicaixa Express são processados imediatamente.'
    },
    {
      icon: CheckCircle,
      title: '4. Confirme o Pedido',
      description: 'Revise seus dados e finalize a compra. Você receberá a confirmação por email.',
      tip: 'Dica: Guarde o número do pedido para rastrear sua compra.'
    }
  ];

  const paymentMethods = [
    {
      icon: Smartphone,
      title: 'Multicaixa Express',
      description: 'Pagamento imediato através do aplicativo do banco',
      time: 'Processamento imediato'
    },
    {
      icon: Landmark,
      title: 'Referência Multicaixa',
      description: 'Pague em qualquer caixa ATM ou homebanking',
      time: 'Validade: 72 horas'
    },
    {
      icon: CreditCard,
      title: 'E-Kwanza',
      description: 'Pagamento via carteira digital E-Kwanza',
      time: 'Processamento imediato'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl sm:text-3xl font-black">Como Comprar no HSE Marketplace</h1>
            </div>
            <p className="text-gray-300 text-sm">Guia completo para fazer suas compras com segurança</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Steps */}
            <div className="space-y-6">
              <h2 className="text-lg font-black text-gray-900">Passo a Passo</h2>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <p className="text-xs text-orange-500 bg-orange-50 inline-block px-2 py-1 rounded">{step.tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Métodos de Pagamento */}
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4">Métodos de Pagamento Disponíveis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{method.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{method.description}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{method.time}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dicas de Segurança */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-blue-800 mb-2">Dicas de Segurança</h3>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Verifique a reputação do vendedor antes de comprar</li>
                    <li>Leia a descrição do produto e as avaliações de outros compradores</li>
                    <li>Guarde todos os comprovantes de pagamento</li>
                    <li>Nunca faça pagamentos fora da plataforma</li>
                    <li>Em caso de dúvidas, entre em contato com nosso suporte</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-orange-800 mb-2">Informações de Entrega</h3>
                  <p className="text-sm text-orange-700 mb-2">
                    O prazo de entrega varia de acordo com a sua localização:
                  </p>
                  <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                    <li>Luanda: 2 a 3 dias úteis</li>
                    <li>Benguela, Huambo, Lubango: 3 a 5 dias úteis</li>
                    <li>Demais províncias: 5 a 10 dias úteis</li>
                  </ul>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all"
            >
              Começar a Comprar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}