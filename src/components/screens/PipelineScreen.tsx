import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Lead,
  CRMStage,
  SemaforoColor,
  Temperature,
  InteractionChannel,
  InteractionType,
} from '../../types';
import { COMMON_TIMEZONES, getLeadLocalTimeInfo } from '../../utils/timezones';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  Linkedin,
  MessageSquare,
  Sparkles,
  X,
  Send,
  Trash2,
  Edit,
  Flame,
  Clock,
  ChevronRight,
  ExternalLink,
  Globe,
  Target,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Check,
  Archive,
  ArchiveRestore,
  Inbox,
  Sparkle,
  CheckCheck,
} from 'lucide-react';
import { ConfirmWordModal } from '../common/ConfirmWordModal';

const STAGES: { id: CRMStage; label: string; color: string }[] = [
  { id: 'Identificado', label: 'Identificado', color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' },
  { id: 'Contactado', label: 'Contactado', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'En Conversación', label: 'En Conversación', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'Calificado BANT', label: 'Calificado BANT', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'Reunión Agendada', label: 'Reunión Agendada', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'Propuesta Enviada', label: 'Propuesta Enviada', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
  { id: 'Cerrado Ganado', label: 'Cerrado Ganado', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'Cerrado Perdido', label: 'Cerrado Perdido', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
];

interface PipelineScreenProps {
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead | null) => void;
  onNavigateToIA: (lead: Lead) => void;
}

export const PipelineScreen: React.FC<PipelineScreenProps> = ({
  selectedLeadId,
  onSelectLead,
  onNavigateToIA,
}) => {
  const {
    filteredLeads,
    companies,
    addLead,
    updateLead,
    deleteLead,
    archiveLead,
    unarchiveLead,
    pendingArchivalSuggestion,
    dismissArchivalSuggestion,
    confirmArchivalSuggestion,
    checkCrossCompanyConflict,
    getLeadInteractions,
    addInteraction,
    addMeeting,
    addProposal,
    selectedCompanyId,
    evaluateLeadICP,
    confirmLeadICPScore,
    addFeedback,
  } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [archiveTab, setArchiveTab] = useState<'active' | 'archived' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [semaforoFilter, setSemaforoFilter] = useState<string>('all');

  // ICP Evaluation State
  const [isEvaluatingICP, setIsEvaluatingICP] = useState(false);
  const [evaluatingError, setEvaluatingError] = useState<string | null>(null);
  const [isEditingJustification, setIsEditingJustification] = useState(false);
  const [tempJustification, setTempJustification] = useState('');
  const [isEditingCustomScore, setIsEditingCustomScore] = useState(false);
  const [tempCustomScore, setTempCustomScore] = useState(80);

  // Feedback IA State
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackReasonOpen, setFeedbackReasonOpen] = useState(false);
  const [feedbackReasonText, setFeedbackReasonText] = useState('');
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState(false);

  // New Lead Modal
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newLeadCompanyId, setNewLeadCompanyId] = useState(
    selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || ''
  );
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompanyContact, setNewLeadCompanyContact] = useState('');
  const [newLeadPosition, setNewLeadPosition] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadLinkedin, setNewLeadLinkedin] = useState('');
  const [newLeadTimezone, setNewLeadTimezone] = useState('America/Mexico_City');
  const [newLeadEstimatedValue, setNewLeadEstimatedValue] = useState('10000');
  const [newLeadIcpScore, setNewLeadIcpScore] = useState('80');
  const [newLeadSemaforo, setNewLeadSemaforo] = useState<SemaforoColor>('Amarillo');
  const [newLeadNextAction, setNewLeadNextAction] = useState('');
  const [newLeadSummary, setNewLeadSummary] = useState('');

  // Conflict state
  const conflictWarning = checkCrossCompanyConflict(newLeadEmail, newLeadLinkedin);

  // Active Lead Detail State
  const activeLead = filteredLeads.find((l) => l.id === selectedLeadId) || null;

  // New interaction form state
  const [interactionChannel, setInteractionChannel] = useState<InteractionChannel>('LinkedIn');
  const [interactionType, setInteractionType] = useState<InteractionType>('Seguimiento');
  const [interactionNote, setInteractionNote] = useState('');

  // Count by archival status
  const activeCount = filteredLeads.filter((l) => !l.isArchived).length;
  const archivedCount = filteredLeads.filter((l) => !!l.isArchived).length;
  const totalCount = filteredLeads.length;

  // Filter leads
  const searchedLeads = filteredLeads.filter((l) => {
    // Archival tab condition
    if (archiveTab === 'active' && l.isArchived) return false;
    if (archiveTab === 'archived' && !l.isArchived) return false;

    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.companyContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    const matchesSemaforo = semaforoFilter === 'all' || l.semaforo === semaforoFilter;
    return matchesSearch && matchesStage && matchesSemaforo;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompanyContact) return;

    const created = addLead({
      companyId: newLeadCompanyId,
      name: newLeadName,
      companyContact: newLeadCompanyContact,
      position: newLeadPosition || 'Decision Maker',
      email: newLeadEmail || 'contacto@empresa.com',
      phone: newLeadPhone || '',
      linkedin: newLeadLinkedin || '',
      timezone: newLeadTimezone || 'America/Mexico_City',
      stage: 'Identificado',
      bant: { budget: false, authority: false, need: false, timeline: false },
      icpScore: Number(newLeadIcpScore) || 75,
      temperature: 'Tibio',
      semaforo: newLeadSemaforo,
      semaforoDescription: 'Lead recién ingresado al CRM.',
      nextAction: newLeadNextAction || 'Primer contacto por LinkedIn/Email.',
      estimatedValue: Number(newLeadEstimatedValue) || 5000,
      summary: newLeadSummary || `Contacto inicial con ${newLeadName} (${newLeadCompanyContact}).`,
      summaryUpdatedAt: new Date().toISOString().split('T')[0],
      followUpDate: new Date().toISOString().split('T')[0],
    });

    setShowNewLeadModal(false);
    onSelectLead(created);

    // Reset fields
    setNewLeadName('');
    setNewLeadCompanyContact('');
    setNewLeadPosition('');
    setNewLeadEmail('');
    setNewLeadPhone('');
    setNewLeadLinkedin('');
    setNewLeadSummary('');
    setNewLeadNextAction('');
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !interactionNote.trim()) return;

    addInteraction({
      leadId: activeLead.id,
      date: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      channel: interactionChannel,
      type: interactionType,
      note: interactionNote,
    });

    // Update lead summary if it was an objection or positive response
    const updatedSummary = `${activeLead.summary}\n• [${interactionChannel} - ${interactionType}]: ${interactionNote}`;
    updateLead(activeLead.id, {
      summary: updatedSummary,
      summaryUpdatedAt: new Date().toISOString().split('T')[0],
    });

    setInteractionNote('');
  };

  const isIcpEvaluationOutdated = (lead: Lead, leadInteractions: any[]) => {
    if (!lead.icpLastEvaluated) return false;
    const lastEvalTime = new Date(lead.icpLastEvaluated).getTime();
    return leadInteractions.some((i) => {
      const intTime = new Date(i.date).getTime();
      return !isNaN(intTime) && intTime > lastEvalTime;
    });
  };

  const handleEvaluateLeadICP = async (leadId: string) => {
    setIsEvaluatingICP(true);
    setEvaluatingError(null);
    try {
      const result = await evaluateLeadICP(leadId);
      setTempJustification(result.justification);
      setTempCustomScore(result.score);
    } catch (err: any) {
      setEvaluatingError(err.message || 'Error al evaluar ICP con IA');
    } finally {
      setIsEvaluatingICP(false);
    }
  };

  const handleConfirmScore = (leadId: string) => {
    confirmLeadICPScore(leadId);
  };

  const handleSaveCustomScoreAndJustification = (leadId: string) => {
    confirmLeadICPScore(leadId, Number(tempCustomScore), tempJustification);
    setIsEditingJustification(false);
    setIsEditingCustomScore(false);
  };

  const handleSendFeedback = (lead: Lead) => {
    if (!feedbackRating) return;
    addFeedback({
      chatOrigin: 'Evaluación ICP',
      leadId: lead.id,
      contextSent: `Evaluación de ICP para ${lead.name} (${lead.companyContact} - ${lead.position}). Score calculado: ${lead.icpScore}%. BANT: ${[lead.bant.budget, lead.bant.authority, lead.bant.need, lead.bant.timeline].filter(Boolean).length}/4.`,
      aiResponse: lead.icpJustification || 'Sin justificación previa.',
      rating: feedbackRating,
      reason: feedbackReasonText || undefined,
    });
    setFeedbackReasonOpen(false);
    setFeedbackReasonText('');
    setFeedbackSuccessToast(true);
    setTimeout(() => setFeedbackSuccessToast(false), 4000);
  };

  return (
    <div id="screen-pipeline" className="space-y-6 animate-fadeIn">
      {/* Archival Suggestion Floating Banner */}
      {pendingArchivalSuggestion && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                ¿Archivar prospecto cerrado?
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Has marcado a <span className="font-semibold">{pendingArchivalSuggestion.lead.name}</span> como{' '}
                <span className="font-semibold">{pendingArchivalSuggestion.suggestedStage}</span>. ¿Deseas archivarlo para mantener el Pipeline activo despejado?
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => dismissArchivalSuggestion()}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
            >
              Mantener en Pipeline Activo
            </button>
            <button
              onClick={() => confirmArchivalSuggestion(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivar Lead</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Pipeline Comercial & Leads
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Gestión integral de etapas, calificación BANT y semáforo de prospectos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Archival Status Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
            <button
              onClick={() => setArchiveTab('active')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 ${
                archiveTab === 'active'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Activos ({activeCount})</span>
            </button>
            <button
              onClick={() => setArchiveTab('archived')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 ${
                archiveTab === 'archived'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Archivados ({archivedCount})</span>
            </button>
            <button
              onClick={() => setArchiveTab('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1.5 ${
                archiveTab === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span>Todos ({totalCount})</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
              title="Vista Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-create-lead-pipeline"
            onClick={() => setShowNewLeadModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300"
          >
            <option value="all">Todas las Etapas ({filteredLeads.length})</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={semaforoFilter}
            onChange={(e) => setSemaforoFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300"
          >
            <option value="all">Todos los Semáforos</option>
            <option value="Verde">🟢 Verde (Caliente / Listo)</option>
            <option value="Amarillo">🟡 Amarillo (Objeción / Nutrición)</option>
            <option value="Rojo">🔴 Rojo (Frío / Reactivar)</option>
          </select>
        </div>
      </div>

      {/* Main View: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-[1300px]">
            {STAGES.map((stage) => {
              const stageLeads = searchedLeads.filter((l) => l.stage === stage.id);
              const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

              return (
                <div
                  key={stage.id}
                  className="w-72 flex-shrink-0 rounded-2xl bg-stone-100/70 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          {stageLeads.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-mono">
                        ${(stageValue / 1000).toFixed(1)}k USD
                      </p>
                    </div>
                  </div>

                  {/* Lead Cards List */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-stone-400 italic">
                        Sin prospectos
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const comp = companies.find((c) => c.id === lead.companyId);
                        const isSelected = activeLead?.id === lead.id;

                        return (
                          <div
                            key={lead.id}
                            onClick={() => onSelectLead(lead)}
                            className={`p-3.5 rounded-xl border bg-white dark:bg-stone-900 cursor-pointer transition-all shadow-2xs hover:shadow-sm space-y-2 ${
                              isSelected
                                ? 'border-stone-900 dark:border-white ring-1 ring-stone-900 dark:ring-white'
                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                            }`}
                          >
                            {/* Card Top: Company Badge & Semáforo */}
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[140px]"
                                style={{
                                  backgroundColor: `${comp?.color}15`,
                                  color: comp?.color || '#3b82f6',
                                }}
                              >
                                {comp?.name || 'Empresa'}
                              </span>

                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    lead.semaforo === 'Verde'
                                      ? 'bg-emerald-500'
                                      : lead.semaforo === 'Amarillo'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  title={`Semáforo: ${lead.semaforo}`}
                                />
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                    lead.icpScoreStatus === 'Sugerido por IA'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
                                      : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                  }`}
                                  title={`ICP Score: ${lead.icpScore}% (${lead.icpScoreStatus || 'Confirmado por usuario'})`}
                                >
                                  <span>{lead.icpScore}%</span>
                                  {lead.icpScoreStatus === 'Sugerido por IA' ? (
                                    <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                                  ) : (
                                    <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Lead Name & Title */}
                            <div>
                              <h4 className="font-bold text-xs text-stone-900 dark:text-white leading-snug">
                                {lead.name}
                              </h4>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {lead.position} • {lead.companyContact}
                              </p>
                            </div>

                            {/* Timezone / Local Time Indicator */}
                            {(() => {
                              const tzInfo = getLeadLocalTimeInfo(lead.timezone || 'America/Bogota');
                              return (
                                <div className="flex items-center space-x-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  <span className="font-mono font-medium text-stone-700 dark:text-stone-300">
                                    {tzInfo.formattedTime}
                                  </span>
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      tzInfo.isInBusinessHours ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                                    }`}
                                    title={tzInfo.businessStatusText}
                                  />
                                </div>
                              );
                            })()}

                            {/* Next Action */}
                            {lead.nextAction && (
                              <p className="text-[10px] text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 p-1.5 rounded-md line-clamp-2">
                                👉 {lead.nextAction}
                              </p>
                            )}

                            {/* Card Footer: Value & BANT count */}
                            <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 dark:text-stone-400">
                              <span className="font-semibold text-stone-800 dark:text-stone-200">
                                ${lead.estimatedValue.toLocaleString()}
                              </span>

                              <span className="font-mono">
                                BANT: {[lead.bant.budget, lead.bant.authority, lead.bant.need, lead.bant.timeline].filter(Boolean).length}/4
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Prospecto / Empresa</th>
                  <th className="py-3 px-4">Empresa Cliente</th>
                  <th className="py-3 px-4">Hora Local</th>
                  <th className="py-3 px-4">Etapa CRM</th>
                  <th className="py-3 px-4">Semáforo</th>
                  <th className="py-3 px-4">ICP Score</th>
                  <th className="py-3 px-4">BANT</th>
                  <th className="py-3 px-4">Valor Est.</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {searchedLeads.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400 dark:text-stone-500 italic">
                      No hay prospectos registrados con los filtros seleccionados.
                    </td>
                  </tr>
                )}
                {searchedLeads.map((lead) => {
                  const comp = companies.find((c) => c.id === lead.companyId);
                  const tzInfo = getLeadLocalTimeInfo(lead.timezone || 'America/Bogota');
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 dark:text-white">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-stone-500">{lead.companyContact}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-800 dark:text-stone-200">
                          {comp?.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span className="font-mono">{tzInfo.formattedTime}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tzInfo.isInBusinessHours ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                            }`}
                            title={tzInfo.businessStatusText}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              lead.semaforo === 'Verde'
                                ? 'bg-emerald-500'
                                : lead.semaforo === 'Amarillo'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>{lead.semaforo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                            lead.icpScoreStatus === 'Sugerido por IA'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          <span>{lead.icpScore}%</span>
                          {lead.icpScoreStatus === 'Sugerido por IA' ? (
                            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {[lead.bant.budget, lead.bant.authority, lead.bant.need, lead.bant.timeline].filter(Boolean).length}/4
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900 dark:text-white">
                        ${lead.estimatedValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200"
                        >
                          Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Drawer / Modal: Lead Detail */}
      {activeLead && (
        <div
          id="lead-detail-drawer"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between bg-stone-50/50 dark:bg-stone-800/50">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {companies.find((c) => c.id === activeLead.companyId)?.name}
                </span>
                {activeLead.isArchived ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center space-x-1">
                    <Archive className="w-3 h-3" />
                    <span>Archivado ({activeLead.archivedReason || 'Cerrado'})</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 inline-flex items-center space-x-1">
                    <Inbox className="w-3 h-3" />
                    <span>Lead Activo</span>
                  </span>
                )}
                {activeLead.notionPageId ? (
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 inline-flex items-center space-x-1"
                    title={`Sincronizado en Notion. Page ID: ${activeLead.notionPageId}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Notion Sync</span>
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                {activeLead.name}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {activeLead.position} • {activeLead.companyContact}
              </p>
            </div>

            <button
              onClick={() => onSelectLead(null)}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Quick Actions Row */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateToIA(activeLead)}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs inline-flex items-center justify-center space-x-1.5 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consultar Recursos con IA</span>
              </button>

              {activeLead.linkedin && (
                <a
                  href={activeLead.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  title="Abrir LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                </a>
              )}

              {activeLead.phone && (
                <a
                  href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  title="Enviar WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </a>
              )}
            </div>

            {/* Timezone & Real-Time Local Clock */}
            {(() => {
              const tzInfo = getLeadLocalTimeInfo(activeLead.timezone || 'America/Bogota');
              return (
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                        Zona Horaria & Hora Local
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        tzInfo.isInBusinessHours
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {tzInfo.businessStatusText}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-stone-900 dark:text-white">
                      {tzInfo.formattedTime}
                    </span>
                    <span className="text-xs text-stone-500">
                      {tzInfo.gmtOffset}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                      Ajustar Zona Horaria
                    </label>
                    <select
                      value={activeLead.timezone || 'America/Bogota'}
                      onChange={(e) => updateLead(activeLead.id, { timezone: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label} ({tz.utcOffset})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })()}

            {/* Stage & Semáforo Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Etapa CRM
                </label>
                <select
                  value={activeLead.stage}
                  onChange={(e) => updateLead(activeLead.id, { stage: e.target.value as CRMStage })}
                  className="w-full text-xs py-2 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Semáforo
                </label>
                <select
                  value={activeLead.semaforo}
                  onChange={(e) =>
                    updateLead(activeLead.id, { semaforo: e.target.value as SemaforoColor })
                  }
                  className="w-full text-xs py-2 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
                >
                  <option value="Verde">🟢 Verde (Caliente)</option>
                  <option value="Amarillo">🟡 Amarillo (Objeción)</option>
                  <option value="Rojo">🔴 Rojo (Frío / Sin respuesta)</option>
                </select>
              </div>
            </div>

            {/* BANT Qualification Checklist */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Calificación BANT
                </h3>
                <span className="text-[11px] font-mono text-stone-500">
                  {[activeLead.bant.budget, activeLead.bant.authority, activeLead.bant.need, activeLead.bant.timeline].filter(Boolean).length}/4 Cumplidos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'budget', label: 'Budget (Presupuesto)' },
                  { key: 'authority', label: 'Authority (Poder Decisión)' },
                  { key: 'need', label: 'Need (Dolor Validado)' },
                  { key: 'timeline', label: 'Timeline (Plazo de Compra)' },
                ].map((item) => {
                  const isChecked = (activeLead.bant as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className="flex items-center space-x-2 text-xs text-stone-700 dark:text-stone-300 p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-700/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          updateLead(activeLead.id, {
                            bant: { ...activeLead.bant, [item.key]: e.target.checked },
                          })
                        }
                        className="rounded text-stone-900 focus:ring-stone-400"
                      />
                      <span className="font-medium text-[11px] truncate">{item.label}</span>
                    </label>
                  );
                })}
              </div>

              {activeLead.bant.notes && (
                <p className="text-[11px] text-stone-500 italic mt-1">
                  Nota BANT: {activeLead.bant.notes}
                </p>
              )}
            </div>

            {/* Resumen Actual (Contexto para IA) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Resumen Actual (Contexto Dinámico IA)
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  Actualizado: {activeLead.summaryUpdatedAt}
                </span>
              </div>
              <textarea
                value={activeLead.summary}
                onChange={(e) => updateLead(activeLead.id, { summary: e.target.value })}
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>

            {/* Valor Estimado ($) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1">
                Valor Estimado de Negocio ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={activeLead.estimatedValue}
                  onChange={(e) =>
                    updateLead(activeLead.id, { estimatedValue: Number(e.target.value) || 0 })
                  }
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            {/* Evaluación de ICP Asistida por IA (Ideal Customer Profile) */}
            <div className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 dark:from-purple-950/30 dark:via-stone-900 dark:to-purple-950/20 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-2xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span>Evaluación de ICP con IA</span>
                    </h3>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                      Alineación con Perfil de Cliente Ideal
                    </span>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-3 py-1 rounded-xl text-center font-mono font-bold text-sm shadow-2xs flex items-center gap-1 ${
                      activeLead.icpScore >= 85
                        ? 'bg-emerald-600 text-white'
                        : activeLead.icpScore >= 70
                        ? 'bg-purple-600 text-white'
                        : activeLead.icpScore >= 50
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <span>{activeLead.icpScore}%</span>
                  </div>
                </div>
              </div>

              {/* Status & Last Evaluated Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40 text-[11px]">
                <div className="flex items-center space-x-2">
                  {activeLead.icpScoreStatus === 'Sugerido por IA' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/60">
                      <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                      <span>Sugerido por IA</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/60">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                      <span>Confirmado por usuario</span>
                    </span>
                  )}

                  {activeLead.icpLastEvaluated && (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      {new Date(activeLead.icpLastEvaluated).toLocaleDateString()} {new Date(activeLead.icpLastEvaluated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleEvaluateLeadICP(activeLead.id)}
                  disabled={isEvaluatingICP}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-2xs transition"
                >
                  {isEvaluatingICP ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Evaluar ICP con IA</span>
                    </>
                  )}
                </button>
              </div>

              {evaluatingError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{evaluatingError}</span>
                </div>
              )}

              {/* Outdated Warning */}
              {isIcpEvaluationOutdated(activeLead, getLeadInteractions(activeLead.id)) && (
                <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Aviso de actualización:</strong> Hay nuevas interacciones registradas después de la última evaluación. Considera pulsar <em>"Evaluar ICP con IA"</em> para actualizar el puntaje con la información más reciente.
                  </div>
                </div>
              )}

              {/* Justification Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    Justificación de la Calificación
                  </label>
                  {!isEditingJustification ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTempJustification(activeLead.icpJustification || '');
                        setTempCustomScore(activeLead.icpScore);
                        setIsEditingJustification(true);
                      }}
                      className="text-[10px] text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center space-x-1 font-medium"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar o ajustar score manual</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setIsEditingJustification(false)}
                        className="text-stone-500 hover:underline"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCustomScoreAndJustification(activeLead.id)}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  )}
                </div>

                {isEditingJustification ? (
                  <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-stone-850 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                        Score ICP (0-100):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={tempCustomScore}
                        onChange={(e) => setTempCustomScore(Number(e.target.value) || 0)}
                        className="w-20 p-1 text-xs font-mono font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={tempJustification}
                      onChange={(e) => setTempJustification(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 leading-relaxed focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      placeholder="Escribe la justificación comercial del puntaje..."
                    />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/90 dark:bg-stone-900 border border-purple-100 dark:border-purple-900/40 text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-2xs">
                    {activeLead.icpJustification ? (
                      <p className="italic text-stone-700 dark:text-stone-300">
                        "{activeLead.icpJustification}"
                      </p>
                    ) : (
                      <span className="italic text-stone-400">
                        Sin justificación registrada aún. Presiona <strong>"Evaluar ICP con IA"</strong> para que Gemini compare este prospecto contra el perfil objetivo de la empresa.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm button if 'Sugerido por IA' */}
              {activeLead.icpScoreStatus === 'Sugerido por IA' && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-900/30 border border-purple-200/70 dark:border-purple-800/50">
                  <span className="text-[11px] text-purple-900 dark:text-purple-200">
                    ¿Revisaste el análisis y coincide con tu criterio comercial?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConfirmScore(activeLead.id)}
                    className="px-3 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[11px] font-bold rounded-lg shadow-2xs inline-flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Confirmar Score</span>
                  </button>
                </div>
              )}

              {/* Feedback IA Widget */}
              <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium">
                    ¿Qué tan acertada fue esta evaluación de la IA?
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackRating('positive');
                        setFeedbackReasonOpen(true);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        feedbackRating === 'positive'
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                      title="Evaluación acertada"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackRating('negative');
                        setFeedbackReasonOpen(true);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        feedbackRating === 'negative'
                          ? 'bg-rose-100 border-rose-400 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                      title="Evaluación imprecisa"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {feedbackReasonOpen && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-2">
                    <input
                      type="text"
                      value={feedbackReasonText}
                      onChange={(e) => setFeedbackReasonText(e.target.value)}
                      placeholder="Razón o comentario sobre la precisión (opcional)..."
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                    />
                    <div className="flex justify-end space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setFeedbackReasonOpen(false)}
                        className="px-2 py-1 text-stone-500 hover:text-stone-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendFeedback(activeLead)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-2xs"
                      >
                        Enviar Retroalimentación
                      </button>
                    </div>
                  </div>
                )}

                {feedbackSuccessToast && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Gracias! Retroalimentación guardada en el registro de Feedback IA.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactions Log */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Historial de Interacciones
                </h3>
                <span className="text-[10px] text-stone-400">
                  {getLeadInteractions(activeLead.id).length} registros
                </span>
              </div>

              {/* Add Interaction Mini-Form */}
              <form onSubmit={handleAddInteraction} className="space-y-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={interactionChannel}
                    onChange={(e) => setInteractionChannel(e.target.value as InteractionChannel)}
                    className="text-xs p-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Email">Email</option>
                    <option value="Llamada">Llamada</option>
                  </select>

                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                    className="text-xs p-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="Primer contacto">Primer contacto</option>
                    <option value="Respuesta positiva">Respuesta positiva</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Objeción">Objeción</option>
                    <option value="Cierre">Cierre</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nota de la interacción..."
                    value={interactionNote}
                    onChange={(e) => setInteractionNote(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              </form>

              {/* Interactions List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getLeadInteractions(activeLead.id).map((int) => (
                  <div
                    key={int.id}
                    className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {int.channel} • {int.type}
                      </span>
                      <span>{int.date}</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300">{int.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center space-x-1 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Eliminar permanentemente"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>

              {activeLead.isArchived ? (
                <button
                  onClick={() => {
                    unarchiveLead(activeLead.id);
                  }}
                  className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                >
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  <span>Desarchivar / Reactivar</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    archiveLead(activeLead.id, activeLead.stage);
                  }}
                  className="text-xs text-amber-700 dark:text-amber-300 font-semibold inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archivar Lead</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onSelectLead(null)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* Modal: Crear Lead con Detector de Conflicto de Interés */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Crear Nuevo Lead
                </h3>
                <p className="text-xs text-stone-500">
                  Ingresa los datos para iniciar la prospección
                </p>
              </div>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict of Interest Warning Alert */}
            {conflictWarning.exists && (
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span>Posible conflicto de interés detectado</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Este contacto ({conflictWarning.matchField}) ya existe registrado en{' '}
                  <strong>{conflictWarning.conflictingCompany?.name}</strong> con el lead{' '}
                  <strong>{conflictWarning.conflictingLead?.name}</strong>. Esta alerta es informativa y no bloquea la creación.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Empresa Cliente Asignada *
                </label>
                <select
                  value={newLeadCompanyId}
                  onChange={(e) => setNewLeadCompanyId(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nombre del Prospecto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Empresa del Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Logística Transandina"
                    value={newLeadCompanyContact}
                    onChange={(e) => setNewLeadCompanyContact(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cargo / Puesto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Director de IT"
                    value={newLeadPosition}
                    onChange={(e) => setNewLeadPosition(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@empresa.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+52 55 1234 5678"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Perfil LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={newLeadLinkedin}
                    onChange={(e) => setNewLeadLinkedin(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Valor de Negocio Estimado ($)
                  </label>
                  <input
                    type="number"
                    value={newLeadEstimatedValue}
                    onChange={(e) => setNewLeadEstimatedValue(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Semáforo Inicial
                  </label>
                  <select
                    value={newLeadSemaforo}
                    onChange={(e) => setNewLeadSemaforo(e.target.value as SemaforoColor)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium"
                  >
                    <option value="Amarillo">🟡 Amarillo (Por nutrir)</option>
                    <option value="Verde">🟢 Verde (Caliente)</option>
                    <option value="Rojo">🔴 Rojo (Frío)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Zona Horaria del Prospecto
                </label>
                <select
                  value={newLeadTimezone}
                  onChange={(e) => setNewLeadTimezone(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.utcOffset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Notas Iniciales / Dolor Detectado
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente el dolor o contexto inicial..."
                  value={newLeadSummary}
                  onChange={(e) => setNewLeadSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg hover:bg-stone-800"
                >
                  Guardar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación con Palabra 'confirmar' para Eliminar Prospecto */}
      {activeLead && (
        <ConfirmWordModal
          isOpen={isDeleteModalOpen}
          title={`¿Eliminar prospecto ${activeLead.name}?`}
          description={`Esta acción eliminará permanentemente al prospecto de la empresa ${
            companies.find((c) => c.id === activeLead.companyId)?.name || ''
          }, junto con todo su historial de interacciones, tareas y sincronización.`}
          details={`Prospecto: ${activeLead.name} (${activeLead.companyContact || 'Sin empresa'}) — Etapa: ${activeLead.stage}`}
          requiredWord="confirmar"
          confirmButtonText="Eliminar Prospecto"
          confirmButtonVariant="danger"
          onConfirm={() => {
            deleteLead(activeLead.id);
            onSelectLead(null);
            setIsDeleteModalOpen(false);
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
