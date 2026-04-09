import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Package,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Camera,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsService, Product, CreateProductData, ProductStats, ProductImage } from '../../services/products';
import { categoriesService, Category } from '../../services/categories';
import { getCurrentUser } from '../../services/auth';
import { formatCurrency } from '../../utils/currency';

// Componente de Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
     type === 'error' ? <AlertCircle className="w-5 h-5" /> :
     <AlertCircle className="w-5 h-5" />}
    <p className="font-bold">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Modal de confirmação
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-black text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de imagens
const ImageManagerModal = ({
  isOpen,
  onClose,
  product,
  onImagesUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onImagesUpdated: () => void;
}) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (product) {
      // Processar imagens
      const productImages: ProductImage[] = [];
      
      if (product.additional_images && product.additional_images.length > 0) {
        productImages.push(...product.additional_images);
      }
      
      if (product.image_url && !productImages.some(img => img.url === product.image_url)) {
        productImages.unshift({
          id: 0,
          url: product.image_url,
          is_primary: true,
          order: 0
        });
      }
      
      setImages(productImages);
    }
  }, [product]);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar tamanho
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setToast({
        message: 'Algumas imagens excedem 2MB',
        type: 'error'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('additional_images', file);
      });

      await productsService.uploadAdditionalImages(product.id, formData);
      setToast({
        message: `${validFiles.length} ${validFiles.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}!`,
        type: 'success'
      });
      onImagesUpdated();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setToast({
        message: 'Erro ao fazer upload das imagens',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await productsService.setPrimaryImage(product.id, imageId);
      setToast({
        message: 'Imagem principal definida com sucesso!',
        type: 'success'
      });
      onImagesUpdated();
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      setToast({
        message: 'Erro ao definir imagem principal',
        type: 'error'
      });
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta imagem?')) return;

    try {
      await productsService.deleteImage(product.id, imageId);
      setToast({
        message: 'Imagem eliminada com sucesso!',
        type: 'success'
      });
      onImagesUpdated();
    } catch (error) {
      console.error('Erro ao eliminar imagem:', error);
      setToast({
        message: 'Erro ao eliminar imagem',
        type: 'error'
      });
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    
    // Atualizar ordem
    newImages.forEach((img, i) => {
      img.order = i;
    });
    
    setImages(newImages);
    // Aqui você pode chamar uma API para salvar a nova ordem
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6" />
            <h2 className="text-xl font-black">Gerenciar Imagens</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast interno */}
        <AnimatePresence>
          {toast && (
            <div className={`px-4 py-2 mx-6 mt-4 rounded-lg text-sm font-bold ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {toast.message}
            </div>
          )}
        </AnimatePresence>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload de novas imagens */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Adicionar Imagens
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadImages}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {uploading ? 'A enviar...' : 'Clique para selecionar ou arraste imagens'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP até 2MB cada
                </p>
              </label>
            </div>
          </div>

          {/* Lista de imagens */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Imagens ({images.length})
            </h3>
            <div className="space-y-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={img.url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {img.is_primary && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded-full">
                          Principal
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        ID: {img.id} | Ordem: {img.order}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={img.is_primary}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          img.is_primary
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        Definir como Principal
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="text-xs font-bold px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Controles de ordem */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-orange-500 disabled:opacity-30"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 text-gray-400 hover:text-orange-500 disabled:opacity-30"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma imagem cadastrada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Componente de Paginação
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  totalItems: number;
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Total de <span className="font-bold text-gray-700">{totalItems}</span> produtos
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Modal de produto
const ProductModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSave,
  categories
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  product?: Product | null; 
  onSave: (data: CreateProductData) => Promise<void>;
  categories: Category[];
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: categories[0]?.id || 0,
    image: null,
    additional_images: [],
    status: 'draft',
    is_featured: false
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do produto quando estiver editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category,
        image: null,
        additional_images: [],
        status: product.status,
        is_featured: product.is_featured
      });
      setImagePreview(product.image_url || null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: categories[0]?.id || 0,
        image: null,
        additional_images: [],
        status: 'draft',
        is_featured: false
      });
      setImagePreview(null);
      setAdditionalPreviews([]);
    }
    setErrors({});
  }, [product, categories, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'A imagem deve ter no máximo 2MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Validar tamanho
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, additional_images: 'Algumas imagens excedem 2MB' }));
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      additional_images: [...(prev.additional_images || []), ...validFiles] 
    }));
    
    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images?.filter((_, i) => i !== index)
    }));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Estoque não pode ser negativo';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl relative my-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-6">
          {product ? 'Editar Produto' : 'Novo Produto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem Principal */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Imagem Principal <span className="text-gray-300">(opcional)</span>
            </label>
            <div className="flex gap-4 items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700 mb-1">Upload de imagem</p>
                <p className="text-xs text-gray-400 mb-2">Formatos aceitos: JPG, PNG, WEBP</p>
                <p className="text-xs text-gray-400">Tamanho máximo: 2MB</p>
                {errors.image && (
                  <p className="text-red-500 text-[10px] font-bold mt-2">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload de Imagens Adicionais */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
              Imagens Adicionais <span className="text-gray-300">(opcional)</span>
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm"
              />
              
              {additionalPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {additionalPreviews.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.additional_images && (
                <p className="text-red-500 text-[10px] font-bold mt-2">{errors.additional_images}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Nome do Produto <span className="text-red-400">*</span>
              </label>
              <input 
                required
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${
                  errors.name ? 'border-red-300' : 'border-gray-100'
                } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all`}
                placeholder="Ex: Smartphone Galaxy S24"
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] font-bold mt-1">{errors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Categoria <span className="text-red-400">*</span>
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${
                  errors.category ? 'border-red-300' : 'border-gray-100'
                } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none`}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-[10px] font-bold mt-1">{errors.category}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Status
              </label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
              >
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
                <option value="out_of_stock">Sem Estoque</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </div>

            {/* Preço */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Preço (Kz) <span className="text-red-400">*</span>
              </label>
              <input 
                required
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full bg-gray-50 border ${
                  errors.price ? 'border-red-300' : 'border-gray-100'
                } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all`}
                placeholder="0,00"
              />
              {errors.price && (
                <p className="text-red-500 text-[10px] font-bold mt-1">{errors.price}</p>
              )}
            </div>

            {/* Estoque */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Estoque <span className="text-red-400">*</span>
              </label>
              <input 
                required
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full bg-gray-50 border ${
                  errors.stock ? 'border-red-300' : 'border-gray-100'
                } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-[10px] font-bold mt-1">{errors.stock}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">
                Descrição <span className="text-gray-300">(opcional)</span>
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                placeholder="Descreva o produto..."
              />
            </div>

            {/* Destaque */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-700 block">Produto em destaque</span>
                  <span className="text-xs text-gray-400">Aparecerá na seção de destaques da loja</span>
                </div>
                {formData.is_featured ? (
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <StarOff className="w-5 h-5 text-gray-300" />
                )}
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isLoading ? 'A processar...' : (product ? 'Salvar Alterações' : 'Criar Produto')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    total_products: 0,
    active_products: 0,
    out_of_stock: 0,
    low_stock: 0,
    total_value: 0
  });
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Loading e Toast
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const user = getCurrentUser();
  const isCompany = user?.is_company;
  const isAdmin = user?.is_admin;

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const data = await categoriesService.list({ is_active: true });
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // Carregar produtos
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const params: any = {
        page: currentPage,
        page_size: 30,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined
      };
      
      let response;
      if (isCompany) {
        response = await productsService.listCompanyProducts(params);
      } else {
        response = await productsService.list(params);
      }
      
      setProducts(response.results || []);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 30));
      
      // Carregar estatísticas
      if (isAdmin) {
        try {
          const statsData = await productsService.getStats();
          setStats(statsData);
        } catch (statsError) {
          console.error('Erro ao carregar estatísticas:', statsError);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        showToast('Erro ao carregar produtos', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, categories]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Criar/Atualizar produto
  const handleSaveProduct = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        if (isCompany) {
          await productsService.updateCompanyProduct(editingProduct.id, data);
        } else {
          await productsService.update(editingProduct.id, data);
        }
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        if (isCompany) {
          await productsService.createCompanyProduct(data);
        } else {
          await productsService.create(data);
        }
        showToast('Produto criado com sucesso!', 'success');
      }
      await loadProducts();
      setEditingProduct(null);
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erro ao salvar produto';
        
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
          }
        }
        
        showToast(errorMessage, 'error');
      } else {
        showToast('Erro ao salvar produto', 'error');
      }
      
      throw error;
    }
  };

  // Deletar produto
  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    
    try {
      if (isCompany) {
        await productsService.deleteCompanyProduct(editingProduct.id);
      } else {
        await productsService.delete(editingProduct.id);
      }
      showToast('Produto eliminado com sucesso!', 'success');
      await loadProducts();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      showToast('Erro ao deletar produto', 'error');
    } finally {
      setEditingProduct(null);
    }
  };

  // Traduzir status
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      'active': { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2, label: 'Ativo' },
      'draft': { color: 'bg-gray-100 text-gray-600', icon: Clock, label: 'Rascunho' },
      'out_of_stock': { color: 'bg-red-100 text-red-600', icon: XCircle, label: 'Sem Estoque' },
      'discontinued': { color: 'bg-gray-100 text-gray-400', icon: XCircle, label: 'Descontinuado' }
    };
    return configs[status] || configs['draft'];
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setEditingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        title="Eliminar Produto"
        message={`Tem certeza que deseja eliminar o produto "${editingProduct?.name}"? Esta ação não pode ser desfeita.`}
      />

      {/* Image Manager Modal */}
      {editingProduct && (
        <ImageManagerModal
          isOpen={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onImagesUpdated={loadProducts}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            {isCompany ? 'Meus Produtos' : 'Gestão de Produtos'}
          </h1>
          <p className="text-sm text-gray-400">
            {isCompany 
              ? 'Gerencie o catálogo de produtos da sua loja.'
              : 'Gerencie todos os produtos da plataforma.'}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Stats Summary (apenas admin) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total</p>
            <p className="text-2xl font-black text-gray-800">{stats.total_products}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ativos</p>
            <p className="text-2xl font-black text-emerald-500">{stats.active_products}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Sem Estoque</p>
            <p className="text-2xl font-black text-red-500">{stats.out_of_stock}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Estoque Baixo</p>
            <p className="text-2xl font-black text-orange-500">{stats.low_stock}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Valor Total</p>
            <p className="text-2xl font-black text-orange-500">{formatCurrency(stats.total_value)}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, categoria..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filtros expandidos */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value ? Number(e.target.value) : '');
                      setCurrentPage(1);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="draft">Rascunho</option>
                    <option value="out_of_stock">Sem Estoque</option>
                    <option value="discontinued">Descontinuado</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4">Estoque</th>
                    <th className="px-6 py-4">Status</th>
                    {isAdmin && <th className="px-6 py-4">Empresa</th>}
                    <th className="px-6 py-4 text-center">Destaque</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const status = getStatusConfig(product.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={product.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{product.name}</p>
                              {product.additional_images && product.additional_images.length > 0 && (
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  +{product.additional_images.length} {product.additional_images.length === 1 ? 'imagem' : 'imagens'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <span className="px-3 py-1 bg-orange-100 text-orange-500 rounded-lg text-xs font-bold">
                            {product.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-orange-500">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {product.stock > 0 && product.stock < 5 && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Estoque Baixo" />
                            )}
                            <span className={`font-bold ${
                              product.stock === 0 ? 'text-red-500' : 
                              product.stock < 5 ? 'text-orange-500' : 'text-gray-500'
                            }`}>
                              {product.stock} un
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-600">
                              {product.company_name || 'N/A'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-center">
                          {product.is_featured ? (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mx-auto" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.additional_images && product.additional_images.length > 0 && (
                              <button 
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowImageModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                                title="Gerenciar imagens"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                setShowModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                setShowConfirmModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">Nenhum produto encontrado</p>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowModal(true);
                    }}
                    className="mt-4 text-orange-500 font-bold hover:underline"
                  >
                    Criar primeiro produto
                  </button>
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}