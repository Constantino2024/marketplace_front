// services/checkout.ts
import api from "./api";
import { getCurrentUser } from "./auth";

export interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    company?: number;
    company_name?: string;
  }>;
  total: number;
  paymentMethod: 'reference' | 'card' | 'cash';
}

export interface PaymentReference {
  reference: string;
  amount: number;
  entity: string;
  expiryDate: string;
  status: 'pending' | 'paid' | 'expired';
}

export interface OrderResponse {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  payment_reference?: PaymentReference;
}

export const checkoutService = {
  // Criar um novo pedido
  createOrder: async (data: CheckoutData): Promise<OrderResponse> => {
    try {
      const user = getCurrentUser();
      
      const items = data.items.map(item => ({
        product_id: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price)
      }));
      
      const orderData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        payment_method: data.paymentMethod,
        total: Number(data.total),
        user_id: user?.id,
        items: items
      };
      
      console.log('Enviando dados para o backend:', orderData);
      
      const response = await api.post<OrderResponse>('orders/', orderData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error.response?.data || error);
      throw error;
    }
  },

  // Baixar fatura em PDF (usando o ID do pedido)
  downloadInvoice: async (orderId: number): Promise<void> => {
    try {
      const response = await api.get(`invoice/${orderId}/download/`, {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar fatura:', error);
      throw error;
    }
  },

  // Gerar PDF a partir dos dados do pedido (antes de salvar)
  generateInvoicePDF: async (orderData: CheckoutData, orderNumber?: string): Promise<void> => {
    try {
      const pdfData = {
        order_data: {
          full_name: orderData.fullName,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          total: orderData.total,
          items: orderData.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          payment_method: orderData.paymentMethod === 'multicaixa' ? 'Multicaixa Express' : 'Referência Multicaixa',
          order_number: orderNumber || 'PENDENTE'
        }
      };
      
      const response = await api.post('invoice/generate/', pdfData, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura_${orderNumber || 'temp'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  },

  // Gerar referência de pagamento
  generatePaymentReference: async (amount: number): Promise<PaymentReference> => {
    try {
      const reference = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      
      return {
        reference,
        amount,
        entity: 'MULTICAIXA EXPRESS',
        expiryDate: expiryDate.toISOString(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Erro ao gerar referência:', error);
      throw error;
    }
  },

  // Verificar status do pagamento
  checkPaymentStatus: async (reference: string): Promise<{ status: string }> => {
    try {
      const response = await api.get(`payments/status/${reference}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw error;
    }
  }
};