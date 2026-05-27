import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginUser } from '../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
type FormErrors = { emailOrUsername?: string; password?: string; form?: string };

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
        {label} <span className="text-red-400">*</span>
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-red-500 text-[10px] font-bold"
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-gray-50/80 border ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-200'} rounded-xl py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword]               = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [errors, setErrors]                   = useState<FormErrors>({});
  const [successMsg, setSuccessMsg]           = useState<string | null>(null);

  // Success message from registration redirect
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto-dismiss success
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!emailOrUsername.trim()) e.emailOrUsername = 'E-mail ou utilizador obrigatório';
    if (!password)               e.password        = 'Palavra-passe obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await loginUser(emailOrUsername, password);
      if (result.success) {
        if (result.isAdmin)          navigate('/admin');
        else if (result.isCompany)   navigate('/store-admin');
        else                         navigate('/');
      } else {
        setErrors({ form: result.error ?? 'Credenciais inválidas' });
      }
    } catch {
      setErrors({ form: 'Erro ao fazer login. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const clearField = (field: keyof FormErrors) =>
    setErrors(p => ({ ...p, [field]: undefined }));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel — brand (hidden on mobile, shown lg+) ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-[#1E3A5F] via-[#243F69] to-[#1A3255] flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        {/* decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/5 pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          {/* logo mark */}
          <div className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/30">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            HSE<br /><span className="text-orange-400">Marketplace Angola</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            A sua plataforma de compras em Angola. Encontre os melhores produtos das melhores lojas.
          </p>

          {/* feature bullets */}
          <div className="mt-10 space-y-3 text-left">
            {[
              'Milhares de produtos disponíveis',
              'Entrega em todo o país',
              'Pagamento seguro e rápido',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-orange-400" />
                </div>
                <p className="text-white/70 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-8 bg-gray-50 min-h-screen lg:min-h-0">

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 lg:hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-[#1E3A5F]">HSE <span className="text-orange-500">Marketplace</span></span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 px-6 sm:px-8 py-8 sm:py-10">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Bem-vindo de volta</h2>
              <p className="text-sm text-gray-400 mt-1">Entre na sua conta para continuar</p>
            </div>

            {/* Success banner */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-600">{errors.form}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email / Username */}
              <Field label="E-mail ou Utilizador" error={errors.emailOrUsername}>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={e => { setEmailOrUsername(e.target.value); clearField('emailOrUsername'); }}
                    placeholder="seu@email.com"
                    disabled={loading}
                    autoComplete="username"
                    className={`${inputCls(errors.emailOrUsername)} pl-10 pr-4`}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Palavra-passe" error={errors.password}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearField('password'); }}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                    className={`${inputCls(errors.password)} pl-10 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {/* Forgot password */}
              <div className="flex justify-end -mt-1">
                <Link to="/forgot-password" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Esqueceu a palavra-passe?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] cursor-pointer text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1E3A5F]/20 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    A processar…
                  </span>
                ) : (
                  <>
                    Entrar na conta
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Register links */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Não tem conta?{' '}
                <Link to="/register" className="font-black text-orange-500 hover:text-orange-600 transition-colors">
                  Criar conta gratuita
                </Link>
              </p>
              <Link
                to="/company/register"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-500 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50 transition-all"
              >
                <Store className="w-4 h-4" />
                Quero vender na plataforma
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-gray-400 mt-5 leading-relaxed">
            Ao entrar, concorda com os nossos{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Termos de Serviço</Link>
            {' '}e{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">Política de Privacidade</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}