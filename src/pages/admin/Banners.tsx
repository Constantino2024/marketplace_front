import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit, Trash2, Image as ImageIcon, X, AlertCircle,
  CheckCircle2, Upload, MoveUp, MoveDown, Link as LinkIcon, Type,
  Eye, EyeOff, MoreVertical, RefreshCw, AlertTriangle, Loader2,
  LayoutTemplate, Megaphone, PanelRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { homeService, Banner } from '../../services/home';
import api from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

const POSITION_MAP: Record<number, { label: string; pill: string; icon: React.ElementType }> = {
  1: { label: 'Hero',    pill: 'bg-violet-50 text-violet-700 border-violet-100', icon: LayoutTemplate },
  2: { label: 'Promo',   pill: 'bg-orange-50 text-orange-600 border-orange-100', icon: Megaphone },
  3: { label: 'Sidebar', pill: 'bg-sky-50 text-sky-700 border-sky-100',          icon: PanelRight },
};
const getPos = (p: number) => POSITION_MAP[p] ?? POSITION_MAP[2];

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

// ─── Field Helper ─────────────────────────────────────────────────────────────
const inputCls = (err?: string) =>
  `w-full bg-gray-50 border ${err ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder-gray-300`;

function FormField({ label, required, optional, error, children }: {
  label: string; required?: boolean; optional?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
        {required && <span className="text-red-400">*</span>}
        {optional && <span className="text-gray-300 normal-case font-normal">(opcional)</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-[10px] font-bold mt-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Banner Modal ─────────────────────────────────────────────────────────────
function BannerModal({ isOpen, onClose, banner, onSave }: {
  isOpen: boolean; onClose: () => void; banner?: Banner | null;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const blank = { title: '', subtitle: '', description: '', link: '', position: 2, discount_text: '', button_text: 'Comprar agora', is_active: true };
  const [form, setForm] = useState(blank);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (banner) {
      setForm({ title: banner.title || '', subtitle: banner.subtitle || '', description: banner.description || '', link: banner.link || '', position: banner.position ?? 2, discount_text: banner.discount_text || '', button_text: banner.button_text || 'Comprar agora', is_active: banner.is_active ?? true });
      setImgPreview(banner.image_url || null);
    } else {
      setForm(blank);
      setImgPreview(null);
      setImgFile(null);
    }
    setErrors({});
  }, [banner, isOpen]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(p => ({ ...p, [name]: val }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, image: 'Máximo 5MB' })); return; }
    setImgFile(file);
    const r = new FileReader();
    r.onloadend = () => setImgPreview(r.result as string);
    r.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Título é obrigatório';
    if (!imgPreview && !banner) e.image = 'Imagem é obrigatória para novos banners';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imgFile) fd.append('image', imgFile);
      await onSave(fd);
      onClose();
    } catch { /* handled upstream */ }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
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
          <div>
            <h2 className="text-lg font-black text-gray-800">{banner ? 'Editar Banner' : 'Novo Banner'}</h2>
            {banner && <p className="text-xs text-gray-400 mt-0.5">Editando: <span className="font-bold text-orange-500">{banner.title}</span></p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* scrollable body */}
        <form id="banner-form" onSubmit={submit} className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5">

          {/* Image upload */}
          <FormField label="Imagem do Banner" required error={errors.image}>
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <label className="block w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer group hover:border-orange-400 transition-colors bg-gray-50">
                  {imgPreview
                    ? <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="w-7 h-7 text-gray-300 group-hover:text-orange-400 transition-colors" />
                        <span className="text-[10px] text-gray-400 font-medium">Clique</span>
                      </div>}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImg} className="hidden" />
                </label>
                {imgPreview && (
                  <button type="button" onClick={() => { setImgFile(null); setImgPreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow">
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-xs text-gray-400 leading-relaxed pt-1">
                <p className="font-semibold text-gray-600 mb-1 text-sm">Upload de imagem</p>
                <p>JPG, PNG, WEBP</p>
                <p>Máximo 5MB</p>
                <p className="mt-2 text-[10px] text-gray-300">Resolução recomendada: 1920×600px para Hero</p>
              </div>
            </div>
          </FormField>

          {/* Title */}
          <FormField label="Título" required error={errors.title}>
            <div className="relative">
              <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input type="text" name="title" value={form.title} onChange={handle} placeholder="Ex: Summer Collection" className={`${inputCls(errors.title)} pl-10`} />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subtitle */}
            <FormField label="Subtítulo" optional>
              <input type="text" name="subtitle" value={form.subtitle} onChange={handle} placeholder="Ex: SS'24" className={inputCls()} />
            </FormField>

            {/* Position */}
            <FormField label="Posição">
              <select name="position" value={form.position} onChange={handle} className={inputCls()}>
                <option value={1}>Hero (Slide principal)</option>
                <option value={2}>Promo (Banners promocionais)</option>
                <option value={3}>Sidebar (Barra lateral)</option>
              </select>
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Descrição" optional>
            <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Descrição do banner…" className={`${inputCls()} resize-none`} />
          </FormField>

          {/* Link */}
          <FormField label="Link" optional>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input type="url" name="link" value={form.link} onChange={handle} placeholder="https://exemplo.com/promocao" className={`${inputCls()} pl-10`} />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount text */}
            <FormField label="Texto de Desconto" optional>
              <input type="text" name="discount_text" value={form.discount_text} onChange={handle} placeholder="Ex: SALE UP TO 50%" className={inputCls()} />
            </FormField>

            {/* Button text */}
            <FormField label="Texto do Botão">
              <input type="text" name="button_text" value={form.button_text} onChange={handle} placeholder="Comprar agora" className={inputCls()} />
            </FormField>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handle} className="w-4 h-4 rounded accent-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">Banner ativo</p>
              <p className="text-xs text-gray-400 mt-0.5">Visível na loja para os clientes</p>
            </div>
            {form.is_active
              ? <Eye className="w-4 h-4 text-emerald-500" />
              : <EyeOff className="w-4 h-4 text-gray-300" />}
          </label>
        </form>

        {/* footer */}
        <div className="px-5 sm:px-8 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">
            Cancelar
          </button>
          <button type="submit" form="banner-form" disabled={saving}
            className="flex-[2] py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />A processar…</>
              : banner ? 'Atualizar Banner' : 'Criar Banner'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Mobile Banner Card ───────────────────────────────────────────────────────
function BannerCard({ banner, index, total, onEdit, onDelete, onToggle, onMove }: {
  banner: Banner; index: number; total: number;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pos = getPos(banner.position);
  const PosIcon = pos.icon;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* image strip */}
      <div className="relative h-28 bg-gray-100 overflow-hidden">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* overlays */}
        <div className="absolute bottom-2 left-3 right-10">
          <p className="text-white font-black text-sm leading-tight truncate">{banner.title}</p>
          {banner.subtitle && <p className="text-white/70 text-xs truncate">{banner.subtitle}</p>}
        </div>
        {/* status dot */}
        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white ${banner.is_active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
      </div>

      <div className="p-3 flex items-center gap-2">
        {/* position pill */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${pos.pill} flex-shrink-0`}>
          <PosIcon className="w-3 h-3" /> {pos.label}
        </span>

        {/* order controls */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button onClick={() => onMove('up')} disabled={index === 0} className="w-7 h-7 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center disabled:opacity-30 transition-colors">
            <MoveUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMove('down')} disabled={index === total - 1} className="w-7 h-7 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center disabled:opacity-30 transition-colors">
            <MoveDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* status toggle */}
        <button onClick={onToggle} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${banner.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
          {banner.is_active ? 'Ativo' : 'Inativo'}
        </button>

        {/* context menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute right-0 bottom-8 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 w-36 overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filtered, setFiltered] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<number | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const notify = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homeService.getBanners();
      setBanners(data);
    } catch { notify('Erro ao carregar banners', 'error'); }
    finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  // filter
  useEffect(() => {
    let list = banners;
    if (searchTerm) list = list.filter(b =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (posFilter !== 'all') list = list.filter(b => b.position === posFilter);
    setFiltered(list);
  }, [searchTerm, posFilter, banners]);

  const move = async (id: number, dir: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= banners.length) return;
    const next = [...banners];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    try {
      await Promise.all([
        api.patch(`banners/${next[idx].id}/`, { order: idx }),
        api.patch(`banners/${next[swap].id}/`, { order: swap }),
      ]);
      setBanners(next);
      notify('Ordem atualizada!', 'success');
    } catch { notify('Erro ao atualizar ordem', 'error'); }
  };

  const handleSave = async (fd: FormData) => {
    try {
      if (selected) {
        await api.put(`banners/${selected.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Banner atualizado!', 'success');
      } else {
        await api.post('banners/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('Banner criado!', 'success');
      }
      await load();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'object'
        ? String(Object.values(err.response.data)[0])
        : 'Erro ao salvar banner';
      notify(msg, 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`banners/${selected.id}/`);
      notify('Banner eliminado!', 'success');
      await load();
    } catch { notify('Erro ao eliminar banner', 'error'); }
    finally { setSelected(null); }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await api.patch(`banners/${banner.id}/`, { is_active: !banner.is_active });
      notify(`Banner ${!banner.is_active ? 'ativado' : 'desativado'}!`, 'success');
      await load();
    } catch { notify('Erro ao alterar status', 'error'); }
  };

  const openEdit = (b: Banner) => { setSelected(b); setShowModal(true); };
  const openDelete = (b: Banner) => { setSelected(b); setShowConfirm(true); };
  const openNew = () => { setSelected(null); setShowModal(true); };

  // stats
  const activeCount = banners.filter(b => b.is_active).length;

  return (
    <div className="space-y-5 sm:space-y-6 pb-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Modals */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Eliminar Banner"
        message={`Tem certeza que deseja eliminar "${selected?.title}"? Esta ação não pode ser desfeita.`}
      />
      <BannerModal isOpen={showModal} onClose={() => { setShowModal(false); setSelected(null); }} banner={selected} onSave={handleSave} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">Gestão de Banners</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gerencie os banners da página inicial.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-orange-500 hover:border-orange-300 flex items-center justify-center transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex-1 sm:flex-auto justify-center">
            <Plus className="w-4 h-4" />
            <span>Novo Banner</span>
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: banners.length, color: 'text-gray-800' },
          { label: 'Ativos', value: activeCount, color: 'text-emerald-600' },
          { label: 'Inativos', value: banners.length - activeCount, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" placeholder="Pesquisar banners…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all" />
        </div>
        <select value={posFilter} onChange={e => setPosFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all sm:w-44">
          <option value="all">Todas as posições</option>
          <option value={1}>Hero</option>
          <option value={2}>Promo</option>
          <option value={3}>Sidebar</option>
        </select>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">Carregando banners…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
              <ImageIcon className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1.5">
              {searchTerm || posFilter !== 'all' ? 'Nenhum banner encontrado' : 'Sem banners'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {searchTerm || posFilter !== 'all' ? 'Tente ajustar a pesquisa ou os filtros.' : 'Crie o seu primeiro banner agora.'}
            </p>
            {!(searchTerm || posFilter !== 'all') && (
              <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Criar banner
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile Cards (< md) ── */}
            <div className="block md:hidden">
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} banner{filtered.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((b, i) => (
                  <BannerCard key={b.id} banner={b} index={i} total={filtered.length}
                    onEdit={() => openEdit(b)} onDelete={() => openDelete(b)} onToggle={() => toggleActive(b)}
                    onMove={dir => move(b.id, dir)} />
                ))}
              </div>
            </div>

            {/* ── Desktop Table (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Imagem</th>
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Posição</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Ordem</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((banner, idx) => {
                    const pos = getPos(banner.position);
                    const PosIcon = pos.icon;
                    return (
                      <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors group">
                        {/* thumb */}
                        <td className="px-6 py-4">
                          <div className="w-20 h-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        {/* title */}
                        <td className="px-6 py-4 max-w-[200px]">
                          <p className="font-bold text-gray-800 text-sm truncate">{banner.title}</p>
                          {banner.subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{banner.subtitle}</p>}
                        </td>
                        {/* position */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${pos.pill}`}>
                            <PosIcon className="w-3 h-3" />{pos.label}
                          </span>
                        </td>
                        {/* status */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(banner)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              banner.is_active
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {banner.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        {/* order */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-500 w-5 text-center">{banner.order ?? idx}</span>
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => move(banner.id, 'up')} disabled={idx === 0}
                                className="w-6 h-6 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center disabled:opacity-30 transition-colors">
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => move(banner.id, 'down')} disabled={idx === filtered.length - 1}
                                className="w-6 h-6 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 flex items-center justify-center disabled:opacity-30 transition-colors">
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        {/* actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(banner)} className="w-8 h-8 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors" title="Editar">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDelete(banner)} className="w-8 h-8 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Eliminar">
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
          </>
        )}
      </div>
    </div>
  );
}