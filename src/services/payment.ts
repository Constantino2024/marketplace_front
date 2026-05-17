// services/payment.ts
import api from "./api";

export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  payment_id?: string;
  reference?: string;
  entity?: string;
  amount?: number;
  expiry_date?: string;
  status?: string;
  message?: string;
  error?: string;
  data?: any;
  rawResponse?: any;
}

export interface EkwanzaPaymentResponse extends PaymentResponse {
  confirmation_code?: string;
  qr_code?: string;
}

export const paymentService = {
  // Iniciar pagamento Express
  initiateExpressPayment: async (amount: number, phoneNumber: string, orderId: number): Promise<PaymentResponse> => {
    try {
      const response = await api.post('/payment/initiate/', {
        payment_method: 'express',
        amount: amount,
        phone_number: phoneNumber,
        order_id: orderId
      });
      
      // Extrair dados da estrutura correta
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        return {
          success: true,
          transaction_id: responseData.data.transaction_id,
          payment_id: responseData.data.payment_id,
          reference: responseData.data.reference,
          entity: responseData.data.entity,
          amount: responseData.data.amount,
          expiry_date: responseData.data.expiry_date,
          status: responseData.data.status,
          message: responseData.message,
          rawResponse: responseData.data
        };
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Erro no pagamento Express:', error);
      return error.response?.data || { success: false, error: 'Erro ao processar pagamento' };
    }
  },

  // Iniciar pagamento por Referência
  initiateReferencePayment: async (amount: number, orderId: number): Promise<PaymentResponse> => {
    try {
      const response = await api.post('/payment/initiate/', {
        payment_method: 'reference',
        amount: amount,
        order_id: orderId
      });
      
      console.log('Resposta da API de referência:', response.data);
      
      // Extrair dados da estrutura correta
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        // A referência pode vir em referenceNumber ou reference
        const referenceNumber = responseData.data.reference || 
                                (responseData.data.referenceNumber) ||
                                (responseData.data.reference_number);
        
        const entity = responseData.data.entity;
        const expiryDate = responseData.data.expiry_date || 
                          (responseData.data.dueDate) ||
                          responseData.data.due_date;
        
        console.log('Dados extraídos - Referência:', referenceNumber, 'Entidade:', entity, 'Expira:', expiryDate);
        
        return {
          success: true,
          transaction_id: responseData.data.transaction_id,
          payment_id: responseData.data.payment_id,
          reference: referenceNumber,
          entity: entity,
          amount: responseData.data.amount || amount,
          expiry_date: expiryDate,
          status: responseData.data.status || 'pending',
          message: responseData.message || 'Referência gerada com sucesso',
          rawResponse: responseData.data
        };
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Erro no pagamento por Referência:', error);
      return error.response?.data || { success: false, error: 'Erro ao processar pagamento' };
    }
  },

  // Iniciar pagamento E-Kwanza
  initiateEkwanzaPayment: async (amount: number, phoneNumber: string, orderId: number): Promise<EkwanzaPaymentResponse> => {
    try {
      const response = await api.post('/payment/initiate/', {
        payment_method: 'ekwanza',
        amount: amount,
        phone_number: phoneNumber,
        order_id: orderId
      });
      
      // Extrair dados da estrutura correta
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        return {
          success: true,
          transaction_id: responseData.data.transaction_id,
          payment_id: responseData.data.payment_id,
          reference: responseData.data.reference,
          entity: responseData.data.entity,
          amount: responseData.data.amount || amount,
          expiry_date: responseData.data.expiry_date,
          status: responseData.data.status,
          confirmation_code: responseData.data.confirmation_code,
          qr_code: responseData.data.qr_code,
          message: responseData.message,
          rawResponse: responseData.data
        };
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Erro no pagamento E-Kwanza:', error);
      return error.response?.data || { success: false, error: 'Erro ao processar pagamento' };
    }
  },

  // Verificar status do pagamento
  checkPaymentStatus: async (transactionId: string): Promise<any> => {
    try {
      const response = await api.get(`/payment/status/${transactionId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      return { success: false, status: 'error', error: error.response?.data?.error };
    }
  }
};