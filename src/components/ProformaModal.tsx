import React, { useState } from 'react';
import { X, Download, Loader2, AlertCircle, User, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { proformaService, ProformaData } from '../services/proforma';
import { formatCurrency } from '../utils/currency';

interface ProformaModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    company_name?: string;
  }>;
  total: number;
}

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    } text-white`}
  >
    {type === 'success' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <AlertCircle className="w-5 h-5" />
    )}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-4 hover:opacity-80">×</button>
  </motion.div>
);

export default function ProformaModal({ isOpen, onClose, items, total }: ProformaModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_city: 'Luanda',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Funções de validação
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Nome é obrigatório';
    }
    if (name.trim().length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim())) {
      return 'Nome deve conter apenas letras';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email é obrigatório';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return 'Telefone é obrigatório';
    }
    
    // Remover caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verificar se tem 9 dígitos (Angola)
    if (cleanPhone.length !== 9) {
      return 'Telefone deve ter exatamente 9 dígitos';
    }
    
    // Verificar se começa com 9 (códigos angolanos: 9...)
    if (!cleanPhone.startsWith('9')) {
      return 'Telefone deve começar com 9';
    }
    
    return '';
  };

  const validateAddress = (address: string): string => {
    if (!address.trim()) {
      return 'Endereço é obrigatório';
    }
    if (address.trim().length < 5) {
      return 'Endereço muito curto';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar em tempo real
    let error = '';
    if (name === 'customer_name') error = validateName(value);
    if (name === 'customer_email') error = validateEmail(value);
    if (name === 'customer_phone') error = validatePhone(value);
    if (name === 'customer_address') error = validateAddress(value);
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar ao perder o foco
    let error = '';
    if (name === 'customer_name') error = validateName(formData.customer_name);
    if (name === 'customer_email') error = validateEmail(formData.customer_email);
    if (name === 'customer_phone') error = validatePhone(formData.customer_phone);
    if (name === 'customer_address') error = validateAddress(formData.customer_address);
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    newErrors.customer_name = validateName(formData.customer_name);
    newErrors.customer_email = validateEmail(formData.customer_email);
    newErrors.customer_phone = validatePhone(formData.customer_phone);
    newErrors.customer_address = validateAddress(formData.customer_address);
    
    setErrors(newErrors);
    
    // Marcar todos os campos como tocados
    setTouched({
      customer_name: true,
      customer_email: true,
      customer_phone: true,
      customer_address: true,
      customer_city: true,
    });
    
    return Object.values(newErrors).every(error => error === '');
  };

  // Formatar telefone enquanto digita
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 9) {
      return cleaned;
    }
    return cleaned.slice(0, 9);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, customer_phone: formatted }));
    
    const error = validatePhone(formatted);
    setErrors(prev => ({ ...prev, customer_phone: error }));
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const proformaData: ProformaData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        customer_city: formData.customer_city,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          company_name: item.company_name
        })),
        total: total,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await proformaService.downloadProforma(proformaData, `proforma_${formData.customer_name.replace(/\s/g, '_')}.pdf`);
      
      if (result.success) {
        setToast({ message: 'Fatura Proforma gerada com sucesso!', type: 'success' });
        setTimeout(() => {
          onClose();
          setToast(null);
          // Resetar formulário
          setFormData({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_address: '',
            customer_city: 'Luanda',
          });
          setErrors({});
          setTouched({});
        }, 1500);
      } else {
        setToast({ message: result.error || 'Erro ao gerar fatura', type: 'error' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setToast({ message: 'Erro ao gerar fatura. Tente novamente.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Agrupar itens por loja
  const groupedByStore = items.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof items>);

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black">Fatura Proforma</h2>
                <p className="text-xs text-white/80">Pré-fatura para orçamento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Informações do Cliente */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-900" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Completo */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-gray-50 border ${
                        touched.customer_name && errors.customer_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                      } rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition-all`}
                      placeholder="João Silva"
                    />
                  </div>
                  {touched.customer_name && errors.customer_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customer_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-gray-50 border ${
                        touched.customer_email && errors.customer_email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                      } rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition-all`}
                      placeholder="cliente@email.com"
                    />
                  </div>
                  {touched.customer_email && errors.customer_email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customer_email}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Telefone <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      maxLength={9}
                      className={`w-full bg-gray-50 border ${
                        touched.customer_phone && errors.customer_phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                      } rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition-all`}
                      placeholder="923456789"
                    />
                  </div>
                  {touched.customer_phone && errors.customer_phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customer_phone}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Ex: 923456789 (9 dígitos, começa com 9)
                  </p>
                </div>

                {/* Cidade */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Cidade
                  </label>
                  <select
                    name="customer_city"
                    value={formData.customer_city}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Lubango">Lubango</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Malanje">Malanje</option>
                    <option value="Namibe">Namibe</option>
                    <option value="Uíge">Uíge</option>
                    <option value="Zaire">Zaire</option>
                    <option value="Cunene">Cunene</option>
                  </select>
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Endereço <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-gray-50 border ${
                        touched.customer_address && errors.customer_address ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                      } rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 transition-all`}
                      placeholder="Rua Principal, 123"
                    />
                  </div>
                  {touched.customer_address && errors.customer_address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.customer_address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumo dos Produtos */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-900" />
                Produtos
              </h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                {Object.entries(groupedByStore).map(([storeName, storeItems]) => (
                  <div key={storeName} className="border-b border-gray-100 last:border-0">
                    <div className="px-4 py-2 bg-gray-100/50 text-xs font-bold text-gray-600">
                      {storeName}
                    </div>
                    {storeItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity}x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-blue-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-black text-blue-900">{formatCurrency(total)}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-right">
                * Esta é uma fatura proforma, válida para orçamento.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Gerar Fatura
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}