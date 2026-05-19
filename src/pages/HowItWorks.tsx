import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Users, CreditCard, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Store,
      title: '1. Registe a sua Empresa',
      description: 'Preencha o formulário com os dados da sua empresa e aguarde a aprovação da nossa equipa.',
      link: '/company/register'
    },
    {
      icon: Users,
      title: '2. Configure a sua Loja',
      description: 'Personalize a sua loja, adicione logótipo e informações de contacto.',
      link: '/store-admin'
    },
    {
      icon: CreditCard,
      title: '3. Registe Produtos',
      description: 'Adicione os seus produtos com fotos, descrições e preços competitivos.',
      link: '/store-admin/products'
    },
    {
      icon: TrendingUp,
      title: '4. Comece a Vender',
      description: 'Receba pedidos, gerencie o stock e envie produtos para os seus clientes.',
      link: '/store-admin/orders'
    }
  ];

  const benefits = [
    { icon: Shield, text: 'Pagamento Garantido' },
    { icon: Users, text: 'Milhares de Compradores' },
    { icon: TrendingUp, text: 'Suporte ao Vendedor' },
    { icon: CreditCard, text: 'Taxas Competitivas' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Como Funciona para Vendedores</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
            Saiba como começar a vender no HSE Marketplace Angola e alcançar milhares de clientes em todo o país
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{step.description}</p>
                <Link
                  to={step.link}
                  className="inline-flex items-center gap-1 text-orange-500 text-sm font-medium hover:gap-2 transition-all"
                >
                  Saiba mais <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-black text-gray-900 text-center mb-6">Porquê vender no HSE Marketplace?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl font-black mb-2">Pronto para começar a vender?</h3>
          <p className="text-orange-100 mb-6">Junte-se a milhares de vendedores que já confiam no HSE Marketplace</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/company/register"
              className="px-6 py-3 bg-white text-orange-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Abrir a minha loja
            </Link>
            <Link
              to="/help/taxas"
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
            >
              Ver taxas e comissões
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}