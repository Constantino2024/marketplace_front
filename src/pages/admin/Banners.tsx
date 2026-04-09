import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Hash,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { homeService, Banner } from '../../services/home';
import api from '../../services/api';

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
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> :
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

// Modal de Banner (Criação/Edição)
const BannerModal = ({ 
  isOpen, 
  onClose, 
  banner, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  banner?: Banner | null; 
  onSave: (formData: FormData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    link: '',
    position: 2,
    discount_text: '',
    button_text: 'Comprar agora',
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do banner quando estiver editando
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        link: banner.link || '',
        position: banner.position || 2,
        discount_text: banner.discount_text || '',
        button_text: banner.button_text || 'Comprar agora',
        is_active: banner.is_active !== undefined ? banner.is_active : true
      });
      setImagePreview(banner.image_url || null);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        link: '',
        position: 2,
        discount_text: '',
        button_text: 'Comprar agora',
        is_active: true
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [banner, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'A imagem deve ter no máximo 5MB' }));
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!imagePreview && !banner) {
      newErrors.image = 'Imagem é obrigatória';
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
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('subtitle', formData.subtitle || '');
      submitData.append('description', formData.description || '');
      submitData.append('link', formData.link || '');
      submitData.append('position', String(formData.position));
      submitData.append('discount_text', formData.discount_text || '');
      submitData.append('button_text', formData.button_text);
      submitData.append('is_active', String(formData.is_active));
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {banner ? 'Editar Banner' : 'Novo Banner'}
            </h2>
            {banner && (
              <p className="text-sm text-gray-400 mt-1">
                Editando: <span className="font-bold text-primary">{banner.title}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Imagem do Banner <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-4 items-start">
              <div className="relative w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group">
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
                  <Image className="w-12 h-12 text-gray-300" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700 mb-1">Upload de imagem</p>
                <p className="text-xs text-gray-400 mb-2">Formatos aceitos: JPG, PNG, WEBP</p>
                <p className="text-xs text-gray-400">Tamanho máximo: 5MB</p>
                
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 text-xs text-red-500 hover:text-red-600 font-bold"
                  >
                    Remover imagem
                  </button>
                )}
                
                {errors.image && (
                  <p className="text-red-500 text-xs font-bold mt-2">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Título <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${
                  errors.title ? 'border-red-300' : 'border-gray-200'
                } rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Ex: Summer Collection"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Subtítulo */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Subtítulo <span className="text-gray-300">(opcional)</span>
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: SS'24"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Descrição <span className="text-gray-300">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descrição do banner..."
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Link <span className="text-gray-300">(opcional)</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://exemplo.com/promocao"
              />
            </div>
          </div>

          {/* Posição */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Posição
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={1}>Hero (Slide principal)</option>
              <option value={2}>Promo (Banners promocionais)</option>
              <option value={3}>Sidebar (Barra lateral)</option>
            </select>
          </div>

          {/* Grid para campos opcionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Texto de desconto */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                Texto de desconto <span className="text-gray-300">(opcional)</span>
              </label>
              <input
                type="text"
                name="discount_text"
                value={formData.discount_text}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: SALE UP TO 50%"
              />
            </div>

            {/* Texto do botão */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                Texto do botão
              </label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Comprar agora"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Banner ativo
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? 'A processar...' : (banner ? 'Atualizar Banner' : 'Criar Banner')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [positionFilter, setPositionFilter] = useState<number | 'all'>('all');

  // Carregar banners
  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await homeService.getBanners();
      setBanners(data);
      setFilteredBanners(data);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      showToast('Erro ao carregar banners', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Filtrar banners
  useEffect(() => {
    let filtered = banners;
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (positionFilter !== 'all') {
      filtered = filtered.filter(b => b.position === positionFilter);
    }
    
    setFilteredBanners(filtered);
  }, [searchTerm, positionFilter, banners]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Mover banner (ordenar)
  const moveBanner = async (id: number, direction: 'up' | 'down') => {
    try {
      const index = banners.findIndex(b => b.id === id);
      if (
        (direction === 'up' && index === 0) || 
        (direction === 'down' && index === banners.length - 1)
      ) return;

      const newBanners = [...banners];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];
      
      // Atualizar ordem no backend
      await Promise.all([
        api.patch(`banners/${newBanners[index].id}/`, { order: index }),
        api.patch(`banners/${newBanners[swapIndex].id}/`, { order: swapIndex })
      ]);
      
      setBanners(newBanners);
      showToast('Ordem atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao mover banner:', error);
      showToast('Erro ao atualizar ordem', 'error');
    }
  };

  // Salvar banner (criar ou atualizar)
  const handleSaveBanner = async (formData: FormData) => {
    try {
      if (selectedBanner) {
        // Atualizar banner existente
        await api.put(`banners/${selectedBanner.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Banner atualizado com sucesso!', 'success');
      } else {
        // Criar novo banner
        await api.post('banners/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Banner criado com sucesso!', 'success');
      }
      await loadBanners();
    } catch (error: any) {
      console.error('Erro ao salvar banner:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erro ao salvar banner';
        
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
          }
        }
        
        showToast(errorMessage, 'error');
      } else {
        showToast('Erro ao salvar banner', 'error');
      }
      throw error;
    }
  };

  // Deletar banner
  const handleDelete = async () => {
    if (!selectedBanner) return;
    
    try {
      await api.delete(`banners/${selectedBanner.id}/`);
      showToast('Banner eliminado com sucesso!', 'success');
      await loadBanners();
    } catch (error) {
      console.error('Erro ao deletar banner:', error);
      showToast('Erro ao deletar banner', 'error');
    } finally {
      setSelectedBanner(null);
    }
  };

  // Ativar/desativar banner
  const handleToggleActive = async (banner: Banner) => {
    try {
      await api.patch(`banners/${banner.id}/`, { is_active: !banner.is_active });
      showToast(`Banner ${!banner.is_active ? 'ativado' : 'desativado'} com sucesso!`, 'success');
      await loadBanners();
    } catch (error) {
      console.error('Erro ao alterar status do banner:', error);
      showToast('Erro ao alterar status', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast e Modais */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedBanner(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Banner"
        message={`Tem certeza que deseja eliminar o banner "${selectedBanner?.title}"?`}
      />

      <BannerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBanner(null);
        }}
        banner={selectedBanner}
        onSave={handleSaveBanner}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Gestão de Banners</h1>
          <p className="text-sm text-gray-400">Gerencie os banners da página inicial.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedBanner(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Novo Banner
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar banners..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todas as posições</option>
          <option value="1">Hero</option>
          <option value="2">Promo</option>
          <option value="3">Sidebar</option>
        </select>
      </div>

      {/* Lista de Banners */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Banner</th>
                  <th className="px-6 py-4">Posição</th>
                  <th className="px-6 py-4">Título</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ordem</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        {banner.position === 1 ? 'Hero' : banner.position === 2 ? 'Promo' : 'Sidebar'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-800">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-xs text-gray-400">{banner.subtitle}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          banner.is_active 
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">{banner.order}</span>
                        <div className="flex flex-col">
                          <button 
                            onClick={() => moveBanner(banner.id, 'up')}
                            className="text-gray-400 hover:text-primary"
                            disabled={banners.findIndex(b => b.id === banner.id) === 0}
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveBanner(banner.id, 'down')}
                            className="text-gray-400 hover:text-primary"
                            disabled={banners.findIndex(b => b.id === banner.id) === banners.length - 1}
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBanner(banner);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBanner(banner);
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
                ))}

                {filteredBanners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-bold">Nenhum banner encontrado</p>
                      <p className="text-sm">Clique em "Novo Banner" para criar um.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}