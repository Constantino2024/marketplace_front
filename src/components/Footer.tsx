import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Store, Shield, Truck, CreditCard, HeadphonesIcon, Loader2, Linkedin } from 'lucide-react';
import { siteConfigService, PublicSiteConfig } from '../services/siteConfig';

const Footer: React.FC = () => {
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Usar o endpoint público (não requer autenticação)
      const data = await siteConfigService.getPublicConfig();
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configurações do rodapé:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Diferenciais fixos (não vêm do back-end)
  const benefits = [
    { icon: <Truck className="w-6 h-6" />, title: 'Entrega Rápida', desc: 'Em todo o país' },
    { icon: <Shield className="w-6 h-6" />, title: 'Compra Segura', desc: 'Pagamento protegido' },
    { icon: <CreditCard className="w-6 h-6" />, title: 'Múltiplos Pagamentos', desc: 'TPA, transferência e mais' },
    { icon: <HeadphonesIcon className="w-6 h-6" />, title: 'Suporte 24h', desc: 'Estamos sempre aqui' },
  ];

  // Redes sociais - mapeamento dos URLs
  const socialLinks = [
    { Icon: Facebook, url: config?.facebook_url, label: 'Facebook', color: 'hover:bg-[#1877F2]' },
    { Icon: Instagram, url: config?.instagram_url, label: 'Instagram', color: 'hover:bg-[#E4405F]' },
    { Icon: Linkedin, url: config?.twitter_url, label: 'Linkedin', color: 'hover:bg-[#0077B5]' },
  ];

  // Filtrar apenas redes sociais que têm URL configurada
  const activeSocialLinks = socialLinks.filter(link => link.url && link.url !== '');

  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">

      {/* ── Diferenciais ── */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl text-primary flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Links ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Marca / Informações de Contacto */}
          <div className="col-span-2 md:col-span-1">
            <img
              src="https://caluloglobal.ao/img/Market_Place1.webp"
              alt="HSE Marketplace"
              className="h-12 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {config?.site_description || 'O maior marketplace de Angola. Conectamos compradores e vendedores de forma simples, segura e eficiente.'}
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              {/* Endereço */}
              {config?.contact_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>{config.contact_address}</span>
                </div>
              )}
              {/* Telefone */}
              {config?.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <span>{config.contact_phone}</span>
                </div>
              )}
              {/* Email */}
              {config?.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <a href={`mailto:${config.contact_email}`} target="_blank" className="hover:text-white transition-colors">
                    {config.contact_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Comprar</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Todos os produtos', to: '/search' },
                { label: 'Ofertas do dia', to: '/search?q=ofertas' },
                { label: 'Novidades', to: '/search?q=novo' },
                { label: 'Meu carrinho', to: '/cart' },
                { label: 'Acompanhar pedido', to: '/orders' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vender */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Vender</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Abrir minha loja', to: '/company/register' },
                { label: 'Central do vendedor', to: '/store-admin' },
                { label: 'Como funciona', to: '/help/vender' },
                { label: 'Taxas e comissões', to: '/help/taxas' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Ajuda</h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Central de ajuda', to: '/help' },
                { label: 'Política de privacidade', to: '/privacy' },
                { label: 'Termos de uso', to: '/terms' },
                { label: 'Política de devoluções', to: '/help/devolucoes' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 text-center sm:text-left">
            © {new Date().getFullYear()} {config?.site_name || 'HSE Marketplace'}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600 text-center sm:text-left">
            By Constantino Gola
          </p>

          {/* Redes Sociais - apenas as que têm URL configurada */}
          {activeSocialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {activeSocialLinks.map(({ Icon, url, label, color }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 ${color} hover:text-white transition-colors`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;