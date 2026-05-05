// services/payment.ts
import api from "./api";

export interface PaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    transaction_id: string;
    payment_id?: string;
    reference?: string;
    entity?: string;
    amount?: number;
    expiry_date?: string;
    status?: string;
  };
}

export const paymentService = {
  // Iniciar pagamento Express
  initiateExpressPayment: async (amount: number, phoneNumber: string, orderId?: number): Promise<PaymentResponse> => {
    try {
      const response = await api.post<PaymentResponse>('payment/initiate/', {
        payment_method: 'express',
        amount: amount,
        phone_number: phoneNumber,
        order_id: orderId
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro no pagamento Express:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao processar pagamento Express'
      };
    }
  },

  // Iniciar pagamento por Referência
  initiateReferencePayment: async (amount: number, orderId?: number): Promise<PaymentResponse> => {
        try {
            const response = await api.post<PaymentResponse>('payment/initiate/', {
            payment_method: 'reference',
            amount: amount,
            order_id: orderId
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao gerar referência:', error);
            return {
            success: false,
            error: error.response?.data?.error || 'Erro ao gerar referência de pagamento'
            };
        }
    },

  // Iniciar pagamento E-Kwanza
  initiateEkwanzaPayment: async (amount: number, phoneNumber: string, orderId?: number): Promise<PaymentResponse> => {
    try {
      const response = await api.post<PaymentResponse>('payment/initiate/', {
        payment_method: 'ekwanza',
        amount: amount,
        phone_number: phoneNumber,
        order_id: orderId
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro no pagamento E-Kwanza:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao processar pagamento E-Kwanza'
      };
    }
  },

  // Verificar status do pagamento
  checkPaymentStatus: async (transactionId: string): Promise<{ success: boolean; status?: string; error?: string }> => {
    try {
      const response = await api.get(`payment/status/${transactionId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar status do pagamento'
      };
    }
  }
};