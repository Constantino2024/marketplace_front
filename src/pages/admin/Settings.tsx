import React, { useState, useEffect } from 'react';
import {
  Save,
  Globe,
  Truck,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Phone,
  MapPin,
  Settings as SettingsIcon,
  Package,
  Percent,
  DollarSign,
  Search,
  Leaf,
  BadgePercent,
  Tag,
  Gift,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { siteConfigService, SiteConfig, Feature } from '../../services/siteConfig';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 text-sm ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

// Feature Icons disponíveis
const availableIcons = [
  { name: 'Leaf', icon: Leaf, color: 'text-green-500' },
  { name: 'Truck', icon: Truck, color: 'text-blue-500' },
  { name: 'BadgePercent', icon: BadgePercent, color: 'text-red-500' },
  { name: 'Tag', icon: Tag, color: 'text-orange-500' },
  { name: 'Gift', icon: Gift, color: 'text-purple-500' },
  { name: 'Package', icon: Package, color: 'text-indigo-500' },
  { name: 'Globe', icon: Globe, color: 'text-teal-500' },
  { name: 'Search', icon: Search, color: 'text-cyan-500' },
];

const iconColors = [
  'text-green-500', 'text-blue-500', 'text-red-500', 'text-orange-500',
  'text-purple-500', 'text-indigo-500', 'text-teal-500', 'text-cyan-500',
  'text-pink-500', 'text-yellow-500', 'text-emerald-500', 'text-rose-500'
];

export default function AdminSettings() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>({ icon: 'Leaf', text: '', color: 'text-green-500' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await siteConfigService.getConfig();
      setConfig(data);
    } catch (error) {
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field: keyof SiteConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await siteConfigService.updateConfig(config);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.text.trim()) {
      showToast('Digite o texto do recurso', 'error');
      return;
    }
    setConfig(prev => prev ? {
      ...prev,
      features: [...prev.features, { ...newFeature }]
    } : null);
    setNewFeature({ icon: 'Leaf', text: '', color: 'text-green-500' });
    setShowAddFeatureModal(false);
  };

  const handleRemoveFeature = (index: number) => {
    setConfig(prev => prev ? {
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    } : null);
  };

  const handleUpdateFeature = (index: number, field: keyof Feature, value: string) => {
    setConfig(prev => prev ? {
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
    } : null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !config) return;
    const items = Array.from(config.features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setConfig({ ...config, features: items });
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'shipping', label: 'Frete', icon: Truck },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'features', label: 'Recursos', icon: Gift },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'social', label: 'Redes Sociais', icon: Facebook },
    { id: 'contact', label: 'Contato', icon: Phone },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as configurações gerais do site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-0 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-xl ${
                isActive
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Geral */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={config.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                  Produtos por Página
                </label>
                <input
                  type="number"
                  value={config.products_per_page}
                  onChange={(e) => handleChange('products_per_page', parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Descrição do Site
              </label>
              <textarea
                value={config.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Frete */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Valor mínimo para frete grátis (Kz)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={config.free_shipping_threshold}
                  onChange={(e) => handleChange('free_shipping_threshold', parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Pedidos acima deste valor terão frete grátis</p>
            </div>
          </div>
        )}

        {/* Newsletter */}
        {activeTab === 'newsletter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Desconto da Newsletter (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={config.newsletter_discount}
                  onChange={(e) => handleChange('newsletter_discount', parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Valor do Desconto (Kz)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={config.newsletter_discount_amount}
                  onChange={(e) => handleChange('newsletter_discount_amount', parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recursos da Home */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Recursos da Página Inicial</h3>
                <p className="text-sm text-gray-500 mt-1">Arraste para reordenar, edite ou remova recursos</p>
              </div>
              <button
                onClick={() => setShowAddFeatureModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Adicionar Recurso
              </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="features">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {config.features.map((feature, index) => {
                      const IconComponent = availableIcons.find(i => i.name === feature.icon)?.icon || Leaf;
                      return (
                        <Draggable key={index} draggableId={`feature-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4"
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              
                              <div className="flex items-center gap-3 flex-1">
                                <select
                                  value={feature.icon}
                                  onChange={(e) => handleUpdateFeature(index, 'icon', e.target.value)}
                                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  {availableIcons.map(icon => (
                                    <option key={icon.name} value={icon.name}>{icon.name}</option>
                                  ))}
                                </select>
                                
                                <input
                                  type="text"
                                  value={feature.text}
                                  onChange={(e) => handleUpdateFeature(index, 'text', e.target.value)}
                                  placeholder="Texto do recurso"
                                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                
                                <select
                                  value={feature.color}
                                  onChange={(e) => handleUpdateFeature(index, 'color', e.target.value)}
                                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  {iconColors.map(color => (
                                    <option key={color} value={color} className={color}>{color.replace('text-', '').replace('-500', '')}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveFeature(index)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {config.features.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Nenhum recurso adicionado</p>
                <button
                  onClick={() => setShowAddFeatureModal(true)}
                  className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  + Adicionar primeiro recurso
                </button>
              </div>
            )}
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={config.meta_title}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Meta Description
              </label>
              <textarea
                value={config.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                Meta Keywords (separadas por vírgula)
              </label>
              <input
                type="text"
                value={config.meta_keywords}
                onChange={(e) => handleChange('meta_keywords', e.target.value)}
                placeholder="ex: marketplace, compras online, angola"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Redes Sociais */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
              </label>
              <input
                type="url"
                value={config.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/sua-pagina"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
              </label>
              <input
                type="url"
                value={config.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/seu-perfil"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Linkedin className="w-3.5 h-3.5 text-sky-500" /> Linkedin
              </label>
              <input
                type="url"
                value={config.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://Linkedin.com/seu-perfil"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Contato */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email de Contato
              </label>
              <input
                type="email"
                value={config.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Telefone de Contato
              </label>
              <input
                type="tel"
                value={config.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Endereço
              </label>
              <textarea
                value={config.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal para Adicionar Recurso */}
      <AnimatePresence>
        {showAddFeatureModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900">Adicionar Recurso</h3>
                <button
                  onClick={() => setShowAddFeatureModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">Ícone</label>
                  <select
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {availableIcons.map(icon => (
                      <option key={icon.name} value={icon.name}>{icon.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">Texto</label>
                  <input
                    type="text"
                    value={newFeature.text}
                    onChange={(e) => setNewFeature({ ...newFeature, text: e.target.value })}
                    placeholder="Ex: Entrega rápida em todo país"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">Cor</label>
                  <select
                    value={newFeature.color}
                    onChange={(e) => setNewFeature({ ...newFeature, color: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {iconColors.map(color => (
                      <option key={color} value={color} className={color}>{color.replace('text-', '').replace('-500', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddFeatureModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddFeature}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}