import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Printer,
  Download,
  Loader2,
  Store,
  Package,
  Truck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService, CheckoutData, PaymentReference } from '../services/checkout';
import { customerService, CustomerProfile } from '../services/customer';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import { formatCurrency } from '../utils/currency';
import api from '../services/api'; // Adicione esta importação

// Componente de Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm max-w-[90%] sm:max-w-md ${
      type === 'success' ? 'bg-emerald-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> :
     type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> :
     <AlertCircle className="w-4 h-4 flex-shrink-0" />}
    <p className="font-bold flex-1">{message}</p>
    <button onClick={onClose} className="ml-2 hover:opacity-80 flex-shrink-0">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Componente de Recibo Completo
const ReceiptDisplay = ({ 
  reference, 
  orderData,
  customerInfo,
  cart,
  cartTotal 
}: { 
  reference: PaymentReference;
  orderData: any;
  customerInfo: any;
  cart: any[];
  cartTotal: number;
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gerar PDF via backend
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Se temos orderData com ID, baixar do endpoint específico
      if (orderData?.id) {
        await checkoutService.downloadInvoice(orderData.id);
      } else {
        // Caso contrário, gerar PDF a partir dos dados
        const checkoutData: CheckoutData = {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            company: item.company,
            company_name: item.company_name
          })),
          total: cartTotal,
          paymentMethod: 'multicaixa'
        };
        await checkoutService.generateInvoicePDF(checkoutData, orderData?.order_number);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar fatura. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Imprimir via backend (gera PDF e abre janela de impressão)
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Gerar PDF primeiro
      let pdfBlob: Blob;
      
      if (orderData?.id) {
        const response = await api.get(`invoice/${orderData.id}/download/`, {
          responseType: 'blob'
        });
        pdfBlob = response.data;
      } else {
        const checkoutData = {
          order_data: {
            full_name: customerInfo.fullName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            total: cartTotal,
            items: cart.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            payment_method: 'multicaixa',
            order_number: orderData?.order_number || 'PENDENTE'
          }
        };
        
        const response = await api.post('invoice/generate/', checkoutData, {
          responseType: 'blob'
        });
        pdfBlob = response.data;
      }
      
      // Criar URL para o blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Abrir em nova janela para impressão
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback: baixar e depois imprimir
        const link = document.createElement('a');
        link.href = url;
        link.download = `fatura_${orderData?.order_number || 'temp'}.pdf`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        alert('PDF baixado. Abra o arquivo e utilize a opção de impressão.');
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao preparar impressão. Tente novamente.');
    } finally {
      setIsPrinting(false);
    }
  };

  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Agrupar produtos por loja
  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  return (
    <div className="space-y-4">
      {/* Botões de ação */}
      <div className="flex gap-2 no-print">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Imprimir
            </>
          )}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Recibo (versão para exibição no modal) */}
      <div id="receipt-content" className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="https://raw.githubusercontent.com/HSE-Market-Place/logo/main/logo.png" 
                alt="HSE MarketPlace"
                className="h-12 w-auto brightness-0 invert"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-logo') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="fallback-logo hidden w-10 h-10 bg-orange-500 rounded-lg items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h2 className="text-xl font-black">HSE MarketPlace</h2>
                <p className="text-xs text-gray-300">Compras online</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-orange-400">FATURA</h1>
              <p className="text-xs text-gray-300">Nº {orderData?.order_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Status e Datas */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold">
              PENDENTE
            </span>
            <div className="text-xs text-gray-500">
              <span>{formattedDate} | {formattedTime}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Cliente</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-gray-400">Nome</p>
                  <p className="text-sm font-bold text-gray-800">{customerInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Email</p>
                  <p className="text-xs text-gray-600">{customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Telefone</p>
                  <p className="text-xs text-gray-600">{customerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Endereço</p>
                  <p className="text-xs text-gray-600">{customerInfo.address}, {customerInfo.city}</p>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Pagamento</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400">Método</p>
                  <p className="text-sm font-bold text-gray-800">Multicaixa Express</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Entidade</p>
                  <p className="text-base font-bold text-orange-500">{reference.entity}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Referência</p>
                  <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-white font-mono font-bold tracking-wider text-sm">
                      {reference.reference.match(/.{1,4}/g)?.join(' ')}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  {copied && (
                    <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Referência copiada!
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Válido até: {new Date(reference.expiryDate).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Produtos</h3>
          
          {Object.entries(groupedByStore).map(([storeName, items]) => (
            <div key={storeName} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                  <Store className="w-3 h-3 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-gray-600">{storeName}</p>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* Imagem */}
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-200 flex-shrink-0">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{item.quantity}x</span>
                        <span>{formatCurrency(item.price)}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa de entrega</span>
              <span className="text-emerald-500 font-bold">Grátis</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-lg font-black text-orange-500">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Esta fatura é um documento válido. Guarde-a para futuras referências.
          </p>
          <p className="text-[8px] text-gray-300 mt-1">
            HSE MarketPlace © 2026 - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de Sucesso
const OrderSuccess = ({ orderNumber, orderId, onDownloadInvoice }: { 
  orderNumber: string; 
  orderId: number;
  onDownloadInvoice: () => Promise<void>;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-8"
  >
    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
    </div>
    <h2 className="text-xl font-black text-gray-800 mb-2">Pedido Confirmado!</h2>
    <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
      Seu pedido foi registado com sucesso.
    </p>
    <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-xs mx-auto">
      <p className="text-xs text-gray-400 uppercase mb-1">Número do pedido</p>
      <p className="text-lg font-mono font-bold text-gray-800">{orderNumber}</p>
    </div>
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={onDownloadInvoice}
        className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-all shadow-md flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Baixar Fatura
      </button>
      <Link
        to="/"
        className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
      >
        Continuar
      </Link>
      <Link
        to={`/orders/${orderNumber}`}
        className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-md"
      >
        Acompanhar
      </Link>
    </div>
  </motion.div>
);

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [paymentReference, setPaymentReference] = useState<PaymentReference | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  // Verificar se usuário está logado
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authenticated) {
      navigate('/login', { 
        state: { 
          from: '/checkout',
          message: 'Faça login para continuar com o checkout' 
        } 
      });
    }
  }, [authenticated, navigate]);

  // Carregar perfil do usuário logado
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authenticated) return;
      
      setIsProfileLoading(true);
      try {
        const profileData = await customerService.getProfile();
        setProfile(profileData);
        
        // Pré-preencher formulário com dados do perfil
        setFormData({
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || 'Luanda',
          paymentMethod: 'multicaixa' as 'reference' | 'multicaixa'
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [authenticated]);

  useEffect(() => {
    if (cart.length === 0 && !orderCompleted) {
      navigate('/cart');
    }
  }, [cart, navigate, orderCompleted]);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Luanda',
    paymentMethod: 'multicaixa' as 'reference' | 'multicaixa'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\+?[0-9]{9,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Telefone inválido (9-13 dígitos)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const reference = await checkoutService.generatePaymentReference(cartTotal);
      setPaymentReference(reference);

      const checkoutData: CheckoutData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          company: item.company,
          company_name: item.company_name
        })),
        total: cartTotal,
        paymentMethod: formData.paymentMethod === 'multicaixa' ? 'card' : 'reference'
      };

      const order = await checkoutService.createOrder(checkoutData);
      setOrderData(order);
      
      // Baixar fatura automaticamente após criação do pedido
      try {
        await checkoutService.downloadInvoice(order.id);
        setToast({
          message: 'Fatura gerada com sucesso!',
          type: 'success'
        });
      } catch (pdfError) {
        console.error('Erro ao baixar fatura:', pdfError);
        // Se falhar, gerar PDF com os dados temporários
        await checkoutService.generateInvoicePDF(checkoutData, order.order_number);
        setToast({
          message: 'Fatura gerada com sucesso!',
          type: 'success'
        });
      }
      
      clearCart();
      setOrderCompleted(true);
      setCurrentStep(3);
      
      setToast({
        message: 'Pedido criado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro no checkout:', error);
      setToast({
        message: 'Erro ao processar pedido. Tente novamente.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar produtos por loja para o resumo
  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  // Se não estiver autenticado, não renderiza nada (redireciona)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link 
          to="/cart" 
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-800">Checkout</h1>
          <p className="text-xs text-gray-400">Finalize sua compra</p>
        </div>
      </div>

      {/* Progress Steps - Compacto */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          </div>
          <div className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-center gap-12 mt-1 text-[10px] font-bold text-gray-400">
          <span>Dados</span>
          <span>Pagamento</span>
          <span>Confirmação</span>
        </div>
      </div>

      {!orderCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                <h2 className="text-lg font-black text-gray-800 mb-4">Informações Pessoais</h2>
                
                {isProfileLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Nome Completo <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`w-full bg-gray-50 border ${
                            errors.fullName ? 'border-red-300' : 'border-gray-200'
                          } rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500`}
                          placeholder="João Silva"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full bg-gray-50 border ${
                            errors.email ? 'border-red-300' : 'border-gray-200'
                          } rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500`}
                          placeholder="joao@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Telefone <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full bg-gray-50 border ${
                            errors.phone ? 'border-red-300' : 'border-gray-200'
                          } rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500`}
                          placeholder="+244 923 456 789"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Endereço <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full bg-gray-50 border ${
                            errors.address ? 'border-red-300' : 'border-gray-200'
                          } rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500`}
                          placeholder="Rua Principal, 123"
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                        Cidade
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                        >
                          <option value="Luanda">Luanda</option>
                          <option value="Benguela">Benguela</option>
                          <option value="Lubango">Lubango</option>
                          <option value="Huambo">Huambo</option>
                          <option value="Cabinda">Cabinda</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={isProfileLoading}
                    className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-sm disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                <h2 className="text-lg font-black text-gray-800 mb-4">Método de Pagamento</h2>

                <div className="space-y-3 mb-4">
                  {/* Multicaixa Express */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === 'multicaixa' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="multicaixa"
                      checked={formData.paymentMethod === 'multicaixa'}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/94/Multicaixa_logo.png" 
                        alt="Multicaixa Express"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Multicaixa Express</p>
                      <p className="text-xs text-gray-500">Pagamento imediato</p>
                    </div>
                  </label>

                  {/* Referência Multicaixa */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === 'reference' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="reference"
                      checked={formData.paymentMethod === 'reference'}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                      <img 
                        src="https://seeklogo.com/images/M/multicaixa-logo-7C4D5E5F5E-seeklogo.com.png" 
                        alt="Referência Multicaixa"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Referência Multicaixa</p>
                      <p className="text-xs text-gray-500">Pague em qualquer caixa</p>
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-700 font-bold mb-1">💡 Importante:</p>
                  <p className="text-xs text-blue-600">
                    Após finalizar, você receberá uma referência válida por 24 horas.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-2 border border-gray-200 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      'Finalizar'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Resumo do Pedido - Compacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24">
              <h2 className="text-base font-black text-gray-800 mb-3">Resumo</h2>

              <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-1">
                {Object.entries(groupedByStore).map(([storeName, items]) => (
                  <div key={storeName} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                        <Store className="w-2.5 h-2.5 text-orange-500" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-600 truncate">{storeName}</p>
                    </div>
                    
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                        <span className="text-gray-800 font-bold ml-2">
                          {item.quantity}x {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Entrega</span>
                  <span className="text-emerald-500 font-bold">Grátis</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-sm font-bold text-gray-800">Total</span>
                  <span className="text-base font-black text-orange-500">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Truck className="w-3 h-3 text-orange-500" />
                  <span>Entrega: 2-3 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <OrderSuccess orderNumber={orderData?.order_number} />
      )}

      {/* Modal de Recibo Completo */}
      <AnimatePresence>
        {paymentReference && currentStep === 3 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8"
            >
              {/* Header do Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl flex justify-between items-center z-10">
                <h3 className="text-lg font-black text-gray-800">Recibo da Compra</h3>
                <button
                  onClick={() => setPaymentReference(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <ReceiptDisplay
                  reference={paymentReference}
                  orderData={orderData}
                  customerInfo={formData}
                  cart={cart}
                  cartTotal={cartTotal}
                />
              </div>

              {/* Botão de Fechar */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
                <button
                  onClick={() => setPaymentReference(null)}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}