import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Lead, ChatMessage, Resource } from '../../types';
import {
  Bot,
  Sparkles,
  Send,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  FileText,
  Video,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface IAScreenProps {
  initialLead?: Lead | null;
}

export const IAScreen: React.FC<IAScreenProps> = ({ initialLead }) => {
  const {
    filteredLeads,
    filteredResources,
    notebooks,
    updateNotebook,
    addFeedback,
    incrementResourceUsage,
    feedbackList,
    activeCompany,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'recursos' | 'coach' | 'cuadernillos'>('recursos');

  // Resource Chat State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLead?.id || (filteredLeads[0]?.id || '')
  );
  const [resourcePrompt, setResourcePrompt] = useState('');
  const [resourceMessages, setResourceMessages] = useState<ChatMessage[]>([
    {
      id: 'init-rec-1',
      sender: 'assistant',
      content:
        '👋 Hola, soy tu Asistente de Recursos. Selecciona un prospecto activo o escribe la objeción que estás enfrentando y te recomendaré el video, ficha o guion más efectivo de la biblioteca para desarmarla.',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoadingResource, setIsLoadingResource] = useState(false);

  // Coach Chat State
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>([
    {
      id: 'init-coach-1',
      sender: 'assistant',
      content:
        '🥋 Bienvenido al Coach BDR. Tengo cargado todo el Playbook operativo, matrices de objeción y metodologías de prospección. ¿En qué situación táctica o guion necesitas apoyo hoy?',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  // Feedback Modal
  const [feedbackTarget, setFeedbackTarget] = useState<{
    msgId: string;
    chatOrigin: 'Recursos' | 'Coach';
    rating: 'positive' | 'negative';
    contextSent: string;
    aiResponse: string;
    leadId?: string;
  } | null>(null);
  const [feedbackReason, setFeedbackReason] = useState('');

  // Notebook Inspector State
  const [selectedNotebookId, setSelectedNotebookId] = useState<'cuaderno_recursos' | 'cuaderno_coach'>('cuaderno_recursos');
  const activeNotebook = notebooks.find((n) => n.id === selectedNotebookId) || notebooks[0];
  const [notebookEditText, setNotebookEditText] = useState(activeNotebook?.content || '');
  const [isProposingUpdate, setIsProposingUpdate] = useState(false);
  const [proposedText, setProposedText] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const [savedNotebookMsg, setSavedNotebookMsg] = useState<string | null>(null);

  const currentLead = filteredLeads.find((l) => l.id === selectedLeadId) || null;

  // Handle Send in Resource Chat
  const handleSendResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourcePrompt.trim() && !currentLead) return;

    const userText = resourcePrompt.trim() || `Analizar al prospecto ${currentLead?.name} y sugerir recurso.`;
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      leadId: currentLead?.id,
    };

    setResourceMessages((prev) => [...prev, userMsg]);
    setResourcePrompt('');
    setIsLoadingResource(true);

    try {
      const cuadernoRecursos = notebooks.find((n) => n.id === 'cuaderno_recursos')?.content;
      const res = await fetch('/api/chat/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          leadContext: currentLead
            ? {
                name: currentLead.name,
                company: currentLead.companyContact,
                position: currentLead.position,
                stage: currentLead.stage,
                semaforo: currentLead.semaforo,
                summary: currentLead.summary,
                bant: currentLead.bant,
                nextAction: currentLead.nextAction,
              }
            : null,
          companyResources: filteredResources.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            link: r.link,
            description: r.description,
            tags: r.tags,
            recommendedSemaforos: r.recommendedSemaforos,
          })),
          notebookContext: cuadernoRecursos,
          history: resourceMessages.slice(-4),
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        content: data.reply || 'No se pudo obtener respuesta.',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        leadId: currentLead?.id,
      };
      setResourceMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setResourceMessages((prev) => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'assistant',
          content: 'Ocurrió un error de conexión con el servidor de IA.',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingResource(false);
    }
  };

  // Handle Send in Coach Chat
  const handleSendCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachPrompt.trim()) return;

    const userText = coachPrompt.trim();
    const userMsg: ChatMessage = {
      id: 'coach-user-' + Date.now(),
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setCoachPrompt('');
    setIsLoadingCoach(true);

    try {
      const cuadernoCoach = notebooks.find((n) => n.id === 'cuaderno_coach')?.content;
      const res = await fetch('/api/chat/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          notebookContext: cuadernoCoach,
          activeCompany: activeCompany,
          history: coachMessages.slice(-4),
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: 'coach-bot-' + Date.now(),
        sender: 'assistant',
        content: data.reply || 'No se pudo procesar la respuesta del Coach.',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setCoachMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setCoachMessages((prev) => [
        ...prev,
        {
          id: 'coach-err-' + Date.now(),
          sender: 'assistant',
          content: 'Error al consultar al Coach IA.',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  // Handle Feedback
  const handleTriggerFeedback = (
    msg: ChatMessage,
    chatOrigin: 'Recursos' | 'Coach',
    rating: 'positive' | 'negative'
  ) => {
    setFeedbackTarget({
      msgId: msg.id,
      chatOrigin,
      rating,
      contextSent: `Chat ${chatOrigin}`,
      aiResponse: msg.content,
      leadId: msg.leadId,
    });
    setFeedbackReason('');
  };

  const handleSaveFeedback = () => {
    if (!feedbackTarget) return;

    addFeedback({
      chatOrigin: feedbackTarget.chatOrigin,
      contextSent: feedbackTarget.contextSent,
      aiResponse: feedbackTarget.aiResponse,
      rating: feedbackTarget.rating,
      reason: feedbackReason,
      leadId: feedbackTarget.leadId,
    });

    // Mark in message state
    if (feedbackTarget.chatOrigin === 'Recursos') {
      setResourceMessages((prev) =>
        prev.map((m) =>
          m.id === feedbackTarget.msgId ? { ...m, feedbackGiven: feedbackTarget.rating } : m
        )
      );
    } else {
      setCoachMessages((prev) =>
        prev.map((m) =>
          m.id === feedbackTarget.msgId ? { ...m, feedbackGiven: feedbackTarget.rating } : m
        )
      );
    }

    setFeedbackTarget(null);
  };

  // Propose Notebook update
  const handleProposeNotebookUpdate = async () => {
    setIsProposingUpdate(true);
    setProposedText(null);
    try {
      const res = await fetch('/api/propose-notebook-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookType: activeNotebook.title,
          currentNotebook: activeNotebook.content,
          feedbackItems: feedbackList.filter(
            (f) =>
              (selectedNotebookId === 'cuaderno_recursos' && f.chatOrigin === 'Recursos') ||
              (selectedNotebookId === 'cuaderno_coach' && f.chatOrigin === 'Coach')
          ),
        }),
      });
      const data = await res.json();
      setProposedText(data.proposedNotebook || activeNotebook.content);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProposingUpdate(false);
    }
  };

  return (
    <div id="screen-ia" className="space-y-6 animate-fadeIn">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Asistentes de Inteligencia Artificial
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Recomendación táctica de recursos Drive + Playbook Coach BDR con Gemini 3.7
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <button
            id="tab-ia-recursos"
            onClick={() => setActiveTab('recursos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'recursos'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            🎯 Chat Recursos
          </button>
          <button
            id="tab-ia-coach"
            onClick={() => setActiveTab('coach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'coach'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            🥋 Coach BDR
          </button>
          <button
            id="tab-ia-cuadernillos"
            onClick={() => setActiveTab('cuadernillos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'cuadernillos'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            📖 Cuadernillos (.md)
          </button>
        </div>
      </div>

      {/* Mode 1: Chat de Recursos */}
      {activeTab === 'recursos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Context Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Prospecto Activo (Contexto Dinámico)
              </h2>

              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
              >
                {filteredLeads.length === 0 ? (
                  <option value="">(Sin prospectos registrados)</option>
                ) : (
                  filteredLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} — {lead.companyContact} ({lead.semaforo})
                    </option>
                  ))
                )}
              </select>

              {!currentLead && (
                <p className="text-[11px] text-stone-400 italic">
                  No hay prospecto seleccionado. La IA responderá consultas y sugerirá recursos generales de la biblioteca.
                </p>
              )}

              {currentLead && (
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Semáforo:</span>
                    <span className="font-semibold">{currentLead.semaforo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Etapa CRM:</span>
                    <span className="font-semibold">{currentLead.stage}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px] mb-1">Resumen Actual:</span>
                    <p className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed border border-stone-100 dark:border-stone-700/60">
                      {currentLead.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Available Resources Box */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                  Biblioteca de Recursos ({filteredResources.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 dark:text-white truncate max-w-[170px]">
                        {res.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {res.timesRecommended}x usado
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2">{res.description}</p>
                    <button
                      onClick={() => {
                        incrementResourceUsage(res.id);
                      }}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold inline-block pt-1"
                    >
                      + Registrar Uso Manual (+1)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Chat Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs overflow-hidden">
            {/* Chat Messages Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {resourceMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px]">
                        <span className="text-stone-400 text-[10px]">{msg.timestamp}</span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleTriggerFeedback(msg, 'Recursos', 'positive')}
                            className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 ${
                              msg.feedbackGiven === 'positive' ? 'text-emerald-600 font-bold' : 'text-stone-400'
                            }`}
                            title="Útil 👍"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTriggerFeedback(msg, 'Recursos', 'negative')}
                            className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 ${
                              msg.feedbackGiven === 'negative' ? 'text-rose-600 font-bold' : 'text-stone-400'
                            }`}
                            title="No útil 👎"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoadingResource && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-3 text-xs text-stone-500 inline-flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
                    <span>Analizando objeción y buscando el mejor recurso...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendResource}
              className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder={
                  currentLead
                    ? `Preguntar recomendación para ${currentLead.name} (ej. "El prospecto dice que no tiene presupuesto")...`
                    : 'Describe la objeción o situación...'
                }
                value={resourcePrompt}
                onChange={(e) => setResourcePrompt(e.target.value)}
                className="flex-1 text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={isLoadingResource}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mode 2: Chat Coach BDR */}
      {activeTab === 'coach' && (
        <div className="flex flex-col h-[650px] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Playbook Coach BDR — Modo Mentor Estratégico
              </span>
            </div>
            <span className="text-xs text-stone-400 font-mono">Gemini 3.7 Flash</span>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {coachMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px]">
                      <span className="text-stone-400 text-[10px]">{msg.timestamp}</span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleTriggerFeedback(msg, 'Coach', 'positive')}
                          className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 ${
                            msg.feedbackGiven === 'positive' ? 'text-emerald-600 font-bold' : 'text-stone-400'
                          }`}
                          title="Excelente consejo 👍"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTriggerFeedback(msg, 'Coach', 'negative')}
                          className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 ${
                            msg.feedbackGiven === 'negative' ? 'text-rose-600 font-bold' : 'text-stone-400'
                          }`}
                          title="Ajustar consejo 👎"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoadingCoach && (
              <div className="flex justify-start">
                <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-3 text-xs text-stone-500 inline-flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span>Coach consultando el Playbook BDR...</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendCoach}
            className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Pregúntale al Coach (ej. 'Dame un guion para WhatsApp para un CTO que no responde')..."
              value={coachPrompt}
              onChange={(e) => setCoachPrompt(e.target.value)}
              className="flex-1 text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoadingCoach}
              className="p-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mode 3: Cuadernillos (.md) Inspector & Editor */}
      {activeTab === 'cuadernillos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Cuadernillos de Contexto Fijo (.md en Google Drive)
                </h3>
                <p className="text-xs text-stone-500">
                  Inyectados automáticamente en cada llamada a Gemini para mantener la consistencia metodológica.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedNotebookId}
                onChange={(e) => {
                  const id = e.target.value as 'cuaderno_recursos' | 'cuaderno_coach';
                  setSelectedNotebookId(id);
                  const nb = notebooks.find((n) => n.id === id);
                  setNotebookEditText(nb?.content || '');
                  setProposedText(null);
                }}
                className="text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
              >
                <option value="cuaderno_recursos">cuaderno_recursos.md (Recursos)</option>
                <option value="cuaderno_coach">cuaderno_coach.md (Playbook Coach)</option>
              </select>

              <button
                onClick={handleProposeNotebookUpdate}
                disabled={isProposingUpdate}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProposingUpdate ? 'Analizando Feedback...' : 'Proponer Actualización con IA'}</span>
              </button>
            </div>
          </div>

          {/* Proposed Update Banner */}
          {proposedText && (
            <div className="p-4 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-3 animate-scaleUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-200">
                    Propuesta de Actualización basada en Feedback Reciente
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      updateNotebook(selectedNotebookId, proposedText);
                      setNotebookEditText(proposedText);
                      setProposedText(null);
                      setSavedNotebookMsg('¡Cuadernillo actualizado y guardado exitosamente!');
                      setTimeout(() => setSavedNotebookMsg(null), 4000);
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Aprobar y Guardar
                  </button>
                  <button
                    onClick={() => setProposedText(null)}
                    className="px-3 py-1 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium rounded-lg"
                  >
                    Descartar
                  </button>
                </div>
              </div>
              <pre className="text-xs p-3 rounded-xl bg-white dark:bg-stone-900 overflow-x-auto text-stone-800 dark:text-stone-200 max-h-60">
                {proposedText}
              </pre>
            </div>
          )}

          {savedNotebookMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{savedNotebookMsg}</span>
            </div>
          )}

          {/* Editor Container */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                Archivo: {activeNotebook.filename} (Última edición: {activeNotebook.lastUpdated})
              </span>
              <button
                onClick={() => {
                  updateNotebook(selectedNotebookId, notebookEditText);
                  setSavedNotebookMsg('Cuadernillo guardado.');
                  setTimeout(() => setSavedNotebookMsg(null), 3000);
                }}
                className="px-3 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg"
              >
                Guardar Cambios
              </button>
            </div>

            <textarea
              value={notebookEditText}
              onChange={(e) => setNotebookEditText(e.target.value)}
              rows={14}
              className="w-full text-xs font-mono p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                {feedbackTarget.rating === 'positive' ? '👍 Calificación Positiva' : '👎 Calificación Negativa'}
              </h4>
              <button
                onClick={() => setFeedbackTarget(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              ¿Quieres agregar un motivo o contexto para que el cuadernillo aprenda de esta interacción?
            </p>

            <textarea
              rows={3}
              placeholder="Ej. El guion funcionó genial para destrabar la llamada..."
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setFeedbackTarget(null)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFeedback}
                className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-lg"
              >
                Registrar Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
