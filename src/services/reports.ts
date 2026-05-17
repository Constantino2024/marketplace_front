import api from './api';
import { Order } from './orders';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface SalesStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  growth_percentage: number;
  // computed on the frontend
  average_order_value?: number;
}

export interface MonthlySales {
  month: string;
  year: number;
  orders_count: number;
  revenue: number;
  growth: string;
}

export interface DailySales {
  date: string;
  orders_count: number;
  revenue: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
  image_url?: string;
}

export interface DashboardStats extends SalesStats {
  recent_orders: Order[];
  top_products: TopProduct[];
  sales_by_day: DailySales[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toParams = (filters?: ReportFilters): Record<string, string> => {
  const p: Record<string, string> = {};
  if (filters?.startDate) p.start_date = filters.startDate.toISOString().split('T')[0];
  if (filters?.endDate)   p.end_date   = filters.endDate.toISOString().split('T')[0];
  if (filters?.status)    p.status     = filters.status;
  return p;
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const today = () => new Date().toISOString().split('T')[0];

// ─── Service ──────────────────────────────────────────────────────────────────

export const reportsService = {
  getSalesStats: async (filters?: ReportFilters): Promise<SalesStats> => {
    try {
      const { data } = await api.get<SalesStats>('store-reports/stats/', {
        params: toParams(filters),
      });
      return {
        ...data,
        average_order_value:
          data.total_orders > 0 ? data.total_sales / data.total_orders : 0,
      };
    } catch {
      return {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0,
        growth_percentage: 0,
        average_order_value: 0,
      };
    }
  },

  getMonthlySales: async (filters?: ReportFilters): Promise<MonthlySales[]> => {
    try {
      const { data } = await api.get<MonthlySales[]>('store-reports/monthly/', {
        params: toParams(filters),
      });
      return data;
    } catch {
      return [];
    }
  },

  getDailySales: async (filters?: ReportFilters): Promise<DailySales[]> => {
    try {
      const { data } = await api.get<DailySales[]>('store-reports/daily/', {
        params: toParams(filters),
      });
      return data;
    } catch {
      return [];
    }
  },

  getDashboardStats: async (filters?: ReportFilters): Promise<DashboardStats> => {
    try {
      const { data } = await api.get<DashboardStats>('store-reports/stats/', {
        params: toParams(filters),
      });
      return data;
    } catch {
      return {
        total_sales: 0,
        total_orders: 0,
        total_products: 0,
        total_customers: 0,
        growth_percentage: 0,
        recent_orders: [],
        top_products: [],
        sales_by_day: [],
      };
    }
  },

  exportPDF: async (filters?: ReportFilters): Promise<void> => {
    const params = toParams(filters);
    const qs = new URLSearchParams(params).toString();
    const { data } = await api.get(
      `store-reports/export/pdf/${qs ? `?${qs}` : ''}`,
      { responseType: 'blob' }
    );
    downloadBlob(
      new Blob([data], { type: 'application/pdf' }),
      `relatorio_vendas_${today()}.pdf`
    );
  },

  exportCSV: async (filters?: ReportFilters): Promise<void> => {
    const { data } = await api.get('store-reports/export/csv/', {
      params: toParams(filters),
      responseType: 'blob',
    });
    downloadBlob(new Blob([data]), `relatorio_vendas_${today()}.csv`);
  },
};