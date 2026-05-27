// services/proforma.ts
import api from "./api";

export interface ProformaItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  company_name?: string;
}

export interface ProformaData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  items: ProformaItem[];
  total: number;
  valid_until?: string;
}

export interface ProformaResponse {
  success: boolean;
  pdf_url?: string;
  error?: string;
}

export const proformaService = {
  // Gerar fatura proforma (não salva no banco)
  generateProforma: async (data: ProformaData): Promise<Blob> => {
    try {
      const response = await api.post('proforma/generate/', data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao gerar fatura proforma:');
      throw error;
    }
  },

  // Download da fatura proforma
  downloadProforma: async (data: ProformaData, filename?: string) => {
    try {
      const blob = await proformaService.generateProforma(data);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `proforma_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao baixar fatura proforma:');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao gerar fatura' 
      };
    }
  }
};