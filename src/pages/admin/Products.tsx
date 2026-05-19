import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit, Trash2, Filter, Package, AlertCircle, X,
  CheckCircle2, Clock, XCircle, Upload, Image as ImageIcon,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Star, StarOff, Camera, MoveUp, MoveDown, MoreVertical,
  Loader2, RefreshCw, BarChart3, TrendingUp, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsService, Product, CreateProductData, ProductStats, ProductImage } from '../../services/products';
import { categoriesService, Category } from '../../services/categories';
import { getCurrentUser } from '../../services/auth';
import { formatCurrency } from '../../utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface ToastState { message: string; type: ToastType; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { pill: string; dot: string; label: string; icon: React.ElementType }> = {
  active:       { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', label: 'Activo',         icon: CheckCircle2 },
  draft:        { pill: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400',    label: 'Rascunho',      icon: Clock },
  out_of_stock: { pill: 'bg-red-50 text-red-600 border-red-100',             dot: 'bg-red-500',     label: 'Sem Stock',   icon: XCircle },
  discontinued: { pill: 'bg-zinc-100 text-zinc-500 border-zinc-200',         dot: 'bg-zinc-400',    label: 'Descontinuado', icon: XCircle },
};
const getStatus = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG.draft;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.95 }}
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm px-4 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 ${bg} text-white`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="font-semibold text-sm flex-1">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">
            Cancelar
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-sm shadow-lg shadow-red-500/20">
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Image Manager Modal ──────────────────────────────────────────────────────
function ImageManagerModal({ isOpen, onClose, product, onImagesUpdated }: {
  isOpen: boolean; onClose: () => void; product: Product; onImagesUpdated: () => void;
}) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [inlineToast, setInlineToast] = useState<{ message: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!product) return;
    const imgs: ProductImage[] = [];
    if (product.additional_images?.length) imgs.push(...product.additional_images);
    if (product.image_url && !imgs.some(i => i.url === product.image_url)) {
      imgs.unshift({ id: 0, url: product.image_url, is_primary: true, order: 0 });
    }
    setImages(imgs);
  }, [product]);

  const notify = (message: string, ok: boolean) => {
    setInlineToast({ message, ok });
    setTimeout(() => setInlineToast(null), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (valid.length !== files.length) { notify('Algumas imagens excedem 2MB', false); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      valid.forEach(f => fd.append('additional_images', f));
      await productsService.uploadAdditionalImages(product.id, fd);
      notify(`${valid.length} imagem(ns) adicionada(s)!`, true);
      onImagesUpdated();
    } catch { notify('Erro ao fazer upload', false); }
    finally { setUploading(false); }
  };

  const handleSetPrimary = async (id: number) => {
    try { await productsService.setPrimaryImage(product.id, id); notify('Imagem principal definida!', true); onImagesUpdated(); }
    catch { notify('Erro ao definir imagem principal', false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar esta imagem?')) return;
    try { await productsService.deleteImage(product.id, id); notify('Imagem eliminada!', true); onImagesUpdated(); }
    catch { notify('Erro ao eliminar imagem', false); }
  };

  const moveImage = (idx: number, dir: 'up' | 'down') => {
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= images.length) return;
    const next = [...images];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    next.forEach((img, i) => { img.order = i; });
    setImages(next);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {/* header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Camera className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</p>
              <h2 className="text-sm font-black text-gray-800">Gerenciar Imagens</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* inline toast */}
        <AnimatePresence>
          {inlineToast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mx-5 mt-3 px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 ${
                inlineToast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {inlineToast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* upload zone */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Adicionar Imagens</label>
            <label htmlFor="img-upload" className="block border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-all group">
              <Upload className="w-7 h-7 text-gray-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-gray-500 font-medium">{uploading ? 'A enviar…' : 'Clique para seleccionar imagens'}</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · máx. 2MB por ficheiro</p>
              <input id="img-upload" type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {/* image list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Imagens</label>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{images.length}</span>
            </div>
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={img.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {img.is_primary && (
                      <span className="inline-block px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded-full mb-1">Principal</span>
                    )}
                    <p className="text-[10px] text-gray-400">ID {img.id} · Ordem {img.order}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={img.is_primary}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Definir Principal
                      </button>
                      <button onClick={() => handleDelete(img.id)} className="text-[10px] font-bold px-2.5 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-300 hover:text-orange-500 disabled:opacity-30 transition-colors">
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1} className="p-1.5 text-gray-300 hover:text-orange-500 disabled:opacity-30 transition-colors">
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <div className="flex flex-col items-center py-10 text-center">
                  <Camera className="w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Nenhuma imagem cadastrada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all text-sm">
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[10px] font-bold mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-gray-50 border ${err ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder-gray-300`;

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({ isOpen, onClose, product, onSave, categories }: {
  isOpen: boolean; onClose: () => void; product?: Product | null;
  onSave: (data: CreateProductData) => Promise<void>; categories: Category[];
}) {
  const blank: CreateProductData = {
    name: '', description: '', price: 0, stock: 0,
    category: categories[0]?.id || 0, image: null,
    additional_images: [], status: 'draft', is_featured: false
  };
  const [form, setForm] = useState<CreateProductData>(blank);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [addPreviews, setAddPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setForm({ name: product.name || '', description: product.description || '', price: product.price || 0, stock: product.stock || 0, category: product.category, image: null, additional_images: [], status: product.status, is_featured: product.is_featured });
      setImgPreview(product.image_url || null);
    } else {
      setForm(blank);
      setImgPreview(null);
    }
    setAddPreviews([]);
    setErrors({});
  }, [product, isOpen]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked
      : (name === 'price' || name === 'stock') ? Number(value) : value;
    setForm(p => ({ ...p, [name]: val }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(p => ({ ...p, image: 'Máximo 2MB' })); return; }
    setForm(p => ({ ...p, image: file }));
    const r = new FileReader();
    r.onloadend = () => setImgPreview(r.result as string);
    r.readAsDataURL(file);
  };

  const handleAddImgs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 2 * 1024 * 1024);
    if (valid.length !== files.length) { setErrors(p => ({ ...p, additional_images: 'Algumas imagens excedem 2MB' })); return; }
    setForm(p => ({ ...p, additional_images: [...(p.additional_images || []), ...valid] }));
    valid.forEach(f => { const r = new FileReader(); r.onloadend = () => setAddPreviews(p => [...p, r.result as string]); r.readAsDataURL(f); });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim() || form.name.length < 3) e.name = 'Nome deve ter pelo menos 3 caracteres';
    if (form.price <= 0) e.price = 'Preço deve ser maior que zero';
    if (form.stock < 0) e.stock = 'Stock não pode ser negativo';
    if (!form.category) e.category = 'Categoria obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { /* toast handled upstream */ }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[96dvh] sm:max-h-[92vh] sm:my-4"
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {/* header */}
        <div className="flex items-center justify-between px-5 sm:px-8 pt-4 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-black text-gray-800">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* body */}
        <form id="product-form" onSubmit={submit} className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-5">

          {/* Main image */}
          <FormField label="Imagem Principal" error={errors.image}>
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                  {imgPreview
                    ? <img src={imgPreview} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon className="w-8 h-8 text-gray-300" />}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImg} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {imgPreview && (
                  <button type="button" onClick={() => { setForm(p => ({ ...p, image: null })); setImgPreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow">
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-xs text-gray-400 leading-relaxed pt-1">
                <p className="font-semibold text-gray-600 mb-0.5">Upload de imagem</p>
                <p>JPG, PNG, WEBP · máx. 2MB</p>
                <p className="mt-1 text-[10px]">Clique na área para seleccionar</p>
              </div>
            </div>
          </FormField>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Nome do Produto" required error={errors.name}>
                <input type="text" name="name" value={form.name} onChange={handle} placeholder="Ex: Smartphone Galaxy S25" className={inputCls(errors.name)} />
              </FormField>
            </div>

            <FormField label="Categoria" required error={errors.category}>
              <select name="category" value={form.category} onChange={handle} className={inputCls(errors.category)}>
                <option value="">Seleccione…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>

            <FormField label="Estado">
              <select name="status" value={form.status} onChange={handle} className={inputCls()}>
                <option value="active">Activo</option>
                <option value="draft">Rascunho</option>
                <option value="out_of_stock">Sem Stock</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </FormField>

            <FormField label="Preço (Kz)" required error={errors.price}>
              <input type="number" name="price" value={form.price} onChange={handle} min="0" step="0.01" placeholder="0,00" className={inputCls(errors.price)} />
            </FormField>

            <FormField label="Stock" required error={errors.stock}>
              <input type="number" name="stock" value={form.stock} onChange={handle} min="0" placeholder="0" className={inputCls(errors.stock)} />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Descrição">
                <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Descreva o produto…" className={`${inputCls()} resize-none`} />
              </FormField>
            </div>
          </div>

          {/* Additional images */}
          <FormField label="Imagens Adicionais" error={errors.additional_images}>
            <input type="file" accept="image/*" multiple onChange={handleAddImgs} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all" />
            {addPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {addPreviews.map((src, i) => (
                  <div key={i} className="relative w-14 h-14">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={() => { setForm(p => ({ ...p, additional_images: p.additional_images?.filter((_, j) => j !== i) })); setAddPreviews(p => p.filter((_, j) => j !== i)); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black hover:bg-red-600">×</button>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handle} className="w-4 h-4 rounded accent-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">Produto em destaque</p>
              <p className="text-xs text-gray-400 mt-0.5">Aparecerá na secção de destaques da loja</p>
            </div>
            {form.is_featured ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <StarOff className="w-5 h-5 text-gray-300" />}
          </label>
        </form>

        {/* footer */}
        <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">
            Cancelar
          </button>
          <button type="submit" form="product-form" disabled={saving}
            className="flex-[2] py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> A processar…</> : product ? 'Guardar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, totalItems }: {
  currentPage: number; totalPages: number; onPageChange: (p: number) => void; totalItems: number;
}) {
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60">
      <p className="text-xs text-gray-400 font-semibold order-2 sm:order-1">
        Total de <span className="font-black text-gray-600">{totalItems}</span> produtos
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
          className="w-8 h-8 rounded-xl text-gray-400 hover:text-orange-500 disabled:opacity-30 flex items-center justify-center transition-colors">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) => (
          <button key={i} onClick={() => typeof p === 'number' ? onPageChange(p) : undefined}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
              p === currentPage ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
              : p === '…' ? 'text-gray-300 cursor-default'
              : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:text-orange-500'
            }`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-xl text-gray-400 hover:text-orange-500 disabled:opacity-30 flex items-center justify-center transition-colors">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg font-black text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Mobile Product Card ──────────────────────────────────────────────────────
function ProductCard({ product, isAdmin, onEdit, onDelete, onImages }: {
  product: Product; isAdmin: boolean;
  onEdit: () => void; onDelete: () => void; onImages: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const st = getStatus(product.status);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        {/* image */}
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>}
        </div>
        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
              <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-500 rounded-lg text-[10px] font-bold mt-0.5">{product.category_name}</span>
            </div>
            {/* menu */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setMenuOpen(p => !p)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    className="absolute right-0 top-9 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 w-40 overflow-hidden"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {product.additional_images && product.additional_images.length > 0 && (
                      <button onClick={() => { onImages(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4 text-orange-400" /> Imagens
                      </button>
                    )}
                    <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <Edit className="w-4 h-4 text-blue-400" /> Editar
                    </button>
                    <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* row 2 */}
          <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
            <p className="text-base font-black text-orange-500">{formatCurrency(product.price)}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
              <span className={`text-xs font-bold ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-gray-400'}`}>
                {product.stock} un
              </span>
              {product.is_featured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
            </div>
          </div>
          {isAdmin && product.company_name && (
            <p className="text-[10px] text-gray-400 mt-1 font-medium">{product.company_name}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProductStats>({ total_products: 0, active_products: 0, out_of_stock: 0, low_stock: 0, total_value: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const user = getCurrentUser();
  const isCompany = user?.is_company;
  const isAdmin = user?.is_admin;

  const notify = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const loadCategories = useCallback(async () => {
    try { setCategories(await categoriesService.list({ is_active: true })); }
    catch { /* silent */ }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }

      const params = { page: currentPage, page_size: 30, search: searchTerm || undefined, category: selectedCategory || undefined, status: selectedStatus || undefined };
      const res = isCompany
        ? await productsService.listCompanyProducts(params)
        : await productsService.list(params);

      setProducts(res.results || []);
      setTotalItems(res.count || 0);
      setTotalPages(Math.ceil((res.count || 0) / 30));

      if (isAdmin) {
        try { setStats(await productsService.getStats()); } catch { /* silent */ }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        ['token', 'refresh', 'user'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/login';
      } else { notify('Erro ao carregar produtos', 'error'); }
    } finally { setLoading(false); }
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, isCompany, isAdmin, notify]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { if (categories.length > 0) loadProducts(); }, [loadProducts, categories]);

  const handleSave = async (data: CreateProductData) => {
    try {
      if (editing) {
        isCompany ? await productsService.updateCompanyProduct(editing.id, data) : await productsService.update(editing.id, data);
        notify('Produto actualizado!', 'success');
      } else {
        isCompany ? await productsService.createCompanyProduct(data) : await productsService.create(data);
        notify('Produto criado!', 'success');
      }
      await loadProducts();
      setEditing(null);
      setShowModal(false);
    } catch (err: any) {
      const msg = typeof err.response?.data === 'object'
        ? Object.values(err.response.data)[0] as string
        : 'Erro ao guardar produto';
      notify(msg, 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    try {
      isCompany ? await productsService.deleteCompanyProduct(editing.id) : await productsService.delete(editing.id);
      notify('Produto eliminado!', 'success');
      await loadProducts();
    } catch { notify('Erro ao eliminar produto', 'error'); }
    finally { setEditing(null); }
  };

  const openEdit = (p: Product) => { setEditing(p); setShowModal(true); };
  const openDelete = (p: Product) => { setEditing(p); setShowConfirm(true); };
  const openImages = (p: Product) => { setEditing(p); setShowImageModal(true); };
  const openNew = () => { setEditing(null); setShowModal(true); };

  const statsCards = [
    { label: 'Total', value: stats.total_products, icon: ShoppingBag, color: 'bg-[#1E3A5F]/8 text-[#1E3A5F]' },
    { label: 'Activos', value: stats.active_products, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Sem Stock', value: stats.out_of_stock, icon: XCircle, color: 'bg-red-50 text-red-500' },
    { label: 'Stock Baixo', value: stats.low_stock, icon: AlertTriangle, color: 'bg-amber-50 text-amber-500' },
    { label: 'Valor Total', value: `Kz ${formatCurrency(stats.total_value)}`, icon: TrendingUp, color: 'bg-orange-50 text-orange-500' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setEditing(null); }}
        onConfirm={handleDelete}
        title="Eliminar Produto"
        message={`Tem a certeza que deseja eliminar "${editing?.name}"? Esta acção não pode ser desfeita.`}
      />
      {editing && (
        <ImageManagerModal isOpen={showImageModal} onClose={() => { setShowImageModal(false); setEditing(null); }} product={editing} onImagesUpdated={loadProducts} />
      )}
      <ProductModal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} product={editing} onSave={handleSave} categories={categories} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">
            {isCompany ? 'Meus Produtos' : 'Gestão de Produtos'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isCompany ? 'Gerencie o catálogo da sua loja.' : 'Gerencie todos os produtos da plataforma.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadProducts} className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-orange-500 hover:border-orange-300 flex items-center justify-center transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex-1 sm:flex-auto justify-center">
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Stats – admin only */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statsCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text" placeholder="Pesquisar produtos…" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${showFilters ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {(selectedCategory || selectedStatus) && <span className="w-2 h-2 rounded-full bg-orange-300 sm:hidden" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Categoria</label>
                  <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                    <option value="">Todas as categorias</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Estado</label>
                  <select value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all">
                    <option value="">Todos os estados</option>
                    <option value="active">Activo</option>
                    <option value="draft">Rascunho</option>
                    <option value="out_of_stock">Sem Stock</option>
                    <option value="discontinued">Descontinuado</option>
                  </select>
                </div>
                {(selectedCategory || selectedStatus) && (
                  <button onClick={() => { setSelectedCategory(''); setSelectedStatus(''); setCurrentPage(1); }}
                    className="sm:col-span-2 text-xs text-orange-500 font-bold hover:text-orange-600 text-left transition-colors">
                    Limpar filtros
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products – Desktop Table + Mobile Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">A carregar produtos…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
              <Package className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1.5">Nenhum produto encontrado</h3>
            <p className="text-sm text-gray-400 mb-5">
              {searchTerm || selectedCategory || selectedStatus ? 'Tente ajustar os filtros de pesquisa.' : 'Comece criando o seu primeiro produto.'}
            </p>
            <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Criar produto
            </button>
          </div>
        ) : (
          <>
            {/* ── Mobile Cards (< md) ── */}
            <div className="block md:hidden divide-y divide-gray-50">
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalItems} produtos</p>
              </div>
              <div className="p-3 space-y-2.5">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} isAdmin={!!isAdmin}
                    onEdit={() => openEdit(p)} onDelete={() => openDelete(p)} onImages={() => openImages(p)} />
                ))}
              </div>
            </div>

            {/* ── Desktop Table (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Estado</th>
                    {isAdmin && <th className="px-6 py-4">Empresa</th>}
                    <th className="px-6 py-4 text-center">Dest.</th>
                    <th className="px-6 py-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => {
                    const st = getStatus(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                              {p.image_url
                                ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm leading-tight">{p.name}</p>
                              {p.additional_images && p.additional_images.length > 0 && (
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Camera className="w-3 h-3" />+{p.additional_images.length} img
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-orange-50 text-orange-500 border border-orange-100 rounded-lg text-[10px] font-bold">{p.category_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-orange-500 text-sm">{formatCurrency(p.price)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {p.stock > 0 && p.stock < 5 && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
                            <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-orange-500' : 'text-gray-600'}`}>
                              {p.stock} un
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${st.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500 font-medium">{p.company_name || '—'}</span>
                           </td>
                        )}
                        <td className="px-6 py-4 text-center">
                          {p.is_featured
                            ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mx-auto" />
                            : <StarOff className="w-4 h-4 text-gray-200 mx-auto" />}
                         </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {p.additional_images && p.additional_images.length > 0 && (
                              <button onClick={() => openImages(p)} className="w-8 h-8 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center transition-colors" title="Imagens">
                                <Camera className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDelete(p)} className="w-8 h-8 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} />
            )}
          </>
        )}
      </div>
    </div>
  );
}