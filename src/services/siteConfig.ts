import api from './api';

export interface Feature {
  icon: string;
  text: string;
  color: string;
}

export interface PublicSiteConfig {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  features: Feature[];
}

export interface SiteConfig extends PublicSiteConfig {
  id?: number;
  free_shipping_threshold: number;
  newsletter_discount: number;
  newsletter_discount_amount: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  products_per_page: number;
}

export const siteConfigService = {
  // Buscar configuração pública (sem autenticação)
  getPublicConfig: async (): Promise<PublicSiteConfig> => {
    try {
      const response = await api.get<PublicSiteConfig>('public/site-config/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      // Retornar valores padrão em caso de erro
      return {
        site_name: 'HSE Marketplace',
        site_description: 'O maior marketplace de Angola',
        contact_email: 'suporte@hsemarketplace.ao',
        contact_phone: '+244 900 000 000',
        contact_address: 'Luanda, Angola',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        features: []
      };
    }
  },

  // Buscar configuração completa (requer autenticação admin)
  getConfig: async (): Promise<SiteConfig> => {
    try {
      const response = await api.get<SiteConfig>('site-configs/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  },

  // Atualizar configuração (requer autenticação admin)
  updateConfig: async (data: Partial<SiteConfig>): Promise<SiteConfig> => {
    try {
      const response = await api.patch<SiteConfig>('site-configs/', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  },
};