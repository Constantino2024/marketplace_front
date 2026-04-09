import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderPlus,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Building2,
  Globe,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categoriesService, Category, CreateCategoryData } from '../../services/categories';
import { getCurrentUser } from '../../services/auth';

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
  message,
  isAdminOnly = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  isAdminOnly?: boolean;
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
        {isAdminOnly && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Apenas administradores podem eliminar categorias.
            </p>
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          {!isAdminOnly && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              Confirmar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Modal de categoria
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave,
  canEdit = true
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  category?: Category | null; 
  onSave: (data: CreateCategoryData) => Promise<void>;
  canEdit?: boolean;
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    image: null,
    is_active: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da categoria quando estiver editando
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: null,
        is_active: category.is_active
      });
      setImagePreview(category.image_url || null);
    } else {
      setFormData({
        name: '',
        description: '',
        image: null,
        is_active: true
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
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
      console.error('Erro ao salvar categoria:', error);
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
              {category ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            {category && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-400">
                  Editando: <span className="font-bold text-primary">{category.name}</span>
                </p>
                {category.is_global ? (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Global
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {category.company_name}
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Esta categoria é global e não pode ser editada por empresas.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Imagem da Categoria <span className="text-gray-300">(opcional)</span>
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={!canEdit}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl transition-all group ${
                      canEdit 
                        ? 'cursor-pointer hover:border-primary hover:bg-primary/5' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Upload className={`w-8 h-8 text-gray-300 ${
                      canEdit ? 'group-hover:text-primary' : ''
                    } transition-colors`} />
                    <span className={`text-xs text-gray-400 mt-2 ${
                      canEdit ? 'group-hover:text-primary' : ''
                    } transition-colors`}>
                      {canEdit ? 'Clique para fazer upload' : 'Upload desabilitado'}
                    </span>
                    <span className="text-[10px] text-gray-300 mt-1">
                      PNG, JPG até 5MB
                    </span>
                  </label>
                </div>
              </div>
              
              {imagePreview && (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nome da Categoria */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Nome da Categoria <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!canEdit}
              className={`w-full bg-gray-50 border ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                !canEdit ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              placeholder="Ex: Eletrônicos, Moda, Alimentos..."
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
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
              disabled={!canEdit}
              rows={3}
              className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                !canEdit ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              placeholder="Descreva a categoria..."
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={!canEdit}
              className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Categoria ativa
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
            {canEdit && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? 'A processar...' : (category ? 'Atualizar Categoria' : 'Criar Categoria')}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterCompany, setFilterCompany] = useState<'all' | 'global' | 'mine'>('all');
  
  const user = getCurrentUser();
  const isAdmin = user?.is_admin;
  const isCompany = user?.is_company;

  // Carregar categorias
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const params: any = {};
      
      if (filterActive !== null) {
        params.is_active = filterActive;
      }
      
      if (filterCompany === 'global') {
        params.company = 'global';
      } else if (filterCompany === 'mine' && isCompany) {
        params.company = 'mine';
      }
      
      const data = await categoriesService.list(params);
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        showToast('Erro ao carregar categorias', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [filterActive, filterCompany]);

  // Filtrar categorias por busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Verificar se pode editar categoria
  const canEditCategory = (category: Category): boolean => {
    if (isAdmin) return true;
    if (isCompany && !category.is_global) return true;
    return false;
  };

  // Verificar se pode deletar categoria
  const canDeleteCategory = (category: Category): boolean => {
    return isAdmin; // Apenas admin pode deletar
  };

  // Criar/Atualizar categoria
  const handleSaveCategory = async (data: CreateCategoryData) => {
    try {
      if (selectedCategory) {
        await categoriesService.update(selectedCategory.id, data);
        showToast('Categoria atualizada com sucesso!', 'success');
      } else {
        await categoriesService.create(data);
        showToast('Categoria criada com sucesso!', 'success');
      }
      await loadCategories();
      setSelectedCategory(null);
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erro ao salvar categoria';
        
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            errorMessage = `${firstKey}: ${errorData[firstKey]}`;
          }
        }
        
        showToast(errorMessage, 'error');
      } else {
        showToast('Erro ao salvar categoria', 'error');
      }
      
      throw error;
    }
  };

  // Deletar categoria
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await categoriesService.delete(selectedCategory.id);
      showToast('Categoria eliminada com sucesso!', 'success');
      await loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      showToast('Erro ao deletar categoria', 'error');
    } finally {
      setSelectedCategory(null);
    }
  };

  // Ativar/desativar categoria
  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesService.toggleActive(category.id, !category.is_active);
      showToast(`Categoria ${!category.is_active ? 'ativada' : 'desativada'} com sucesso!`, 'success');
      await loadCategories();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      showToast('Erro ao alterar status', 'error');
    }
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
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Eliminar Categoria"
        message={`Tem certeza que deseja eliminar a categoria "${selectedCategory?.name}"? Esta ação não pode ser desfeita.`}
        isAdminOnly={!canDeleteCategory(selectedCategory!)}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleSaveCategory}
        canEdit={selectedCategory ? canEditCategory(selectedCategory) : true}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-400">
            {isAdmin 
              ? 'Gerencie todas as categorias da plataforma.'
              : isCompany 
                ? 'Gerencie as categorias da sua loja. Categorias globais são apenas para visualização.'
                : 'Visualize as categorias disponíveis.'}
          </p>
        </div>
        {(isAdmin || isCompany) && (
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar categorias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') setFilterActive(null);
              else setFilterActive(value === 'active');
            }}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>

          {(isAdmin || isCompany) && (
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todas as categorias</option>
              <option value="global">Globais (Admin)</option>
              {isCompany && <option value="mine">Minhas categorias</option>}
            </select>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, i) => {
            const canEdit = canEditCategory(cat);
            const canDelete = canDeleteCategory(cat);
            
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={cat.id} 
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden ${
                  !canEdit && !cat.is_global ? 'opacity-75' : ''
                }`}
              >
                {/* Imagem da categoria */}
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  {cat.image_url ? (
                    <img 
                      src={cat.image_url} 
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderPlus className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badge de origem */}
                  <div className="absolute top-3 left-3">
                    {cat.is_global ? (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                        <Globe className="w-3 h-3" />
                        Global
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                        <Building2 className="w-3 h-3" />
                        {cat.company_name || 'Loja'}
                      </span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {(canEdit || isAdmin) && (
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`p-2 rounded-lg transition-colors ${
                          cat.is_active 
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={cat.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {cat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-800">{cat.name}</h3>
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowConfirmModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cat.description}</p>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      {cat.products_count} {cat.products_count === 1 ? 'Produto' : 'Produtos'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      cat.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {cat.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Card */}
          {(isAdmin || isCompany) && (
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setShowModal(true);
              }}
              className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary transition-all group min-h-[320px]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-primary">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold">Adicionar Nova Categoria</span>
            </button>
          )}
        </div>
      )}

      {!isLoading && filteredCategories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Nenhuma categoria encontrada</p>
          {(isAdmin || isCompany) && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setShowModal(true);
              }}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Criar primeira categoria
            </button>
          )}
        </div>
      )}
    </div>
  );
}