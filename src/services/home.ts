import api from "./api";
import { Product } from "../context/CartContext";

export interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  products_count: number;
  is_global: boolean;
  company_name?: string;
}

export interface HomeProduct extends Product {
  image_url?: string;
  category_name: string;
  category_id: number;
  company_name?: string;
  status: string;
  is_featured: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link: string;
  position: number;
  discount_text: string;
  button_text: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  image_url: string;
  link: string;
  background_color: string;
  border_color: string;
  discount_badge_color: string;
}

export interface Feature {
  icon: string;
  text: string;
  color: string;
}

export interface SiteConfig {
  site_name: string;
  site_description: string;
  free_shipping_threshold: number;
  newsletter_discount: number;
  newsletter_discount_amount: number;
  features: Feature[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  products_per_page: number;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  products: HomeProduct[];
}

export interface HomeData {
  hero_banners: Banner[];
  promo_banners: Banner[];
  sidebar_banners: Banner[];
  promotions: Promotion[];
  features: Feature[];
  site_config: SiteConfig;
  categories_with_products: CategoryWithProducts[];
  featured_products: HomeProduct[];
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export const homeService = {
  getHomeData: async (): Promise<HomeData> => {
    try {
      const [homeResponse, categoriesResponse] = await Promise.all([
        api.get<{
          hero_banners: Banner[];
          promo_banners: Banner[];
          sidebar_banners: Banner[];
          promotions: Promotion[];
          features: Feature[];
          site_config: SiteConfig;
        }>('home/'),
        api.get<HomeCategory[]>('categories/', {
          params: { is_active: true, limit: 10 },
        }),
      ]);

      const categories = categoriesResponse.data;

      const [categoriesWithProducts, featuredResponse] = await Promise.all([
        Promise.all(
          categories.map(async (category) => {
            try {
              const productsResponse = await api.get<{ results: HomeProduct[] }>(
                'products/',
                { params: { category: category.id, status: 'active', limit: 10 } }
              );
              return {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image_url: category.image_url,
                products: productsResponse.data.results,
              };
            } catch {
              return {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image_url: category.image_url,
                products: [] as HomeProduct[],
              };
            }
          })
        ),
        api.get<{ results: HomeProduct[] }>('products/', {
          params: { featured: true, status: 'active', limit: 10 },
        }),
      ]);

      return {
        ...homeResponse.data,
        categories_with_products: categoriesWithProducts.filter(
          (cat) => cat.products.length > 0
        ),
        featured_products: featuredResponse.data.results,
      };
    } catch {
      return {
        hero_banners: [],
        promo_banners: [],
        sidebar_banners: [],
        promotions: [],
        features: [],
        site_config: {} as SiteConfig,
        categories_with_products: [],
        featured_products: [],
      };
    }
  },

  subscribeNewsletter: async (email: string): Promise<NewsletterResponse> => {
    try {
      const response = await api.post<NewsletterResponse>(
        'newsletter/subscribe/',
        { email }
      );
      return response.data;
    } catch (error: any) {
      return (
        error?.response?.data ?? {
          success: false,
          message: 'Erro ao processar inscrição. Tente novamente.',
        }
      );
    }
  },

  getBanners: async (position?: number): Promise<Banner[]> => {
    try {
      const params = position ? { position } : {};
      const response = await api.get<Banner[]>('banners/', { params });
      return response.data;
    } catch {
      return [];
    }
  },

  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await api.get<Promotion[]>('promotions/');
      return response.data;
    } catch {
      return [];
    }
  },

  getFeaturedCategories: async (): Promise<HomeCategory[]> => {
    try {
      const response = await api.get<HomeCategory[]>('categories/', {
        params: { is_active: true, limit: 8 },
      });
      return response.data;
    } catch {
      return [];
    }
  },

  getSiteConfig: async (): Promise<SiteConfig | null> => {
    try {
      const response = await api.get<SiteConfig>('site-configs/');
      return response.data;
    } catch {
      return null;
    }
  },
};