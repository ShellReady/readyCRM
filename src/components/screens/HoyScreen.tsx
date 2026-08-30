import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead, Meeting, WorkBlock, WorkBlockType, DayOfWeek } from '../../types';
import {
  getActiveWorkBlock,
  getLeadLocalTimeInfo,
  DAYS_OF_WEEK,
  getCurrentDayOfWeek,
} from '../../utils/timezones';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Video,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Briefcase,
  PlayCircle,
  X,
  Target,
} from 'lucide-react';

interface HoyScreenProps {
  onSelectLead: (lead: Lead) => void;
  onNavigateToIA: (lead?: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenQuickLogModal: () => void;
}

export const HoyScreen: React.FC<HoyScreenProps> = ({
  onSelectLead,
  onNavigateToIA,
  onOpenNewLeadModal,
  onOpenQuickLogModal,
}) => {
  const {
    filteredLeads,
    filteredMeetings,
    updateMeeting,
    updateLead,
    activeCompany,
    calculateFunnelForPeriod,
    selectedCompanyId,
    filteredWorkBlocks,
    userTimezone,
    companies,
    addWorkBlock,
    deleteWorkBlock,
  } = useCRM();

  const todayStr = new Date().toISOString().split('T')[0];

  // Work block scheduling state
  const { activeBlock, currentDay, currentTimeStr, nextBlock } = getActiveWorkBlock(
    filteredWorkBlocks,
    userTimezone
  );

  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockDay, setNewBlockDay] = useState<DayOfWeek>(currentDay);
  const [newBlockStartTime, setNewBlockStartTime] = useState('09:00');
  const [newBlockEndTime, setNewBlockEndTime] = useState('11:00');
  const [newBlockType, setNewBlockType] = useState<WorkBlockType>('Outreach en frío');
  const [newBlockCompanyId, setNewBlockCompanyId] = useState(
    selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || ''
  );
  const [newBlockObjective, setNewBlockObjective] = useState('');

  const todayWorkBlocks = filteredWorkBlocks.filter((b) => b.day === currentDay);

  // Daily metrics
  const funnelToday = calculateFunnelForPeriod(
    selectedCompanyId,
    'Diario',
    todayStr,
    todayStr
  );

  // Today's meetings
  const todayMeetings = filteredMeetings.filter((m) =>
    m.dateTime.startsWith(todayStr) || m.status === 'Confirmada'
  );

  // Group leads by Semáforo
  const greenLeads = filteredLeads.filter(
    (l) => l.semaforo === 'Verde' && l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido'
  );
  const yellowLeads = filteredLeads.filter(
    (l) => l.semaforo === 'Amarillo' && l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido'
  );
  const redLeads = filteredLeads.filter(
    (l) => l.semaforo === 'Rojo' && l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido'
  );

  const handleMeetingStatusChange = (meetingId: string, status: Meeting['status']) => {
    updateMeeting(meetingId, { status });
  };

