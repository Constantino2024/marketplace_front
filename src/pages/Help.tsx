import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Truck, Shield, CreditCard, Store, Headphones, FileText, Lock, Clock, ChevronRight } from 'lucide-react';

export default function Help() {
  const helpCategories = [
    {
      title: 'Para Compradores',
      icon: HelpCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      items: [
        { label: 'Como comprar no HSE Marketplace', to: '/help/como-comprar' },
        { label: 'Formas de pagamento', to: '/help/pagamentos' },
        { label: 'Política de entregas', to: '/help/envio' },
        { label: 'Política de devoluções', to: '/help/devolucoes' },
        { label: 'Meus pedidos', to: '/orders' },
        { label: 'Como rastrear a minha encomenda', to: '/help/rastrear' },
      ]
    },
    {
      title: 'Para Vendedores',
      icon: Store,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      items: [
        { label: 'Como funciona', to: '/help/vender' },
        { label: 'Abrir a minha loja', to: '/company/register' },
        { label: 'Taxas e comissões', to: '/help/taxas' },
        { label: 'Política de envio', to: '/help/envio' },
        { label: 'Central do vendedor', to: '/store-admin' },
      ]
    },
    {
      title: 'Segurança',
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      items: [
        { label: 'Compra segura', to: '/help/seguranca' },
        { label: 'Privacidade', to: '/privacy' },
        { label: 'Termos de uso', to: '/terms' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Central de Ajuda</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
            Encontre respostas para as suas dúvidas e saiba como aproveitar ao máximo o HSE Marketplace
          </p>
        </div>

        {/* Categorias de ajuda */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className={`${category.bgColor} rounded-2xl p-6`}>
                <div className={`w-12 h-12 ${category.color} bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to} className="text-sm text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1 group">
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-6">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Como faço para comprar um produto?', a: 'Para comprar, basta navegar pelos produtos, adicionar ao carrinho e finalizar a compra no checkout. Você pode pagar via Multicaixa Express, Referência Multicaixa ou E-Kwanza.' },
              { q: 'Qual é o prazo de entrega?', a: 'O prazo de entrega varia de 2 a 5 dias úteis para Luanda e de 5 a 10 dias úteis para as demais províncias.' },
              { q: 'Como posso rastrear o meu pedido?', a: 'Após a confirmação do pagamento, você receberá um código de rastreio por e-mail. Também pode acompanhar na secção "Meus Pedidos".' },
              { q: 'O produto não atendeu as minhas expectativas. E agora?', a: 'Você tem até 7 dias após o recebimento para solicitar a devolução. Entre em contacto com o nosso suporte.' },
              { q: 'Como me torno um vendedor?', a: 'Aceda à página "Vender no HSE" e preencha o formulário de registo de empresa. A nossa equipa entrará em contacto.' },
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <h3 className="font-bold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl font-black mb-2">Ainda tem dúvidas?</h3>
          <p className="text-orange-100 mb-6">A nossa equipa está pronta para ajudar você</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Fale Connosco
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}