// pages/Checkout.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Wallet,
  CheckCircle2,
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
  Timer,
  RefreshCw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkoutService, CheckoutData, PaymentReference } from '../services/checkout';
import { paymentService, PaymentResponse, EkwanzaPaymentResponse } from '../services/payment';
import { customerService, CustomerProfile } from '../services/customer';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: 20 }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-4 right-4 z-[200] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm w-[calc(100vw-2rem)] max-w-sm ${
      type === 'success'
        ? 'bg-emerald-500'
        : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500'
    } text-white`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
    ) : (
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
    )}
    <p className="font-semibold flex-1 leading-snug">{message}</p>
    <button onClick={onClose} className="ml-1 hover:opacity-75 flex-shrink-0 transition-opacity" aria-label="Fechar">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// ─── Waiting for Express Payment Modal ───────────────────────────────────────
// 🔴 MODIFICADO: O modal só fecha quando recebe status 211 do backend
const WaitingForPaymentModal = ({
  isOpen,
  remainingSeconds,
  isExpiredByBackend,
}: {
  isOpen: boolean;
  remainingSeconds: number;
  isExpiredByBackend: boolean;
}) => {
  const seconds = remainingSeconds % 60;
  const progress = (remainingSeconds / 60) * 100;
  const isUrgent = remainingSeconds <= 15;

  // Se o backend informou que expirou (status 211), mostra mensagem de expiração
  if (isExpiredByBackend) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 pt-8 pb-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Timer className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Tempo Expirado</h3>
                <p className="text-red-100 text-sm mt-1">Multicaixa Express</p>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed">
                  O tempo para autorizar o pagamento expirou. Por favor, inicie um novo pedido.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 active:scale-[0.98] transition-all"
                >
                  Tentar novamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 pt-8 pb-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Smartphone className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Aguardando Autorização</h3>
              <p className="text-orange-100 text-sm mt-1">Multicaixa Express</p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-5 leading-relaxed">
                Abra o app <span className="font-black text-gray-900">Multicaixa Express</span> e autorize o pagamento agora.
              </p>

              <div className={`rounded-2xl p-5 text-center border-2 transition-all duration-300 ${
                isUrgent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-orange-500'}`} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tempo Restante</span>
                </div>

                <div className={`text-7xl font-mono font-black tabular-nums leading-none mb-4 ${
                  isUrgent ? 'text-red-500' : 'text-orange-500'
                }`}>
                  {String(seconds).padStart(2, '0')}
                </div>

                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">segundos para autorizar</p>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                Aguardando resposta do servidor. Não feche esta janela.
              </p>
            </div>

            {/* Safe area for mobile */}
            <div className="h-safe-bottom pb-4 sm:pb-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Processing Modal ─────────────────────────────────────────────────────────
const ProcessingPaymentModal = ({ isOpen }: { isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">A Processar Pagamento</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Confirmando o seu pagamento, por favor aguarde…</p>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── Reference Payment Modal ──────────────────────────────────────────────────
interface ReferencePaymentData {
  entity: string;
  reference: string;
  amount: number;
  expiryDate: string;
}

const ReferencePaymentModal = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentData: ReferencePaymentData | null;
  onSuccess: () => void;
}) => {
  const [copied, setCopied] = useState<'entity' | 'reference' | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !paymentData?.expiryDate) return;
    const expiry = new Date(paymentData.expiryDate).getTime();
    const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, paymentData]);

  const copyToClipboard = (text: string, field: 'entity' | 'reference') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatExpiryTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const isExpired = timeLeft <= 0;
  const formatted = paymentData?.reference.replace(/(.{4})/g, '$1 ').trim();

  return (
    <AnimatePresence>
      {isOpen && paymentData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden"
            style={{ maxHeight: '95dvh' }}
          >
            {/* ── Header ── */}
            <div className="relative bg-gradient-to-br from-[#0F2544] via-[#1E3A5F] to-[#0F3460] px-6 pt-8 pb-10 text-white">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-blue-400/10 blur-xl" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40 flex-shrink-0">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-widest">Multicaixa / ATM</p>
                  <h3 className="text-xl font-black tracking-tight leading-tight">Pagamento por Referência</h3>
                </div>
              </div>

              {/* Amount pill */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 mb-0.5">Valor a pagar</p>
                  <p className="text-3xl font-black tracking-tight">{formatCurrency(paymentData.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 mb-0.5">Válido por</p>
                  <p className={`text-lg font-black tabular-nums ${isExpired ? 'text-red-400' : 'text-orange-300'}`}>
                    {isExpired ? 'Expirado' : formatExpiryTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            {/* Connector wave */}
            <div className="bg-[#1E3A5F] h-4 relative">
              <div className="absolute inset-x-0 bottom-0 h-4 bg-white rounded-t-3xl" />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95dvh - 240px)' }}>
              <div className="px-6 pb-6 pt-2">
                {isExpired ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Timer className="w-10 h-10 text-red-400" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Referência Expirada</h4>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      O prazo para pagamento expirou. Por favor, inicie um novo pedido.
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 active:scale-[0.98] transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ── Entity & Reference Cards ── */}
                    <div className="space-y-3 mb-5">

                      {/* Entity */}
                      <div className="group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entidade</p>
                        <div
                          onClick={() => copyToClipboard(paymentData.entity, 'entity')}
                          className="relative bg-gray-50 border-2 border-gray-200 hover:border-orange-300 rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] select-none"
                        >
                          <div className="flex items-center justify-between">
                            <code className="text-2xl font-black font-mono text-[#1E3A5F] tracking-wider">
                              {paymentData.entity}
                            </code>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                              copied === 'entity'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-200 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
                            }`}>
                              {copied === 'entity' ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copiar</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Referência</p>
                        <div
                          onClick={() => copyToClipboard(paymentData.reference, 'reference')}
                          className="relative bg-gradient-to-br from-[#0F2544] to-[#1E3A5F] rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] select-none overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <code className="text-xl sm:text-2xl font-black font-mono text-white tracking-[0.15em] leading-tight break-all">
                                {formatted}
                              </code>
                              <p className="text-white/40 text-[10px] mt-1.5">Toque para copiar</p>
                            </div>
                            <div className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                              copied === 'reference'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-orange-500 hover:text-white'
                            }`}>
                              {copied === 'reference' ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /> Copiar</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Expiry timer bar ── */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Timer className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-amber-800">Válido até</p>
                        <p className="text-sm font-bold text-amber-700 truncate">
                          {new Date(paymentData.expiryDate).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                        {formatExpiryTime(timeLeft)}
                      </div>
                    </div>

                    {/* ── Step-by-step instructions ── */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-black text-blue-900">Como efectuar o pagamento</p>
                      </div>
                      <ol className="space-y-2.5">
                        {[
                          'Dirija-se a uma caixa ATM Multicaixa',
                          `Selecione "Pagamento de Serviços"`,
                          `Digite a Entidade: ${paymentData.entity}`,
                          `Digite a Referência: ${paymentData.reference}`,
                          `Confirme o valor de ${formatCurrency(paymentData.amount)}`,
                          'Conclua e guarde o comprovativo',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-lg text-[10px] font-black flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-xs text-blue-800 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="space-y-2.5">
                      <button
                        onClick={onSuccess}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Já efectuei o pagamento
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-3.5 border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Safe area */}
            <div className="h-safe-bottom pb-4 sm:pb-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── E-Kwanza Payment Modal ───────────────────────────────────────────────────
interface EkwanzaPaymentData {
  qr_code: string;
  confirmation_code: string;
  reference: string;
  amount: number;
  expiry_minutes: number;
}

const EkwanzaPaymentModal = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onExpire,
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentData: EkwanzaPaymentData | null;
  onSuccess: () => void;
  onExpire: () => void;
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isManualChecking, setIsManualChecking] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const clearIntervals = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    countdownRef.current = null;
    pollingRef.current = null;
  }, []);

  const handleExpire = useCallback(() => {
    clearIntervals();
    setIsExpired(true);
    onExpire();
    setTimeout(onClose, 2000);
  }, [clearIntervals, onExpire, onClose]);

  const handleSuccess = useCallback(() => {
    clearIntervals();
    onSuccess();
  }, [clearIntervals, onSuccess]);

  const checkStatus = useCallback(async () => {
    if (!paymentData?.reference) return;
    attemptsRef.current += 1;
    try {
      const res = await paymentService.checkPaymentStatus(paymentData.reference);
      if (res.success && res.status === 'completed') handleSuccess();
      else if (attemptsRef.current >= 30) clearIntervals();
    } catch {
      if (attemptsRef.current >= 30) clearIntervals();
    }
  }, [paymentData?.reference, handleSuccess, clearIntervals]);

  useEffect(() => {
    if (!isOpen || !paymentData) return;
    setRemainingSeconds(paymentData.expiry_minutes * 60);
    setIsExpired(false);
    attemptsRef.current = 0;

    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) { handleExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);

    pollingRef.current = setInterval(checkStatus, 10000);

    return clearIntervals;
  }, [isOpen, paymentData, clearIntervals, handleExpire, checkStatus]);

  const handleManualCheck = async () => {
    if (!paymentData?.reference) return;
    setIsManualChecking(true);
    try {
      const res = await paymentService.checkPaymentStatus(paymentData.reference);
      if (res.success && res.status === 'completed') handleSuccess();
      else alert('Pagamento ainda não confirmado. Aguarde ou tente novamente.');
    } catch {
      alert('Erro ao verificar status. Tente novamente.');
    } finally {
      setIsManualChecking(false);
    }
  };

  const handleCopy = () => {
    if (!paymentData?.confirmation_code) return;
    navigator.clipboard.writeText(paymentData.confirmation_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isUrgent = remainingSeconds < 60;

  return (
    <AnimatePresence>
      {isOpen && paymentData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden"
            style={{ maxHeight: '95dvh' }}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#1E3A5F] to-[#0F3460] px-5 py-4 text-white flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-base">Pagamento E-Kwanza</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors" aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95dvh - 64px)' }}>
              <div className="p-5 space-y-4">
                {isExpired ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Timer className="w-10 h-10 text-red-400" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-2">Tempo Expirado</h4>
                    <p className="text-sm text-gray-500 mb-6">O prazo expirou. O pedido foi cancelado.</p>
                    <button onClick={onClose} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 active:scale-[0.98] transition-all">
                      Fechar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`rounded-2xl p-4 text-center border-2 transition-colors ${
                      isUrgent ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tempo restante</span>
                      </div>
                      <div className={`text-5xl font-mono font-black tabular-nums ${isUrgent ? 'text-red-500' : 'text-orange-500'}`}>
                        {formatTime(remainingSeconds)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total a pagar</span>
                      <span className="text-2xl font-black text-[#1E3A5F]">{formatCurrency(paymentData.amount)}</span>
                    </div>

                    {paymentData.qr_code && (
                      <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">QR Code</p>
                        <div className="bg-white p-3 rounded-2xl shadow-md inline-block border-2 border-gray-100">
                          <img src={paymentData.qr_code} alt="QR Code E-Kwanza" className="w-44 h-44 mx-auto" />
                        </div>
                      </div>
                    )}

                    {paymentData.confirmation_code && (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Código de Pagamento</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-3 py-2.5 text-center text-xl font-mono font-black text-[#1E3A5F] tracking-widest">
                            {paymentData.confirmation_code}
                          </code>
                          <button
                            onClick={handleCopy}
                            className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 active:scale-[0.95] transition-all flex-shrink-0"
                            aria-label="Copiar código"
                          >
                            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-xs font-black text-blue-900 mb-2">📱 Como pagar com E-Kwanza:</p>
                      <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                        <li>Abra o app E-Kwanza no seu telemóvel</li>
                        <li>Escolha "Pagar com QR Code" ou "Código"</li>
                        <li>Scan o QR Code ou insira o código</li>
                        <li>Confirme o valor de {formatCurrency(paymentData.amount)}</li>
                        <li>Autorize com o seu PIN</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleManualCheck}
                      disabled={isManualChecking}
                      className="w-full py-3.5 border-2 border-orange-400 text-orange-500 rounded-2xl font-bold text-sm hover:bg-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isManualChecking ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> A verificar…</>
                      ) : (
                        <><RefreshCw className="w-4 h-4" /> Verificar pagamento</>
                      )}
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full py-3.5 border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                      Cancelar pagamento
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="h-safe-bottom pb-4 sm:pb-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  company?: string | number;
  company_name?: string;
  image_url?: string;
}

interface OrderData {
  id: number;
  order_number: string;
  [key: string]: any;
}

// ─── Receipt Display ──────────────────────────────────────────────────────────
const ReceiptDisplay = ({
  reference,
  orderData,
  customerInfo,
  cart,
  cartTotal,
  paymentMethod,
}: {
  reference: PaymentReference;
  orderData: OrderData | null;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  cart: CartItem[];
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
        const data: CheckoutData = {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            company: item.company,
            company_name: item.company_name,
          })),
          total: cartTotal,
          paymentMethod: paymentMethod as CheckoutData['paymentMethod'],
        };
        await checkoutService.generateInvoicePDF(data, orderData?.order_number);
      }
    } catch {
      // silently fail
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      let pdfBlob: Blob;
      if (orderData?.id) {
        const res = await api.get(`invoice/${orderData.id}/download/`, { responseType: 'blob' });
        pdfBlob = res.data;
      } else {
        const res = await api.post(
          'invoice/generate/',
          {
            order_data: {
              full_name: customerInfo.fullName,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: customerInfo.address,
              city: customerInfo.city,
              total: cartTotal,
              items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
              payment_method:
                paymentMethod === 'express'
                  ? 'Multicaixa Express'
                  : paymentMethod === 'ekwanza'
                  ? 'E-Kwanza'
                  : 'Referência Multicaixa',
              order_number: orderData?.order_number || 'PENDENTE',
            },
          },
          { responseType: 'blob' }
        );
        pdfBlob = res.data;
      }
      const url = URL.createObjectURL(pdfBlob);
      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => win.print();
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `fatura_${orderData?.order_number || 'temp'}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch {
      // silently fail
    } finally {
      setIsPrinting(false);
    }
  };

  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  const groupedByStore = cart.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.company_name || 'Loja Geral';
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

  const paymentMethodName =
    paymentMethod === 'express'
      ? 'Multicaixa Express'
      : paymentMethod === 'reference'
      ? 'Referência Multicaixa'
      : 'E-Kwanza';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> A preparar…</>
            : <><Printer className="w-4 h-4" /> Imprimir</>}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-black text-sm hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
        >
          {isGeneratingPDF
            ? <><Loader2 className="w-4 h-4 animate-spin" /> A gerar…</>
            : <><Download className="w-4 h-4" /> Download PDF</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/30">H</div>
            <div>
              <p className="font-black text-sm">HSE Marketplace Angola</p>
              <p className="text-[10px] text-gray-400">marketplace.ao</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-400 font-black text-xs sm:text-sm">FATURA PRÓ-FORMA</p>
            <p className="text-[10px] text-gray-400">Nº {orderData?.order_number || 'N/A'}</p>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-wider">
            PENDENTE
          </span>
          <span className="text-[10px] text-gray-400">{formattedDate} · {formattedTime}</span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-3">Cliente</p>
            <div className="space-y-2">
              {[
                { label: 'Nome', value: customerInfo.fullName },
                { label: 'Email', value: customerInfo.email },
                { label: 'Telefone', value: customerInfo.phone },
                { label: 'Endereço', value: `${customerInfo.address}, ${customerInfo.city}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-800 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-3">Pagamento</p>
            <div className="space-y-2">
              <div>
                <p className="text-[9px] text-gray-400">Método</p>
                <p className="text-sm font-black text-gray-800">{paymentMethodName}</p>
              </div>
              {reference.entity && (
                <div>
                  <p className="text-[9px] text-gray-400">Entidade</p>
                  <p className="text-base font-black text-orange-500">{reference.entity}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] text-gray-400 mb-1">Referência</p>
                <div className="bg-gray-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <code className="text-white font-mono font-bold tracking-wider text-xs sm:text-sm break-all">
                    {reference.reference.replace(/(.{4})/g, '$1 ').trim()}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 bg-orange-500 rounded-lg hover:bg-orange-600 active:scale-95 transition-all flex-shrink-0"
                    aria-label="Copiar referência"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Timer className="w-3.5 h-3.5 flex-shrink-0" />
                Válido até: {new Date(reference.expiryDate).toLocaleDateString('pt-PT')}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-gray-100">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-3">Produtos</p>
          {Object.entries(groupedByStore).map(([storeName, items]) => (
            <div key={storeName} className="mb-4 last:mb-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Store className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <p className="text-xs font-black text-gray-600 truncate">{storeName}</p>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-gray-200 flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.quantity}× · {formatCurrency(item.price)}</p>
                    </div>
                    <p className="text-sm font-black text-gray-800 flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gray-50">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="font-black text-gray-900">Total</span>
            <span className="text-lg font-black text-orange-500">{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-[9px] text-gray-400">
            Esta fatura pró-forma é um documento válido. Guarde-a para futuras referências.
          </p>
          <p className="text-[8px] text-gray-300 mt-0.5">HSE Marketplace Angola © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Order Success ────────────────────────────────────────────────────────────
const OrderSuccess = ({
  orderNumber,
  orderId,
  onDownloadInvoice,
}: {
  orderNumber: string;
  orderId: number;
  onDownloadInvoice: () => Promise<void>;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-10 px-4"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.1 }}
      className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
    </motion.div>
    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">Pedido Confirmado!</h2>
    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
      O seu pedido foi registado com sucesso no HSE Marketplace Angola.
    </p>
    <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-8 inline-block">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Número do pedido</p>
      <p className="text-2xl font-mono font-black text-gray-900">{orderNumber}</p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onDownloadInvoice}
        className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Baixar Fatura
      </button>
      <Link
        to="/"
        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center"
      >
        Continuar a comprar
      </Link>
    </div>
  </motion.div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepBar = ({ current }: { current: number }) => {
  const steps = ['Dados', 'Pagamento', 'Confirmação'];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((label, i) => {
          const step = i + 1;
          const active = current >= step;
          const completed = current > step;
          const last = i === steps.length - 1;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-110'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className={`text-[9px] font-bold mt-1.5 transition-colors ${active ? 'text-orange-500' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {!last && (
                <div className={`h-0.5 w-10 sm:w-20 mx-1.5 mb-4 rounded-full transition-colors duration-500 ${
                  current > step ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div>
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[9px] text-gray-400 mt-1">{hint}</p>
    )}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-[10px] mt-1 flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
      </motion.p>
    )}
  </div>
);

const inputClass = (hasError?: boolean) =>
  `w-full bg-gray-50 border-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-500/20'
  } rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-4 transition-all`;

// ─── Main Checkout Component ──────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [paymentReference, setPaymentReference] = useState<PaymentReference | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showEkwanzaModal, setShowEkwanzaModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [ekwanzaPaymentData, setEkwanzaPaymentData] = useState<EkwanzaPaymentData | null>(null);
  const [referencePaymentData, setReferencePaymentData] = useState<ReferencePaymentData | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  // 🔴 NOVO: Estado para controlar se o backend informou que o pagamento expirou (código 211)
  const [isExpiredByBackend, setIsExpiredByBackend] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Luanda',
    paymentMethod: 'express',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingAttemptsRef = useRef(0);

  const authenticated = isAuthenticated();

  const clearIntervals = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    countdownRef.current = null;
    pollingRef.current = null;
  }, []);

  const startCountdown = useCallback(() => {
    clearIntervals();
    setRemainingSeconds(60);
    setIsExpiredByBackend(false);
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) { 
          clearIntervals(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearIntervals]);

  const processSuccessfulPayment = useCallback(async (orderId: number) => {
    try {
      const updated = await checkoutService.getOrder(orderId);
      setOrderData(updated);
      const reference: PaymentReference = {
        reference: `REF${Date.now()}`,
        amount: cartTotal,
        entity: 'Pagamento Confirmado',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      };
      setPaymentReference(reference);
      try { await checkoutService.downloadInvoice(orderId); } catch { /* optional */ }
      setOrderCompleted(true);
      setCurrentStep(3);
      showToast('Pagamento confirmado com sucesso!', 'success');
    } catch {
      showToast('Pagamento confirmado, mas houve erro ao gerar fatura.', 'error');
    }
  }, [cartTotal]);

  const startPolling = useCallback((transactionId: string, orderId: number) => {
    pollingAttemptsRef.current = 0;
    pollingRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1;
      try {
        const res = await paymentService.checkPaymentStatus(transactionId);
        if (res.success && res.status === 'completed') {
          clearIntervals();
          setShowWaitingModal(false);
          setShowProcessingModal(true);
          await processSuccessfulPayment(orderId);
          setShowProcessingModal(false);
        } else if (pollingAttemptsRef.current >= 30) {
          clearIntervals();
        }
      } catch {
        if (pollingAttemptsRef.current >= 30) clearIntervals();
      }
    }, 2000);
  }, [clearIntervals, processSuccessfulPayment]);

  useEffect(() => () => clearIntervals(), [clearIntervals]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const validatePhone = useCallback((phone: string) => {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 9 && clean.startsWith('9');
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneNumber(v);
    if (v.length > 0) {
      setPhoneError(v.length === 9 && v.startsWith('9') ? '' : 'Telefone deve ter 9 dígitos e começar com 9');
    } else {
      setPhoneError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = 'Nome completo é obrigatório';
    if (!formData.email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
    if (!formData.phone.trim()) e.phone = 'Telefone é obrigatório';
    else if (!validatePhone(formData.phone)) e.phone = 'Telefone deve ter 9 dígitos e começar com 9';
    if (!formData.address.trim()) e.address = 'Endereço é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePaymentStep = () => {
    if (formData.paymentMethod === 'express' || formData.paymentMethod === 'ekwanza') {
      if (!phoneNumber) { setPhoneError('Número de telefone é obrigatório'); return false; }
      if (!validatePhone(phoneNumber)) { setPhoneError('Telefone deve ter 9 dígitos e começar com 9'); return false; }
    }
    return true;
  };

  const handleReferenceSuccess = useCallback(async () => {
    setShowReferenceModal(false);
    setShowProcessingModal(true);
    if (currentOrderId) {
      await processSuccessfulPayment(currentOrderId);
    }
    setShowProcessingModal(false);
  }, [currentOrderId, processSuccessfulPayment]);

  const executePayment = useCallback(async () => {
    if (!validatePaymentStep()) return;
    setIsLoading(true);

    try {
      const data: CheckoutData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: ['express', 'ekwanza'].includes(formData.paymentMethod) ? phoneNumber : formData.phone,
        address: formData.address,
        city: formData.city,
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          company: i.company,
          company_name: i.company_name,
        })),
        total: cartTotal,
        paymentMethod: formData.paymentMethod as CheckoutData['paymentMethod'],
      };

      const order = await checkoutService.createOrder(data);
      setOrderData(order);
      setCurrentOrderId(order.id);

      if (formData.paymentMethod === 'express') {
        setShowWaitingModal(true);
        setIsExpiredByBackend(false);
        startCountdown();

        let result: PaymentResponse;
        try {
          result = await paymentService.initiateExpressPayment(cartTotal, phoneNumber, order.id) as PaymentResponse;
        } catch {
          clearIntervals();
          setShowWaitingModal(false);
          showToast('Erro de ligação ao processar o pagamento. Tente novamente.', 'error');
          setIsLoading(false);
          return;
        }

        const code = result.rawResponse?.responseStatus?.code;

        // 🔴 MODIFICADO: Se receber código 211 (timeout), mostra mensagem de expiração
        if (code === 211) {
          clearIntervals();
          setIsExpiredByBackend(true);
          setIsLoading(false);
          return;
        }

        if (!result.success && !result.transaction_id) {
          clearIntervals();
          setShowWaitingModal(false);
          showToast('Erro ao processar pagamento. Tente novamente.', 'error');
          setIsLoading(false);
          return;
        }

        if (result.success) {
          clearIntervals();
          setShowWaitingModal(false);
          setPaymentReference({
            reference: result.reference || `REF${Date.now()}`,
            amount: cartTotal,
            entity: result.entity || 'Pagamento processado',
            expiryDate: result.expiry_date || new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
          });
          try {
            await checkoutService.downloadInvoice(order.id);
          } catch {
            await checkoutService.generateInvoicePDF(data, order.order_number);
          }
          setOrderCompleted(true);
          setCurrentStep(3);
        }
      } else if (formData.paymentMethod === 'reference') {
        const result = await paymentService.initiateReferencePayment(cartTotal, order.id) as PaymentResponse;

        if (result.success) {
          setReferencePaymentData({
            entity: result.entity || 'Referência Multicaixa',
            reference: result.reference || `REF${Date.now()}`,
            amount: cartTotal,
            expiryDate: result.expiry_date || new Date(Date.now() + 86400000).toISOString(),
          });
          setShowReferenceModal(true);
          setIsLoading(false);
          return;
        } else {
          showToast(result.error || 'Erro ao gerar referência', 'error');
        }
      } else if (formData.paymentMethod === 'ekwanza') {
        const result = await paymentService.initiateEkwanzaPayment(cartTotal, phoneNumber, order.id) as EkwanzaPaymentResponse;
        if (result.success) {
          setEkwanzaPaymentData({
            qr_code: result.qr_code || '',
            confirmation_code: result.confirmation_code || result.reference || '',
            reference: result.reference || result.transaction_id || '',
            amount: result.amount || cartTotal,
            expiry_minutes: 5,
          });
          setShowEkwanzaModal(true);
          setCurrentTransactionId(result.transaction_id || '');
          setIsLoading(false);
          return;
        } else {
          showToast((result as any).error || 'Erro ao iniciar pagamento E-Kwanza', 'error');
        }
      } else {
        showToast('Método de pagamento inválido', 'error');
      }
    } catch {
      showToast('Erro ao processar pedido. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, phoneNumber, cart, cartTotal, startCountdown, startPolling, clearIntervals]);

  useEffect(() => {
    if (!authenticated) navigate('/login', { state: { from: '/checkout' } });
  }, [authenticated, navigate]);

  useEffect(() => {
    if (!authenticated) return;
    setIsProfileLoading(true);
    customerService
      .getProfile()
      .then((p) => {
        setFormData({
          fullName: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          city: p.city || 'Luanda',
          paymentMethod: 'express',
        });
        if (p.phone) setPhoneNumber(p.phone.replace(/\D/g, ''));
      })
      .catch(() => {})
      .finally(() => setIsProfileLoading(false));
  }, [authenticated]);

  useEffect(() => {
    if (cart.length === 0 && !orderCompleted) navigate('/cart');
  }, [cart, navigate, orderCompleted]);

  const groupedByStore = cart.reduce<Record<string, typeof cart>>((acc, item) => {
    const k = item.company_name || 'Loja Geral';
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});

  if (!authenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* ── Toasts ── */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* ── Modals ── */}
      <ProcessingPaymentModal isOpen={showProcessingModal} />
      <WaitingForPaymentModal 
        isOpen={showWaitingModal} 
        remainingSeconds={remainingSeconds} 
        isExpiredByBackend={isExpiredByBackend}
      />

      <EkwanzaPaymentModal
        isOpen={showEkwanzaModal}
        onClose={() => setShowEkwanzaModal(false)}
        paymentData={ekwanzaPaymentData}
        onSuccess={async () => {
          setShowEkwanzaModal(false);
          setShowProcessingModal(true);
          if (currentOrderId) await processSuccessfulPayment(currentOrderId).catch(() => {});
          setShowProcessingModal(false);
        }}
        onExpire={() => showToast('Tempo limite excedido. O pedido foi cancelado.', 'error')}
      />

      <ReferencePaymentModal
        isOpen={showReferenceModal}
        onClose={() => {
          setShowReferenceModal(false);
          setCurrentOrderId(null);
        }}
        paymentData={referencePaymentData}
        onSuccess={handleReferenceSuccess}
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-7">
        <Link
          to="/cart"
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
          aria-label="Voltar ao carrinho"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-gray-400">Finalize a sua compra no HSE Marketplace</p>
        </div>
      </div>

      <StepBar current={currentStep} />

      {!orderCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

          {/* ── Main Form ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* Step 1 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6"
                >
                  <h2 className="text-base font-black text-gray-900 mb-5">Informações Pessoais</h2>

                  {isProfileLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Field label="Nome Completo" error={errors.fullName} required>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="João Silva"
                            autoComplete="name"
                            className={inputClass(!!errors.fullName)}
                          />
                        </div>
                      </Field>

                      <Field label="Email" error={errors.email} required>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="joao@email.com"
                            autoComplete="email"
                            className={inputClass(!!errors.email)}
                          />
                        </div>
                      </Field>

                      <Field label="Telefone" error={errors.phone} required hint="9 dígitos, começando com 9">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="923456789"
                            autoComplete="tel"
                            maxLength={9}
                            inputMode="numeric"
                            className={inputClass(!!errors.phone)}
                          />
                        </div>
                      </Field>

                      <Field label="Endereço" error={errors.address} required>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Rua Principal, 123"
                            autoComplete="street-address"
                            className={inputClass(!!errors.address)}
                          />
                        </div>
                      </Field>

                      <Field label="Cidade">
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all appearance-none cursor-pointer"
                          >
                            {['Luanda', 'Benguela', 'Lubango', 'Huambo', 'Cabinda'].map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </Field>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                      disabled={isProfileLoading}
                      className="px-8 py-3 bg-orange-500 text-white cursor-pointer rounded-xl text-sm font-black hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
                    >
                      Continuar →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6"
                >
                  <h2 className="text-base font-black text-gray-900 mb-5">Método de Pagamento</h2>

                  <div className="space-y-3 mb-5">
                    {[
                      {
                        value: 'express',
                        icon: <Smartphone className="w-5 h-5 text-orange-500" />,
                        label: 'Multicaixa Express',
                        sub: 'Pagamento imediato via App',
                      },
                      {
                        value: 'reference',
                        icon: <Landmark className="w-5 h-5 text-orange-500" />,
                        label: 'Referência Multicaixa',
                        sub: 'Pague em qualquer caixa ATM — 24h de prazo',
                      },
                    ].map(({ value, icon, label, sub }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all select-none ${
                          formData.paymentMethod === value
                            ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-500/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={formData.paymentMethod === value}
                          onChange={handleChange}
                          className="w-4 h-4 text-orange-500 cursor-pointer accent-orange-500"
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${
                          formData.paymentMethod === value ? 'bg-orange-100' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500 leading-snug">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {(formData.paymentMethod === 'express' || formData.paymentMethod === 'ekwanza') && (
                    <div className="mb-5">
                      <Field
                        label={`Número ${formData.paymentMethod === 'express' ? 'Multicaixa Express' : 'E-Kwanza'}`}
                        error={phoneError}
                        required
                        hint={`Número associado à sua conta ${formData.paymentMethod === 'express' ? 'Multicaixa Express' : 'E-Kwanza'}`}
                      >
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            maxLength={9}
                            inputMode="numeric"
                            placeholder="923456789"
                            className={inputClass(!!phoneError)}
                          />
                        </div>
                      </Field>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-blue-800 mb-1">Informação importante</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Para pagamento via <strong>Multicaixa Express</strong>, terá 60 segundos para autorizar no app.
                          Para <strong>Referência Multicaixa</strong>, terá 72 horas para efectuar o pagamento num ATM.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={executePayment}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-orange-500 text-white cursor-pointer rounded-xl text-sm font-black hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                    >
                      {isLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> A processar…</>
                        : <><CreditCard className="w-4 h-4" /> Finalizar pedido</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-black text-gray-900 mb-4">Resumo do pedido</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 -mr-1">
                {Object.entries(groupedByStore).map(([storeName, items]) => (
                  <div key={storeName} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Store className="w-3 h-3 text-orange-500 flex-shrink-0" />
                      <p className="text-[10px] font-black text-gray-500 truncate">{storeName}</p>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs mb-1.5 gap-2">
                        <span className="text-gray-600 truncate leading-relaxed">{item.name}</span>
                        <span className="text-gray-900 font-bold flex-shrink-0">
                          {item.quantity}× {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-black text-gray-900">Total</span>
                  <span className="text-lg font-black text-orange-500">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="mt-4 bg-orange-50 rounded-xl p-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs text-orange-700 font-medium">Entrega: 2–3 dias úteis</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <OrderSuccess
          orderNumber={orderData?.order_number || ''}
          orderId={orderData?.id || 0}
          onDownloadInvoice={async () => {
            if (orderData?.id) await checkoutService.downloadInvoice(orderData.id);
          }}
        />
      )}

      {/* ── Receipt Modal (Step 3) ── */}
      <AnimatePresence>
        {paymentReference && currentStep === 3 && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl flex flex-col"
              style={{ maxHeight: '95dvh' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="font-black text-gray-900">Recibo da Compra</h3>
                <button
                  onClick={() => {
                    clearCart();
                    setPaymentReference(null);
                    setTimeout(() => navigate('/'), 300);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <ReceiptDisplay
                  reference={paymentReference}
                  orderData={orderData}
                  customerInfo={{
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                  }}
                  cart={cart as CartItem[]}
                  cartTotal={cartTotal}
                  paymentMethod={formData.paymentMethod}
                />
              </div>

              <div className="flex-shrink-0 border-t border-gray-100 p-5 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => {
                    clearCart();
                    setPaymentReference(null);
                    setTimeout(() => navigate('/'), 300);
                  }}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/20"
                >
                  Fechar e continuar
                </button>
              </div>

              <div className="h-safe-bottom sm:hidden" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}