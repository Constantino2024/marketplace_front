import api from "./api";

export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: number;
  category_name: string;
  company?: number;
  company_name?: string;
  image?: string;
  image_url?: string;
  additional_images: ProductImage[];
  status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  status_display: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  oldPrice?: number; // Para compatibilidade com promoções
  rating?: number; // Média de avaliações
  review_count?: number; // Total de avaliações
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: number;
  image?: File | null;
  additional_images?: File[];
  status?: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  is_featured?: boolean;
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_value: number;
}

export interface UploadImagesResponse {
  success: boolean;
  images: ProductImage[];
  message?: string;
}

export const productsService = {
  // Listar produtos com paginação
  list: async (params?: {
    page?: number;
    page_size?: number;
    category?: number;
    company?: number;
    status?: string;
    search?: string;
    featured?: boolean;
    ordering?: string;
  }): Promise<ProductListResponse> => {
    try {
      const response = await api.get<ProductListResponse>('products/', { params });
      
      // Garantir que additional_images seja sempre um array
      if (response.data.results) {
        response.data.results = response.data.results.map(product => ({
          ...product,
          additional_images: product.additional_images || []
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar produto por ID
  getById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get<Product>(`products/${id}/`);
      
      // Garantir que additional_images seja sempre um array
      const product = {
        ...response.data,
        additional_images: response.data.additional_images || []
      };
      
      return product;
    } catch (error) {
      throw error;
    }
  },

  // Criar novo produto
  create: async (data: CreateProductData): Promise<Product> => {
    try {
      const formData = new FormData();
      
      // Campos obrigatórios
      formData.append('name', data.name);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.stock));
      formData.append('category', String(data.category));
      
      // Campos opcionais
      if (data.description) formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);
      if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
      
      // Imagem principal
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Imagens adicionais
      if (data.additional_images && data.additional_images.length > 0) {
        data.additional_images.forEach(file => {
          formData.append('additional_images', file);
        });
      }

      const response = await api.post<Product>('products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        ...response.data,
        additional_images: response.data.additional_images || []
      };
    } catch (error: any) {
      throw error;
    }
  },

  // Atualizar produto
  update: async (id: number, data: Partial<CreateProductData>): Promise<Product> => {
    try {
      const formData = new FormData();
      
      // Adicionar apenas campos que foram alterados
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.price !== undefined) formData.append('price', String(data.price));
      if (data.stock !== undefined) formData.append('stock', String(data.stock));
      if (data.category !== undefined) formData.append('category', String(data.category));
      if (data.status) formData.append('status', data.status);
      if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
      
      // Imagem principal (se nova)
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.put<Product>(`products/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        ...response.data,
        additional_images: response.data.additional_images || []
      };
    } catch (error: any) {
      console.error('Erro na API products.update:');
      throw error;
    }
  },

  // Deletar produto
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`products/${id}/`);
    } catch (error: any) {
      console.error('Erro na API products.delete:');
      throw error;
    }
  },

  // Upload de imagens adicionais
  uploadAdditionalImages: async (productId: number, formData: FormData): Promise<UploadImagesResponse> => {
    try {
      const response = await api.post<UploadImagesResponse>(`products/${productId}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na API products.uploadAdditionalImages:');
      throw error;
    }
  },

  // Deletar imagem específica
  deleteImage: async (productId: number, imageId: number): Promise<void> => {
    try {
      await api.delete(`products/${productId}/images/${imageId}/`);
    } catch (error: any) {
      console.error('Erro na API products.deleteImage:');
      throw error;
    }
  },

  // Definir imagem principal
  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    try {
      await api.post(`products/${productId}/images/set-primary/`, { image_id: imageId });
    } catch (error: any) {
      console.error('Erro na API products.setPrimaryImage:');
      throw error;
    }
  },

  // Reordenar imagens
  reorderImages: async (productId: number, imageOrders: { id: number; order: number }[]): Promise<void> => {
    try {
      await api.post(`products/${productId}/images/reorder/`, { images: imageOrders });
    } catch (error: any) {
      console.error('Erro na API products.reorderImages:');
      throw error;
    }
  },

  // Obter estatísticas
  getStats: async (): Promise<ProductStats> => {
    try {
      const response = await api.get<ProductStats>('products/stats/');
      return response.data;
    } catch (error: any) {
      console.error('Erro na API products.getStats:');
      throw error;
    }
  },

  // Produtos da empresa (para store-admin)
  listCompanyProducts: async (params?: {
    page?: number;
    page_size?: number;
    category?: number;
    status?: string;
    search?: string;
    ordering?: string;
  }): Promise<ProductListResponse> => {
    try {
      const response = await api.get<ProductListResponse>('company/products/', { params });
      
      // Garantir que additional_images seja sempre um array
      if (response.data.results) {
        response.data.results = response.data.results.map(product => ({
          ...product,
          additional_images: product.additional_images || []
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro na API products.listCompanyProducts:', error);
      throw error;
    }
  },

  // Criar produto da empresa
  createCompanyProduct: async (data: CreateProductData): Promise<Product> => {
    try {
      const formData = new FormData();
      
      // Campos obrigatórios
      formData.append('name', data.name);
      formData.append('price', String(data.price));
      formData.append('stock', String(data.stock));
      formData.append('category', String(data.category));
      
      // Campos opcionais
      if (data.description) formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);
      if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
      
      // Imagem principal
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Imagens adicionais
      if (data.additional_images && data.additional_images.length > 0) {
        data.additional_images.forEach(file => {
          formData.append('additional_images', file);
        });
      }

      const response = await api.post<Product>('company/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        ...response.data,
        additional_images: response.data.additional_images || []
      };
    } catch (error: any) {
      console.error('Erro na API products.createCompanyProduct:');
      throw error;
    }
  },

  // Atualizar produto da empresa
  updateCompanyProduct: async (id: number, data: Partial<CreateProductData>): Promise<Product> => {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description || '');
      if (data.price !== undefined) formData.append('price', String(data.price));
      if (data.stock !== undefined) formData.append('stock', String(data.stock));
      if (data.category !== undefined) formData.append('category', String(data.category));
      if (data.status) formData.append('status', data.status);
      if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
      if (data.image) formData.append('image', data.image);

      const response = await api.put<Product>(`company/products/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        ...response.data,
        additional_images: response.data.additional_images || []
      };
    } catch (error: any) {
      console.error('Erro na API products.updateCompanyProduct:');
      throw error;
    }
  },

  // Deletar produto da empresa
  deleteCompanyProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`company/products/${id}/`);
    } catch (error: any) {
      console.error('Erro na API products.deleteCompanyProduct:');
      throw error;
    }
  },

  // Upload de imagens adicionais para produto da empresa
  uploadCompanyProductImages: async (productId: number, formData: FormData): Promise<UploadImagesResponse> => {
    try {
      const response = await api.post<UploadImagesResponse>(`company/products/${productId}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro na API products.uploadCompanyProductImages:');
      throw error;
    }
  },

  // Deletar imagem de produto da empresa
  deleteCompanyProductImage: async (productId: number, imageId: number): Promise<void> => {
    try {
      await api.delete(`company/products/${productId}/images/${imageId}/`);
    } catch (error: any) {
      console.error('Erro na API products.deleteCompanyProductImage:');
      throw error;
    }
  },

  // Definir imagem principal de produto da empresa
  setCompanyProductPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    try {
      await api.post(`company/products/${productId}/images/set-primary/`, { image_id: imageId });
    } catch (error: any) {
      console.error('Erro na API products.setCompanyProductPrimaryImage:');
      throw error;
    }
  },

  // Reordenar imagens de produto da empresa
  reorderCompanyProductImages: async (productId: number, imageOrders: { id: number; order: number }[]): Promise<void> => {
    try {
      await api.post(`company/products/${productId}/images/reorder/`, { images: imageOrders });
    } catch (error: any) {
      console.error('Erro na API products.reorderCompanyProductImages:');
      throw error;
    }
  },

  // Buscar produtos relacionados
  getRelatedProducts: async (productId: number, categoryId: number, limit: number = 4): Promise<Product[]> => {
    try {
      const response = await api.get<ProductListResponse>('products/', {
        params: {
          category: categoryId,
          page_size: limit + 1, // +1 para filtrar o atual depois
          status: 'active'
        }
      });
      
      // Filtrar o produto atual e limitar
      const related = response.data.results
        .filter(p => p.id !== productId)
        .slice(0, limit);
      
      return related;
    } catch (error) {
      console.error('Erro na API products.getRelatedProducts:');
      return [];
    }
  }
};