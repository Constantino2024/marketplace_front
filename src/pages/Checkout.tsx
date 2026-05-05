// pages/Checkout.tsx
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
  X,
  Smartphone,
  Landmark,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService, CheckoutData, PaymentReference } from '../services/checkout';
import { paymentService, PaymentResponse } from '../services/payment';
import { customerService, CustomerProfile } from '../services/customer';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';

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

// Modal de Aguardando Pagamento Express
const WaitingForPaymentModal = ({ 
  isOpen, 
  onClose, 
  remainingSeconds,
  onRetry 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  remainingSeconds: number;
  onRetry: () => void;
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">
                Aguardando Pagamento
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                Por favor, autorize o pagamento no seu aplicativo Multicaixa Express
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-gray-600">Tempo restante:</span>
                </div>
                <div className="text-3xl font-mono font-black text-orange-500">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  O pagamento deve ser autorizado em até 60 segundos
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 border border-gray-200 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal de Tempo Esgotado
const TimeoutModal = ({ 
  isOpen, 
  onClose, 
  onRetry 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onRetry: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">
                Tempo Esgotado!
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                O prazo para autorizar o pagamento expirou.
              </p>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ Você deve autorizar o pagamento num prazo máximo de 60 segundos.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 border border-gray-200 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={onRetry}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
                >
                  Tentar Pagar Novamente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal de Processando Pagamento
const ProcessingPaymentModal = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
          >
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Processando Pagamento
            </h3>
            <p className="text-sm text-gray-500">
              Por favor, aguarde enquanto processamos seu pagamento...
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Componente de Recibo Completo
const ReceiptDisplay = ({ 
  reference, 
  orderData,
  customerInfo,
  cart,
  cartTotal,
  paymentMethod
}: { 
  reference: PaymentReference;
  orderData: any;
  customerInfo: any;
  cart: any[];
  cartTotal: number;
  paymentMethod: string;
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (orderData?.id) {
        await checkoutService.downloadInvoice(orderData.id);
      } else {
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
          paymentMethod: paymentMethod
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

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
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
            payment_method: paymentMethod,
            order_number: orderData?.order_number || 'PENDENTE'
          }
        };
        
        const response = await api.post('invoice/generate/', checkoutData, {
          responseType: 'blob'
        });
        pdfBlob = response.data;
      }
      
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
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

  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  const getPaymentMethodName = () => {
    switch(paymentMethod) {
      case 'express': return 'Multicaixa Express';
      case 'reference': return 'Referência Multicaixa';
      case 'ekwanza': return 'E-Kwanza';
      default: return 'Multicaixa Express';
    }
  };

  return (
    <div className="space-y-4">
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

      <div id="receipt-content" className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
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
              <h1 className="text-2xl font-black text-orange-400">FATURA PROFORMA</h1>
              <p className="text-xs text-gray-300">Nº {orderData?.order_number || 'N/A'}</p>
            </div>
          </div>
        </div>

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

            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Pagamento</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400">Método</p>
                <p className="text-sm font-bold text-gray-800">{getPaymentMethodName()}</p>
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

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{item.quantity}x</span>
                        <span>{formatCurrency(item.price)}</span>
                      </div>
                    </div>

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

        <div className="p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Esta fatura proforma é um documento válido. Guarde-a para futuras referências.
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Estados para os modais de pagamento
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  
  let countdownInterval: NodeJS.Timeout | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;

  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  // Função para limpar os intervalos
  const clearIntervals = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // Função para iniciar a contagem regressiva
  const startCountdown = () => {
    clearIntervals();
    setRemainingSeconds(60);
    
    countdownInterval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearIntervals();
          // Fecha modal de espera e mostra modal de timeout
          setShowWaitingModal(false);
          setShowTimeoutModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Função para fazer polling do status do pagamento
  const startPolling = async (transactionId: string, orderId: number) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 tentativas em 60 segundos (cada 2 segundos)
    
    pollingInterval = setInterval(async () => {
      attempts++;
      try {
        console.log(`Verificando status do pagamento (tentativa ${attempts}/${maxAttempts})...`);
        
        // Verificar status do pagamento via API
        const statusResponse = await paymentService.checkPaymentStatus(transactionId);
        
        console.log('Status response:', statusResponse);
        
        if (statusResponse.success && statusResponse.status === 'completed') {
          // Pagamento confirmado!
          console.log('Pagamento confirmado!');
          clearIntervals();
          setShowWaitingModal(false);
          setShowProcessingModal(true);
          
          // Processar pagamento bem-sucedido
          await processSuccessfulPayment(orderId);
          
          setShowProcessingModal(false);
        } else if (attempts >= maxAttempts) {
          // Timeout do polling, mas ainda estamos aguardando
          console.log('Polling atingiu máximo de tentativas');
          clearIntervals();
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        if (attempts >= maxAttempts) {
          clearIntervals();
        }
      }
    }, 2000);
  };

  // Função para processar pagamento bem-sucedido
  const processSuccessfulPayment = async (orderId: number) => {
    try {
      // Buscar dados atualizados do pedido
      const updatedOrder = await checkoutService.getOrder(orderId);
      setOrderData(updatedOrder);
      
      // Gerar referência para o recibo
      const reference: PaymentReference = {
        reference: `REF${Date.now()}`,
        amount: cartTotal,
        entity: 'Pagamento Confirmado',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      };
      
      setPaymentReference(reference);
      
      // Baixar fatura
      try {
        await checkoutService.downloadInvoice(orderId);
        setToast({
          message: 'Pagamento confirmado com sucesso!',
          type: 'success'
        });
      } catch (pdfError) {
        console.error('Erro ao baixar fatura:', pdfError);
        setToast({
          message: 'Pagamento confirmado!',
          type: 'success'
        });
      }
      
      //clearCart();
      setOrderCompleted(true);
      setCurrentStep(3);
      
      setToast({
        message: 'Pagamento processado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao processar pagamento bem-sucedido:', error);
      setToast({
        message: 'Pagamento confirmado, mas houve erro ao gerar fatura.',
        type: 'error'
      });
    }
  };

  // Função para executar o pagamento
  const executePayment = async () => {
    if (!validatePaymentStep()) return;
    
    setIsLoading(true);
    
    try {
      // Primeiro criar o pedido
      const checkoutData: CheckoutData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.paymentMethod === 'express' || formData.paymentMethod === 'ekwanza' ? phoneNumber : formData.phone,
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
        paymentMethod: formData.paymentMethod
      };

      const order = await checkoutService.createOrder(checkoutData);
      setOrderData(order);
      setCurrentOrderId(order.id);
      
      // Processar pagamento
      let paymentResult: PaymentResponse;
      
      switch (formData.paymentMethod) {
        case 'express':
          paymentResult = await paymentService.initiateExpressPayment(cartTotal, phoneNumber, order.id);
          console.log('Payment result:', paymentResult);
          
          // Verificar se houve timeout (código 211)
          const errorCode = paymentResult.rawResponse?.responseStatus?.code || 
                           paymentResult.data?.responseStatus?.code;
          
          if (errorCode === 211 || 
              paymentResult.message?.includes('60 segundos') ||
              paymentResult.error?.includes('60 segundos')) {
            
            console.log('Timeout detectado! Mostrando modal de espera...');
            
            // Mostrar modal de aguardando pagamento
            setShowWaitingModal(true);
            startCountdown();
            
            // Salvar transaction_id para polling
            const transactionId = paymentResult.transaction_id || 
                                 paymentResult.data?.id || 
                                 paymentResult.rawResponse?.id;
            
            if (transactionId) {
              setCurrentTransactionId(transactionId);
              startPolling(transactionId, order.id);
            }
            
            setIsLoading(false);
            return;
          }
          break;
        case 'reference':
          paymentResult = await paymentService.initiateReferencePayment(cartTotal, order.id);
          break;
        case 'ekwanza':
          paymentResult = await paymentService.initiateEkwanzaPayment(cartTotal, phoneNumber, order.id);
          break;
        default:
          paymentResult = { success: false, error: 'Método de pagamento inválido' };
      }
      
      if (paymentResult.success) {
        // Gerar referência para o recibo
        const reference: PaymentReference = {
          reference: paymentResult.data?.reference || paymentResult.data?.transaction_id || `REF${Date.now()}`,
          amount: cartTotal,
          entity: paymentResult.data?.entity || 'Pagamento processado',
          expiryDate: paymentResult.data?.expiry_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        };
        
        setPaymentReference(reference);
        
        // Baixar fatura
        try {
          await checkoutService.downloadInvoice(order.id);
          setToast({
            message: 'Pagamento processado e fatura gerada!',
            type: 'success'
          });
        } catch (pdfError) {
          console.error('Erro ao baixar fatura:', pdfError);
          await checkoutService.generateInvoicePDF(checkoutData, order.order_number);
          setToast({
            message: 'Pagamento processado com sucesso!',
            type: 'success'
          });
        }
        
        //clearCart();
        setOrderCompleted(true);
        setCurrentStep(3);
      } else {
        // Se não for timeout, mostrar erro normal
        if (paymentResult.rawResponse?.responseStatus?.code !== 211) {
          setToast({
            message: paymentResult.error || 'Erro ao processar pagamento',
            type: 'error'
          });
        }
      }
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

  const validateAngolanPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 9 && cleanPhone.startsWith('9');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    setPhoneNumber(value);
    
    if (value.length === 9 && value.startsWith('9')) {
      setPhoneError('');
    } else if (value.length > 0) {
      setPhoneError('Telefone deve ter 9 dígitos e começar com 9');
    } else {
      setPhoneError('');
    }
  };

  // Função para tentar pagamento novamente após timeout
  const handleRetryPayment = () => {
    clearIntervals();
    setShowTimeoutModal(false);
    setShowWaitingModal(false);
    // Limpar estados
    setCurrentTransactionId(null);
    setCurrentOrderId(null);
    // Tentar novamente o pagamento
    executePayment();
  };

  // Função para cancelar e tentar novamente do modal de espera
  const handleRetryFromWaiting = () => {
    clearIntervals();
    setShowWaitingModal(false);
    // Limpar estados
    setCurrentTransactionId(null);
    setCurrentOrderId(null);
    // Re-iniciar o processo de pagamento
    executePayment();
  };

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

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authenticated) return;
      
      setIsProfileLoading(true);
      try {
        const profileData = await customerService.getProfile();
        setProfile(profileData);
        
        setFormData({
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || 'Luanda',
          paymentMethod: 'express'
        });
        
        if (profileData.phone) {
          const cleanPhone = profileData.phone.replace(/\D/g, '');
          setPhoneNumber(cleanPhone);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadUserProfile();
    
    // Cleanup ao desmontar
    return () => {
      clearIntervals();
    };
  }, [authenticated]);

  useEffect(() => {
    if (cart.length === 0 && !orderCompleted) {
      navigate('/cart');
    }
  }, [cart, navigate, orderCompleted]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Luanda',
    paymentMethod: 'express'
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
    } else if (!validateAngolanPhone(formData.phone)) {
      newErrors.phone = 'Telefone deve ter 9 dígitos e começar com 9';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentStep = (): boolean => {
    if (formData.paymentMethod === 'express' || formData.paymentMethod === 'ekwanza') {
      if (!phoneNumber) {
        setPhoneError('Número de telefone é obrigatório');
        return false;
      }
      if (!validateAngolanPhone(phoneNumber)) {
        setPhoneError('Telefone deve ter 9 dígitos e começar com 9');
        return false;
      }
    }
    return true;
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
    await executePayment();
  };

  const groupedByStore = cart.reduce((groups, item) => {
    const storeName = item.company_name || 'Loja Geral';
    if (!groups[storeName]) {
      groups[storeName] = [];
    }
    groups[storeName].push(item);
    return groups;
  }, {} as Record<string, typeof cart>);

  if (!authenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Modais de Pagamento */}
      <ProcessingPaymentModal isOpen={showProcessingModal} />
      
      <WaitingForPaymentModal
        isOpen={showWaitingModal}
        onClose={() => {
          clearIntervals();
          setShowWaitingModal(false);
        }}
        remainingSeconds={remainingSeconds}
        onRetry={handleRetryFromWaiting}
      />

      <TimeoutModal
        isOpen={showTimeoutModal}
        onClose={() => {
          setShowTimeoutModal(false);
          clearIntervals();
        }}
        onRetry={handleRetryPayment}
      />

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
                          placeholder="923456789"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                      )}
                      <p className="text-[8px] text-gray-400 mt-1">9 dígitos, começa com 9</p>
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
                    formData.paymentMethod === 'express' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="express"
                      checked={formData.paymentMethod === 'express'}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                      <Smartphone className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Multicaixa Express</p>
                      <p className="text-xs text-gray-500">Pagamento imediato via App</p>
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
                      <Landmark className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">Referência Multicaixa</p>
                      <p className="text-xs text-gray-500">Pague em qualquer caixa</p>
                    </div>
                  </label>

                  {/* E-Kwanza */}
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === 'ekwanza' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ekwanza"
                      checked={formData.paymentMethod === 'ekwanza'}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-500"
                    />
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                      <Wallet className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">E-Kwanza</p>
                      <p className="text-xs text-gray-500">Pagamento digital</p>
                    </div>
                  </label>
                </div>

                {/* Campo de telefone para Express e E-Kwanza */}
                {(formData.paymentMethod === 'express' || formData.paymentMethod === 'ekwanza') && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">
                      Número de Telefone <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={9}
                        placeholder="923456789"
                        className={`w-full bg-gray-50 border ${
                          phoneError ? 'border-red-300' : 'border-gray-200'
                        } rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {phoneError}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      Digite o número associado à sua conta {formData.paymentMethod === 'express' ? 'Multicaixa Express' : 'E-Kwanza'}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-700 font-bold mb-1">💡 Importante:</p>
                  <p className="text-xs text-blue-600">
                    Após finalizar, você terá 60 segundos para autorizar o pagamento no seu aplicativo.
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
        <OrderSuccess 
          orderNumber={orderData?.order_number} 
          orderId={orderData?.id}
          onDownloadInvoice={async () => {
            if (orderData?.id) {
              await checkoutService.downloadInvoice(orderData.id);
            }
          }}
        />
      )}

      <AnimatePresence>
        {paymentReference && currentStep === 3 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-xl flex justify-between items-center z-10">
                <h3 className="text-lg font-black text-gray-800">Recibo da Compra</h3>
                <button
                  onClick={async () => {
                    // Limpar carrinho antes de fechar
                    clearCart();
                    setPaymentReference(null);
                    // Opcional: redirecionar para a página inicial após um pequeno delay
                    setTimeout(() => {
                      navigate('/');
                    }, 500);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <ReceiptDisplay
                  reference={paymentReference}
                  orderData={orderData}
                  customerInfo={formData}
                  cart={cart}
                  cartTotal={cartTotal}
                  paymentMethod={formData.paymentMethod}
                />
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
                <button
                  onClick={async () => {
                    // Limpar carrinho antes de fechar
                    clearCart();
                    setPaymentReference(null);
                    // Opcional: redirecionar para a página inicial após um pequeno delay
                    setTimeout(() => {
                      navigate('/');
                    }, 500);
                  }}
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