import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  ShieldCheck,
  Sparkles,
  Layers,
  DollarSign,
  AlertCircle,
  Sun,
  Moon,
  RefreshCw,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

export const LoginLockScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithCredentials,
    isDarkMode,
    toggleDarkMode,
    companies,
  } = useCRM();

  // Auth Mode: 'google' | 'password'
  const [authMode, setAuthMode] = useState<'google' | 'password'>('google');

  // Credentials form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setErrorMsg(
          result.error ||
            'No se pudo verificar la cuenta de Google. Verifica que sea la cuenta autorizada del CRM.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión al iniciar sesión con Google.');
      setIsLoading(false);
    }
  };

  // Handle Email + Password Login
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailInput.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Por favor ingresa tu contraseña de acceso.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithCredentials(emailInput, passwordInput);
      if (!result.success) {
        setErrorMsg(
          result.error ||
            'Credenciales incorrectas. Verifica tu correo y contraseña.'
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Error al conectar con el servidor de autenticación.');
      setIsLoading(false);
    }
  };

  return (
    <div
      id="login-lock-screen"
      className="min-h-screen w-full flex flex-col justify-between bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors p-4 sm:p-6 lg:p-8"
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center font-bold text-xs shadow-xs">
            PSD
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-900 dark:text-white text-sm tracking-tight">
                CRM BDR/PSD
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                v2
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Setter Digital Remoto Multi-Empresa
            </p>
          </div>
        </div>

        <button
          id="btn-lock-theme-toggle"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-300/80 dark:border-stone-700/80 transition"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-stone-700" />
          )}
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-6 space-y-5 animate-fadeIn">
        <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6 text-stone-800 dark:text-stone-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Acceso Seguro al CRM
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Ingresa tus credenciales o inicia sesión con tu Cuenta de Google autorizada.
            </p>
          </div>

          {/* Auth Method Selector Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 text-xs font-semibold">
            <button
              type="button"
              id="tab-auth-google"
              onClick={() => {
                setAuthMode('google');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition ${
                authMode === 'google'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Cuenta Google</span>
            </button>

            <button
              type="button"
              id="tab-auth-password"
              onClick={() => {
                setAuthMode('password');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition ${
                authMode === 'password'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4 flex-shrink-0 text-stone-700 dark:text-stone-300" />
              <span>Contraseña</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              id="auth-error-banner"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {/* Tab 1: Google Login */}
          {authMode === 'google' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-stone-600 dark:text-stone-400 text-center">
                Autenticación directa con Google Identity y verificación federada de cuenta.
              </p>

              <button
                id="btn-google-sign-in"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-white text-sm font-semibold flex items-center justify-center space-x-3 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed hover:border-stone-400 dark:hover:border-stone-600"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-600 dark:text-stone-300" />
                    <span>Verificando con Google...</span>
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  ¿Prefieres ingresar con clave? Cambia a la pestaña <strong>Contraseña</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Email + Password Form */}
          {authMode === 'password' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="input-auth-email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nombre@empresa.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Contraseña de Acceso
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-auth-password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                id="btn-password-sign-in"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Cifrado seguro PBKDF2 con Salt criptográfico único.
                </span>
              </div>
            </form>
          )}

          {/* Security Features Info */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Capacidades Protegidas
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Aislamiento estricto de {companies.length} carteras cliente</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Control confidencial de finanzas & comisiones</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span>Evaluador de ICP asistido por Gemini & Playbooks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Autenticación dual segura · Sesión firmada con expiración de 7 días</span>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-stone-500 dark:text-stone-400 py-2">
        CRM BDR / PSD v2 · Sistema de Prospección & Setter Remoto
      </footer>
    </div>
  );
};
