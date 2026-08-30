import React from 'react';
import {
  CalendarDays,
  LayoutGrid,
  Bot,
  BarChart3,
  Coins,
  BookOpen,
  Settings,
  Sparkles,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export type ScreenTab =
  | 'hoy'
  | 'pipeline'
  | 'ia'
  | 'reportes'
  | 'comisiones'
  | 'recursos'
  | 'configuracion';

interface SidebarProps {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { filteredLeads, filteredMeetings, activeCompany } = useCRM();

  // Counts for badge notifications
  const urgentFollowUpsCount = filteredLeads.filter(
    (l) => l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido' && l.semaforo === 'Verde'
  ).length;

  const todayMeetingsCount = filteredMeetings.filter(
    (m) => m.status === 'Confirmada'
  ).length;

  const navItems: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; privateOnly?: boolean }[] = [
    {
      id: 'hoy',
      label: 'Hoy (Cockpit)',
      icon: Flame,
      badge: todayMeetingsCount > 0 ? todayMeetingsCount : undefined,
    },
    {
      id: 'pipeline',
      label: 'Pipeline CRM',
      icon: LayoutGrid,
      badge: urgentFollowUpsCount > 0 ? urgentFollowUpsCount : undefined,
    },
    {
      id: 'ia',
      label: 'Asistentes IA (2)',
      icon: Bot,
    },
    {
      id: 'reportes',
      label: 'Reportes & Funnel',
      icon: BarChart3,
    },
    {
      id: 'comisiones',
      label: 'Comisiones',
      icon: Coins,
      privateOnly: true,
    },
    {
      id: 'recursos',
      label: 'Glosario & Recursos',
      icon: BookOpen,
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: ScreenTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-overlay"
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-56 lg:w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Active Context Banner */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Alcance de Datos
            </p>
            <p className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 truncate">
              {activeCompany ? activeCompany.name : 'Master (3 Empresas)'}
            </p>
            <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-stone-600 dark:text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Notion + Drive Sync</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-stone-900' : 'text-stone-500 dark:text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.privateOnly && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-200 dark:bg-amber-500/20 dark:text-amber-800'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                      }`}>
                        Privado
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Links Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
          {activeCompany?.notionDbUrl && (
            <a
              href={activeCompany.notionDbUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <span className="truncate">Abrir Notion DB</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          )}
          <div className="px-3 py-1 text-[11px] text-stone-400 dark:text-stone-500">
            <span>SLA Activo: &lt; 5 min</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around"
      >
        <button
          onClick={() => setActiveTab('hoy')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'hoy'
              ? 'text-stone-900 dark:text-white font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Flame className="w-4 h-4 mb-0.5" />
          <span>Hoy</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'pipeline'
              ? 'text-stone-900 dark:text-white font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4 mb-0.5" />
          <span>Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('ia')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'ia'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Bot className="w-4 h-4 mb-0.5" />
          <span>IA Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'reportes'
              ? 'text-stone-900 dark:text-white font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Reportes</span>
        </button>

        <button
          onClick={() => setActiveTab('comisiones')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'comisiones'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Coins className="w-4 h-4 mb-0.5" />
          <span>Finanzas</span>
        </button>
      </nav>
    </>
  );
};
