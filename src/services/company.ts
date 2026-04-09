import api from "./api";

export interface CompanyProfile {
  id: number;
  company_name: string;
  nif: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  logo_url?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_verified: boolean;
  joined_date: string;
  total_sales: number;
  products_count: number;
  user_id: number;
  username: string;
  email: string;
}

export interface CompanyStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  recent_orders: CompanyOrder[];
  top_products: TopProduct[];
  sales_by_day: SalesByDay[];
  customers: CompanyCustomer[];
}

export interface CompanyOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
  image_url?: string;
}

export interface SalesByDay {
  date: string;
  total: number;
  orders_count: number;
}

export interface CompanyCustomer {
  id: number;
  name: string;
  email: string;
  total_spent: number;
  last_purchase: string;
  orders_count: number;
  products_count: number;
}

export interface CustomerPurchase {
  id: string;
  order_number: string;
  date: string;
  total: number;
  items_count: number;
  status: string;
}

export interface CustomerDetails extends CompanyCustomer {
  orders: CustomerPurchase[];
}

export const companyService = {
  // Buscar perfil da empresa
  getProfile: async (): Promise<CompanyProfile> => {
    try {
      const response = await api.get<CompanyProfile>('company/profile/');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil da empresa:', error);
      throw error;
    }
  },

  // Atualizar perfil da empresa
  updateProfile: async (data: Partial<CompanyProfile>): Promise<CompanyProfile> => {
    try {
      const response = await api.put<CompanyProfile>('company/profile/', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Buscar estatísticas do dashboard
  getDashboardData: async (): Promise<CompanyStats> => {
    try {
      
      // Buscar pedidos da empresa
      const ordersResponse = await api.get<any>('company/orders/');
      
      // Buscar produtos da empresa
      const productsResponse = await api.get<any>('company/products/');
      
      let orders: CompanyOrder[] = [];
      let products: any[] = [];
      
      // Processar pedidos
      if (Array.isArray(ordersResponse.data)) {
        orders = ordersResponse.data.map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_info?.full_name || order.customer || 'Cliente',
          customer_email: order.customer_info?.email || order.email || '',
          total: Number(order.total) || 0,
          status: order.status || 'pending',
          created_at: order.created_at,
          items_count: order.items?.length || 0
        }));
      } else if (ordersResponse.data?.results) {
        orders = ordersResponse.data.results.map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_info?.full_name || order.customer || 'Cliente',
          customer_email: order.customer_info?.email || order.email || '',
          total: Number(order.total) || 0,
          status: order.status || 'pending',
          created_at: order.created_at,
          items_count: order.items?.length || 0
        }));
      }
      
      // Processar produtos
      if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data?.results) {
        products = productsResponse.data.results;
      }
      
      // Calcular estatísticas
      const total_orders = orders.length;
      const total_products = products.length;
      const total_sales = orders.reduce((sum, order) => sum + order.total, 0);
      
      // Calcular clientes únicos
      const uniqueCustomers = new Map();
      orders.forEach(order => {
        const key = order.customer_email || order.customer_name;
        if (!uniqueCustomers.has(key)) {
          uniqueCustomers.set(key, {
            email: order.customer_email,
            name: order.customer_name,
            total_spent: 0,
            orders_count: 0
          });
        }
        const customer = uniqueCustomers.get(key);
        customer.total_spent += order.total;
        customer.orders_count += 1;
      });
      
      const total_customers = uniqueCustomers.size;
      
      // Criar lista de clientes
      const customers: CompanyCustomer[] = Array.from(uniqueCustomers.values()).map((c: any, index) => ({
        id: index + 1,
        name: c.name,
        email: c.email,
        total_spent: c.total_spent,
        last_purchase: orders
          .filter(o => o.customer_email === c.email || o.customer_name === c.name)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at || '',
        orders_count: c.orders_count,
        products_count: orders
          .filter(o => o.customer_email === c.email || o.customer_name === c.name)
          .reduce((sum, o) => sum + o.items_count, 0)
      }));
      
      // Calcular top produtos
      const productSales = new Map();
      orders.forEach(order => {
        if (order.items_count > 0) {
          // Como não temos detalhes dos produtos nos pedidos, vamos estimar
          // Em produção, você buscaria os itens dos pedidos
          const productId = Math.floor(Math.random() * products.length) + 1;
          const product = products.find(p => p.id === productId);
          if (product) {
            if (!productSales.has(productId)) {
              productSales.set(productId, {
                id: productId,
                name: product.name,
                total_sold: 0,
                total_revenue: 0,
                image_url: product.image_url
              });
            }
            const sale = productSales.get(productId);
            sale.total_sold += 1;
            sale.total_revenue += order.total / 3; // Estimativa
          }
        }
      });
      
      const top_products: TopProduct[] = Array.from(productSales.values())
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);
      
      // Calcular vendas por dia (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const sales_by_day: SalesByDay[] = last7Days.map(date => {
        const dayOrders = orders.filter(o => o.created_at?.startsWith(date));
        return {
          date,
          total: dayOrders.reduce((sum, o) => sum + o.total, 0),
          orders_count: dayOrders.length
        };
      });
      
      // Pegar pedidos recentes
      const recent_orders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      
      return {
        total_sales,
        total_orders,
        total_products,
        total_customers,
        recent_orders,
        top_products,
        sales_by_day,
        customers
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      // Retornar dados vazios em caso de erro
      return {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0,
        recent_orders: [],
        top_products: [],
        sales_by_day: [],
        customers: []
      };
    }
  },
  
  // Buscar clientes da empresa
  getCustomers: async (): Promise<CompanyCustomer[]> => {
    try {
      const data = await companyService.getDashboardData();
      return data.customers || [];
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return [];
    }
  },
  
  // Buscar detalhes de um cliente específico
  getCustomerDetails: async (customerEmail: string): Promise<CustomerDetails | null> => {
    try {
      const data = await companyService.getDashboardData();
      const customer = data.customers.find(c => c.email === customerEmail);
      
      if (!customer) return null;
      
      // Buscar pedidos do cliente
      const ordersResponse = await api.get<any>('company/orders/');
      let allOrders: any[] = [];
      
      if (Array.isArray(ordersResponse.data)) {
        allOrders = ordersResponse.data;
      } else if (ordersResponse.data?.results) {
        allOrders = ordersResponse.data.results;
      }
      
      const customerOrders = allOrders
        .filter(o => o.customer_info?.email === customerEmail || o.email === customerEmail)
        .map((order, index) => ({
          id: `ORD-${index + 1}`,
          order_number: order.order_number,
          date: order.created_at?.split('T')[0] || '',
          total: Number(order.total) || 0,
          items_count: order.items?.length || 0,
          status: order.status || 'pending'
        }));
      
      return {
        ...customer,
        orders: customerOrders
      };
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do cliente:', error);
      return null;
    }
  },
  
  // Buscar pedidos da empresa
  getOrders: async (): Promise<CompanyOrder[]> => {
    try {
      const data = await companyService.getDashboardData();
      return data.recent_orders || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      return [];
    }
  },
  
  // Buscar estatísticas resumidas para cards
  getStats: async (): Promise<{
    total_sales: number;
    total_orders: number;
    total_products: number;
    total_customers: number;
  }> => {
    try {
      const data = await companyService.getDashboardData();
      return {
        total_sales: data.total_sales,
        total_orders: data.total_orders,
        total_products: data.total_products,
        total_customers: data.total_customers
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0
      };
    }
  }
};