  const handleCreateWorkBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkBlock({
      day: newBlockDay,
      startTime: newBlockStartTime,
      endTime: newBlockEndTime,
      type: newBlockType,
      companyId: newBlockCompanyId,
      objective: newBlockObjective || `Sesión de ${newBlockType}`,
    });
    setShowAddBlockModal(false);
    setNewBlockObjective('');
  };

  return (
    <div id="screen-hoy" className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Cockpit de Operaciones — Hoy
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {activeCompany
              ? `Prioridades y agenda para ${activeCompany.name}`
              : 'Vista consolidada de prospección y agenda multi-empresa'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-quick-log"
            onClick={onOpenQuickLogModal}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700/60 shadow-2xs transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
            <span>Registrar Actividad</span>
          </button>

          <button
            id="btn-new-lead-hoy"
            onClick={onOpenNewLeadModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Outreach Hoy
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              {funnelToday.outreach.actual}
            </span>
            <span className="text-xs text-stone-400">Meta: {funnelToday.outreach.target}</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, funnelToday.outreach.percentage)}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Reuniones Hoy
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              {todayMeetings.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {todayMeetings.filter((m) => m.status === 'Confirmada').length} Activas
            </span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Leads Calientes (Verde)
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {greenLeads.length}
            </span>
            <span className="text-xs text-stone-400">Listos para cierre</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full w-3/4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Pipeline Activo
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              ${(funnelToday.pipelineGenerated.actual / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-stone-400">USD</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full w-4/5" />
          </div>
        </div>
      </div>

      {/* Active Work Block & Daily Routine Control */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Rutina Operativa por Bloques de Tiempo
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {currentDay} • {currentTimeStr} ({userTimezone.split('/')[1]?.replace('_', ' ') || userTimezone})
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Organización de alta productividad para el Setter Digital Remoto
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddBlockModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 shadow-2xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Bloque</span>
          </button>
        </div>

        {/* Active Block Spotlight Card */}
        {activeBlock ? (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <span className="flex h-3 w-3 relative mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Bloque Activo Ahora: {activeBlock.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                    {activeBlock.startTime} - {activeBlock.endTime}
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                  🎯 {activeBlock.objective}
                </p>
                {activeBlock.companyId && (
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Empresa asignada:{' '}
                    <strong>
                      {companies.find((c) => c.id === activeBlock.companyId)?.name || 'General'}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenQuickLogModal}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition inline-flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Registrar en este bloque</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>
                Sin bloque activo en este momento.{' '}
                {nextBlock ? (
                  <strong className="text-stone-800 dark:text-stone-200">
                    Próximo: {nextBlock.type} ({nextBlock.startTime} - {nextBlock.endTime})
                  </strong>
                ) : (
                  'No hay más bloques para hoy.'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Today's Blocks Schedule Timeline */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Cronograma de Hoy ({todayWorkBlocks.length} bloques)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {todayWorkBlocks.map((block) => {
              const isCurrent = activeBlock?.id === block.id;
              const isPast = currentTimeStr > block.endTime;
              const comp = companies.find((c) => c.id === block.companyId);

              return (
                <div
                  key={block.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                    isCurrent
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : isPast
                      ? 'border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-800/30 opacity-70'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-stone-800 dark:text-stone-200">
                      {block.startTime} - {block.endTime}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1 rounded bg-blue-600 text-white uppercase">
                        En curso
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-stone-900 dark:text-white truncate">
                    {block.type}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {comp ? comp.name : 'General'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Work Block Modal */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                Programar Bloque de Trabajo
              </h3>
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkBlock} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={newBlockDay}
                    onChange={(e) => setNewBlockDay(e.target.value as DayOfWeek)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value as WorkBlockType)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Outreach en frío">Outreach en frío</option>
                    <option value="Seguimiento y reactivación">Seguimiento y reactivación</option>
                    <option value="Agendamiento y confirmación">Agendamiento y confirmación</option>
                    <option value="Acompañamiento a cierres">Acompañamiento a cierres</option>
                    <option value="Formación y roleplay">Formación y roleplay</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={newBlockStartTime}
                    onChange={(e) => setNewBlockStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={newBlockEndTime}
                    onChange={(e) => setNewBlockEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Empresa Objetivo
                </label>
                <select
                  value={newBlockCompanyId}
                  onChange={(e) => setNewBlockCompanyId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="">General / Todas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Objetivo / Meta del Bloque
                </label>
                <input
                  type="text"
                  placeholder="Ej. Enviar 25 mensajes en LinkedIn a directores de IT"
                  value={newBlockObjective}
                  onChange={(e) => setNewBlockObjective(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg hover:bg-stone-800"
                >
                  Guardar Bloque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Agenda Today & Semáforo Action List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Agenda de Reuniones */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Agenda & Sesiones de Hoy
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {todayMeetings.length} citas
            </span>
          </div>

          <div className="space-y-3">
            {todayMeetings.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                <CalendarDays className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  No hay reuniones agendadas para hoy.
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Enfócate en prospectar y pasar leads de Amarillo a Verde.
                </p>
              </div>
            ) : (
              todayMeetings.map((meeting) => {
                const lead = filteredLeads.find((l) => l.id === meeting.leadId);
                return (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3 hover:border-stone-300 dark:hover:border-stone-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            {meeting.dateTime.split(' ')[1] || '11:00 AM'}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              meeting.status === 'Confirmada'
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : meeting.status === 'Realizada'
                                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {meeting.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-stone-900 dark:text-white mt-1">
                          {lead ? lead.name : 'Prospecto'} —{' '}
                          <span className="font-normal text-stone-500 dark:text-stone-400">
                            {lead?.companyContact}
                          </span>
                        </h3>
                        <div className="flex items-center space-x-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          <span>Closer: {meeting.closerName}</span>
                          {lead && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              Hora lead: {getLeadLocalTimeInfo(lead.timezone).formattedTime}
                            </span>
                          )}
                        </div>
                      </div>

                      {meeting.link && (
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                          title="Abrir enlace de reunión"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {meeting.qualificationNotes && (
                      <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 text-[11px] text-stone-600 dark:text-stone-300 border border-stone-100 dark:border-stone-800">
                        <span className="font-semibold text-stone-700 dark:text-stone-200">
                          Notas Previas BANT:{' '}
                        </span>
                        {meeting.qualificationNotes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      {lead && (
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium inline-flex items-center space-x-1"
                        >
                          <span>Ver Ficha Lead</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <select
                        value={meeting.status}
                        onChange={(e) =>
                          handleMeetingStatusChange(meeting.id, e.target.value as Meeting['status'])
                        }
                        className="text-[11px] py-1 px-2 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        <option value="Confirmada">Confirmada</option>
                        <option value="Realizada">Realizada</option>
                        <option value="No-show">No-show</option>
                        <option value="Reprogramada">Reprogramada</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Semáforo Action Center */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Prioridades por Semáforo (Acción Táctica Inmediata)
              </h2>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              SLA Activo &lt; 5 min
            </span>
          </div>

          <div className="space-y-4">
            {/* Green Leads (Calientes) */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-4.5"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Semáforo Verde — Confirmar Agendamiento ({greenLeads.length})
                  </h3>
                </div>
              </div>

              {greenLeads.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay leads en Verde actualmente.</p>
              ) : (
                <div className="space-y-2.5">
                  {greenLeads.map((lead) => {
                    const leadTz = getLeadLocalTimeInfo(lead.timezone);
                    return (
                      <div
                        key={lead.id}
                        className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-stone-900 dark:text-white">
                              {lead.name}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                              • {lead.companyContact}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              ICP {lead.icpScore}%
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                leadTz.isInBusinessHours
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              🕒 {leadTz.formattedTime}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-1">
                            👉 {lead.nextAction}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => onNavigateToIA(lead)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition inline-flex items-center space-x-1"
                            title="Consultar recursos con IA"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>IA Recurso</span>
                          </button>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 transition"
                          >
                            Ver Ficha
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Yellow Leads (Tibios / Objeciones) */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Semáforo Amarillo — Enviar Video / Tratar Objeción ({yellowLeads.length})
                  </h3>
                </div>
              </div>

              {yellowLeads.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay leads en Amarillo.</p>
              ) : (
                <div className="space-y-2.5">
                  {yellowLeads.map((lead) => {
                    const leadTz = getLeadLocalTimeInfo(lead.timezone);
                    return (
                      <div
                        key={lead.id}
                        className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-amber-100 dark:border-amber-900/40 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-stone-900 dark:text-white">
                              {lead.name}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                              • {lead.companyContact}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                leadTz.isInBusinessHours
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              🕒 {leadTz.formattedTime}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 dark:text-amber-200/90 line-clamp-1">
                            ⚠️ {lead.semaforoDescription}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => onNavigateToIA(lead)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition inline-flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Desarmar Objeción</span>
                          </button>
                          <button
                            onClick={() => onSelectLead(lead)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 transition"
                          >
                            Ficha
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Red Leads (Fríos / Seguimiento) */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Semáforo Rojo — Reactivación o Descarte ({redLeads.length})
                  </h3>
                </div>
              </div>

              {redLeads.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay leads en Rojo.</p>
              ) : (
                <div className="space-y-2">
                  {redLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-medium text-stone-900 dark:text-white">
                          {lead.name}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 ml-1.5">
                          ({lead.companyContact})
                        </span>
                      </div>
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-medium flex-shrink-0"
                      >
                        Gestionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
