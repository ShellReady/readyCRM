import React from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Building2,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  LogOut,
  Database,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    selectedCompanyId,
    setSelectedCompanyId,
    companies,
    activeCompany,
    currentUserEmail,
    authorizedEmail,
    logout,
    notionConfig,
    syncPushToNotion,
    isSyncingNotion,
  } = useCRM();

  const isAuthValid = currentUserEmail.toLowerCase() === authorizedEmail.toLowerCase();

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 w-full border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Mobile Menu Button */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center font-bold text-xs shadow-sm">
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
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                Setter Digital Remoto Multi-Empresa
              </p>
            </div>
          </div>
        </div>

        {/* Center: Company Selector (Data Isolation Selector) - Progressive Multi-Company Display */}
        <div className="flex-1 max-w-xs sm:max-w-sm mx-auto">
          {companies.length <= 1 ? (
            <div className="flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: companies[0]?.color || '#3B82F6' }}
              />
              <span className="truncate">{companies[0]?.name || 'Mi Empresa'}</span>
              <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">
                ({companies[0]?.sector || 'Pipeline Activo'})
              </span>
            </div>
          ) : (
            <div className="relative">
              <select
                id="company-selector"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium py-1.5 pl-8 pr-8 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500 transition appearance-none cursor-pointer truncate"
              >
                <option value="all">👑 Vista Maestra (Todas las empresas)</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    🏢 {comp.name} — {comp.cycleType === 'Alto ticket / ciclo largo' ? 'Alto Ticket' : 'Ciclo Corto'}
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Right: User Status & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Company Badge */}
          {activeCompany ? (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeCompany.color }}
              />
              <span className="truncate max-w-[120px]">{activeCompany.name}</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Layers className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Consolidado Global</span>
            </div>
          )}

          {/* User Auth Pill & Logout */}
          <div className="flex items-center space-x-1">
            <div
              title={`Conectado como ${currentUserEmail}`}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs"
            >
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  isAuthValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              />
              <span className="hidden md:inline font-mono text-[11px] truncate max-w-[140px]">
                {currentUserEmail.split('@')[0]}
              </span>
            </div>

            <button
              id="btn-navbar-logout"
              onClick={logout}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
              title="Cerrar sesión / Bloquear CRM"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notion Quick Sync Button */}
          {notionConfig.apiKey && (
            <button
              id="btn-navbar-notion-sync"
              onClick={() => syncPushToNotion()}
              disabled={isSyncingNotion}
              className="p-2 rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 focus:outline-none transition flex items-center space-x-1.5 text-xs font-semibold"
              title={
                notionConfig.lastSyncedAt
                  ? `Sincronizado con Notion: ${new Date(notionConfig.lastSyncedAt).toLocaleTimeString()}`
                  : 'Sincronizar CRM con Notion'
              }
              aria-label="Sincronizar con Notion"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNotion ? 'animate-spin text-purple-600' : ''}`} />
              <span className="hidden sm:inline">Notion</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none transition"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
