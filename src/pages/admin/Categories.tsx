import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, FolderPlus,
  X, Eye, EyeOff, Upload, Globe,
  Building2, Lock, AlertCircle, CheckCircle, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categoriesService, Category, CreateCategoryData } from '../../services/categories';
import { getCurrentUser } from '../../services/auth';

// ── Paleta ───────────────────────────────────────────────
const C = {
  navy:        '#0C2340',
  navySoft:    '#163354',
  orange:      '#E8600A',
  orangeLight: '#FDF0E8',
  orangeMid:   '#F5D0B5',
};

// ── Toast ────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

const Toast = ({ message, type, onClose }: {
  message: string; type: ToastType; onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    className="fixed bottom-6 right-6 z-50 flex items-center gap-3
      px-5 py-3 rounded-xl text-white text-sm font-medium"
    style={{ background: type === 'success' ? '#1A6B35' : type === 'error' ? C.orange : C.navy }}
  >
    {type === 'success'
      ? <CheckCircle className="w-4 h-4 shrink-0" />
      : <AlertCircle className="w-4 h-4 shrink-0" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// ── Modal de confirmação ─────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, canDelete }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; canDelete: boolean;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(12,35,64,.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-sm"
      >
        <h2 className="text-base font-semibold mb-2" style={{ color: C.navy }}>{title}</h2>
        <p className="text-sm text-gray-500 mb-5">{message}</p>

        {!canDelete && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-5 text-xs"
            style={{ background: C.orangeLight, color: '#993C1D' }}>
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Apenas administradores podem eliminar categorias.</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-100
              rounded-xl hover:bg-gray-50 transition-colors"
          >Cancelar</button>
          {canDelete && (
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl
                transition-opacity hover:opacity-90"
              style={{ background: C.orange }}
            >Eliminar</button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Modal de categoria ───────────────────────────────────
const CategoryModal = ({ isOpen, onClose, category, onSave, canEdit }: {
  isOpen: boolean; onClose: () => void;
  category?: Category | null;
  onSave: (data: CreateCategoryData) => Promise<void>;
  canEdit: boolean;
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '', description: '', image: null, is_active: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || '', description: category.description || '',
        image: null, is_active: category.is_active });
      setImagePreview(category.image_url || null);
    } else {
      setFormData({ name: '', description: '', image: null, is_active: true });
      setImagePreview(null);
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(p => ({
      ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFormData(p => ({ ...p, image: f }));
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name?.trim())        e.name = 'Nome é obrigatório';
    else if (formData.name.length < 3) e.name = 'Mínimo 3 caracteres';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try { await onSave(formData); onClose(); }
    catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(12,35,64,.45)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden my-8"
      >
        {/* Cabeçalho azul-escuro */}
        <div className="px-6 py-5 flex items-start justify-between"
          style={{ background: C.navy }}>
          <div>
            <h2 className="text-base font-medium text-white">
              {category ? 'Editar categoria' : 'Nova categoria'}
            </h2>
            {category
              ? <p className="text-xs mt-0.5" style={{ color: '#A0BAD0' }}>
                  A editar: <span className="text-white font-medium">{category.name}</span>
                </p>
              : <p className="text-xs mt-0.5" style={{ color: '#A0BAD0' }}>Preencha os dados abaixo</p>
            }
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg
              transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!canEdit && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: C.orangeLight, color: '#993C1D' }}>
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Esta categoria é global e não pode ser editada por lojas.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Imagem <span className="normal-case text-gray-300 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-4 items-start">
              <label
                htmlFor="img-up"
                className={`flex-1 flex flex-col items-center justify-center h-28
                  border border-dashed border-gray-200 rounded-xl transition-colors
                  ${canEdit ? 'cursor-pointer hover:border-orange-400 hover:bg-orange-50/40'
                    : 'opacity-50 cursor-not-allowed'}`}
              >
                <Upload className="w-5 h-5 text-gray-300 mb-1.5" />
                <span className="text-xs text-gray-400">
                  {canEdit ? 'Clique para fazer upload' : 'Desabilitado'}
                </span>
                <span className="text-[11px] text-gray-300 mt-0.5">PNG, JPG até 5 MB</span>
                <input id="img-up" type="file" accept="image/*"
                  className="hidden" onChange={handleImage} disabled={!canEdit} />
              </label>
              {imagePreview && (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-100">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, image: null })); }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg text-white"
                      style={{ background: C.orange }}
                      aria-label="Remover"
                    ><X className="w-3 h-3" /></button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Nome <span style={{ color: C.orange }}>*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="Ex: Eletrónicos, Moda, Alimentos..."
              className={`w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl
                focus:outline-none transition-colors
                ${errors.name ? 'border-red-300' : 'border-gray-200'}
                ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ color: C.navy }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = errors.name ? '#fca5a5' : '#e5e7eb'}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-[11px] mt-1" style={{ color: C.orange }}>
                <AlertCircle className="w-3 h-3" />{errors.name}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Descrição <span className="normal-case text-gray-300 font-normal">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              placeholder="Descreva a categoria..."
              className={`w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200
                rounded-xl focus:outline-none resize-none transition-colors
                ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ color: C.navy }}
              onFocus={e => e.target.style.borderColor = C.orange}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium" style={{ color: C.navy }}>Categoria ativa</p>
              <p className="text-xs text-gray-400">Visível para os utilizadores</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div
                className="w-10 h-6 rounded-full transition-colors
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                  after:bg-white after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-4"
                style={{ background: formData.is_active ? C.orange : '#D1D5DB' }}
              />
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm text-gray-400 border border-gray-100
                rounded-xl hover:bg-gray-50 transition-colors"
            >Cancelar</button>
            {canEdit && (
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl
                  transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: C.orange }}
              >
                {isLoading ? 'A processar...' : category ? 'Guardar alterações' : 'Criar categoria'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Card de categoria ────────────────────────────────────
const CategoryCard = ({ category, canEdit, canDelete, onEdit, onDelete, onToggle }: {
  category: Category; canEdit: boolean; canDelete: boolean;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 overflow-hidden
      hover:border-orange-200 transition-colors group"
  >
    <div className="h-36 bg-gray-50 relative flex items-center justify-center">
      {category.image_url
        ? <img src={category.image_url} alt={category.name}
            className="w-full h-full object-cover" />
        : <FolderPlus className="w-10 h-10 text-gray-200" />
      }

      <div className="absolute inset-0 p-3 flex items-start justify-between">
        {category.is_global
          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
              text-[10px] font-medium text-white"
              style={{ background: C.navy }}>
              <Globe className="w-3 h-3" />Global
            </span>
          : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
              text-[10px] font-medium text-white"
              style={{ background: C.orange }}>
              <Building2 className="w-3 h-3" />{category.company_name || 'Loja'}
            </span>
        }

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {(canEdit || canDelete) && (
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center
                transition-colors hover:bg-orange-50"
              style={{ color: category.is_active ? '#1A6B35' : '#8A97A8' }}
              aria-label={category.is_active ? 'Desativar' : 'Ativar'}
            >
              {category.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}
          {canEdit && (
            <button onClick={onEdit}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center
                text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              aria-label="Editar"
            ><Edit className="w-3.5 h-3.5" /></button>
          )}
          {canDelete && (
            <button onClick={onDelete}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center
                text-gray-400 transition-colors"
              style={{ }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.orange; (e.currentTarget as HTMLElement).style.background = C.orangeLight; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              aria-label="Eliminar"
            ><Trash2 className="w-3.5 h-3.5" /></button>
          )}
        </div>
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-sm font-medium truncate mb-1" style={{ color: C.navy }}>
        {category.name}
      </h3>
      {category.description && (
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2rem]">
          {category.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <Package className="w-3 h-3" />
          {category.products_count ?? 0} produtos
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
          style={category.is_active
            ? { background: '#E6F4EC', color: '#1A6B35' }
            : { background: C.orangeLight, color: '#993C1D' }}
        >
          {category.is_active ? 'Ativa' : 'Inativa'}
        </span>
      </div>
    </div>
  </motion.div>
);

// ── Card de estatística ──────────────────────────────────
const StatCard = ({ label, value, sub, accent }: {
  label: string; value: number; sub: string; accent: string;
}) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden">
    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
      style={{ background: accent }} />
    <p className="text-xs text-gray-400 mb-1.5 pl-2">{label}</p>
    <p className="text-2xl font-medium pl-2" style={{ color: C.navy }}>{value}</p>
    <p className="text-xs text-gray-400 mt-0.5 pl-2">{sub}</p>
  </div>
);

// ── Página principal ─────────────────────────────────────
export default function Categories() {
  const [categories,         setCategories]         = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm,         setSearchTerm]         = useState('');
  const [filterActive,       setFilterActive]       = useState('all');
  const [filterType,         setFilterType]         = useState('all');
  const [showModal,          setShowModal]          = useState(false);
  const [showConfirm,        setShowConfirm]        = useState(false);
  const [selectedCategory,   setSelectedCategory]   = useState<Category | null>(null);
  const [isLoading,          setIsLoading]          = useState(true);
  const [toast,              setToast]              = useState<{ message: string; type: ToastType } | null>(null);

  const user      = getCurrentUser();
  const isAdmin   = user?.is_admin;
  const isCompany = user?.is_company;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.list({});
      setCategories(data);
    } catch (err: any) {
      if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
      else showToast('Erro ao carregar categorias', 'error');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    let r = [...categories];
    const q = searchTerm.toLowerCase();
    if (q) r = r.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q)
    );
    if (filterActive !== 'all') r = r.filter(c => c.is_active === (filterActive === 'active'));
    if (filterType === 'global')   r = r.filter(c => c.is_global);
    if (filterType === 'company')  r = r.filter(c => !c.is_global);
    setFilteredCategories(r);
  }, [searchTerm, filterActive, filterType, categories]);

  const canEdit   = (c: Category) => !!(isAdmin || (isCompany && !c.is_global));
  const canDelete = (_c: Category) => !!isAdmin;

  const handleSave = async (data: CreateCategoryData) => {
    try {
      if (selectedCategory) {
        await categoriesService.update(selectedCategory.id, data);
        showToast('Categoria atualizada!', 'success');
      } else {
        await categoriesService.create(data);
        showToast('Categoria criada!', 'success');
      }
      await loadCategories();
      setSelectedCategory(null);
      setShowModal(false);
    } catch (err: any) {
      const msg = err.response?.data
        ? String(Object.values(err.response.data)[0])
        : 'Erro ao guardar';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await categoriesService.delete(selectedCategory.id);
      showToast('Categoria eliminada!', 'success');
      await loadCategories();
    } catch { showToast('Erro ao eliminar', 'error'); }
    finally { setSelectedCategory(null); }
  };

  const handleToggle = async (category: Category) => {
    try {
      await categoriesService.toggleActive(category.id, !category.is_active);
      showToast(`Categoria ${!category.is_active ? 'ativada' : 'desativada'}!`, 'success');
      await loadCategories();
    } catch { showToast('Erro ao alterar estado', 'error'); }
  };

  const totalActive  = categories.filter(c => c.is_active).length;
  const totalGlobal  = categories.filter(c => c.is_global).length;
  const totalCompany = categories.filter(c => !c.is_global).length;

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setSelectedCategory(null); }}
        onConfirm={handleDelete}
        title="Eliminar categoria"
        message={`Tem a certeza que quer eliminar "${selectedCategory?.name}"? Esta ação não pode ser desfeita.`}
        canDelete={canDelete(selectedCategory!)}
      />

      <CategoryModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedCategory(null); }}
        category={selectedCategory}
        onSave={handleSave}
        canEdit={selectedCategory ? canEdit(selectedCategory) : true}
      />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium" style={{ color: C.navy }}>Categorias</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isAdmin ? 'Gere todas as categorias da plataforma.'
              : isCompany ? 'Gere as categorias da sua loja. Categorias globais são só de leitura.'
              : 'Visualiza as categorias disponíveis.'}
          </p>
        </div>
        {(isAdmin || isCompany) && (
          <button
            onClick={() => { setSelectedCategory(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium
              text-white rounded-xl transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: C.orange }}
          >
            <Plus className="w-4 h-4" />Nova categoria
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total"    value={categories.length} sub="categorias"    accent={C.navy} />
        <StatCard label="Ativas"   value={totalActive}       sub="em uso"        accent={C.orange} />
        <StatCard label="Globais"  value={totalGlobal}       sub="do sistema"    accent="#5B8DB8" />
        <StatCard label="Por loja" value={totalCompany}      sub="personalizadas" accent="#A0BAD0" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-3
        flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar categorias..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100
              rounded-xl focus:outline-none transition-colors"
            style={{ color: C.navy }}
            onFocus={e => e.target.style.borderColor = C.orange}
            onBlur={e => e.target.style.borderColor = '#F3F4F6'}
          />
        </div>
        <div className="flex gap-2">
          <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl
              text-gray-500 focus:outline-none cursor-pointer flex-1 sm:flex-none"
            style={{ color: C.navy }}
          >
            <option value="all">Todos os estados</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
          {(isAdmin || isCompany) && (
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl
                text-gray-500 focus:outline-none cursor-pointer flex-1 sm:flex-none"
              style={{ color: C.navy }}
            >
              <option value="all">Todas</option>
              <option value="global">Globais</option>
              {isCompany && <option value="company">Minhas</option>}
            </select>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: C.orange, borderTopColor: 'transparent' }} />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white
          border border-gray-100 rounded-2xl gap-3">
          <FolderPlus className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma categoria encontrada</p>
          {(isAdmin || isCompany) && (
            <button onClick={() => { setSelectedCategory(null); setShowModal(true); }}
              className="text-sm font-medium hover:underline"
              style={{ color: C.orange }}
            >Criar primeira categoria</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <CategoryCard
                category={cat}
                canEdit={canEdit(cat)}
                canDelete={canDelete(cat)}
                onEdit={() => { setSelectedCategory(cat); setShowModal(true); }}
                onDelete={() => { setSelectedCategory(cat); setShowConfirm(true); }}
                onToggle={() => handleToggle(cat)}
              />
            </motion.div>
          ))}

          {(isAdmin || isCompany) && (
            <button
              onClick={() => { setSelectedCategory(null); setShowModal(true); }}
              className="border border-dashed border-gray-200 rounded-2xl min-h-[220px]
                flex flex-col items-center justify-center gap-3 transition-all group"
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.orange;
                (e.currentTarget as HTMLElement).style.background = C.orangeLight;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="w-11 h-11 rounded-full border border-dashed border-gray-200
                flex items-center justify-center text-gray-400 group-hover:border-orange-300
                group-hover:text-orange-500 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-orange-500 transition-colors">
                Adicionar categoria
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}