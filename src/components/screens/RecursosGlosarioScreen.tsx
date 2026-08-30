import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Resource, GlossaryItem, SMARTGoal } from '../../types';
import {
  BookOpen,
  FolderKanban,
  CheckSquare,
  Search,
  Plus,
  ExternalLink,
  Video,
  FileText,
  Bookmark,
  Target,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

export const RecursosGlosarioScreen: React.FC = () => {
  const {
    filteredResources,
    addResource,
    incrementResourceUsage,
    filteredGlossaryItems,
    addGlossaryItem,
    filteredSmartGoals,
    toggleSMARTAction,
    addSMARTGoal,
    companies,
    selectedCompanyId,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'recursos' | 'glosario' | 'smart'>('recursos');

  // Search terms
  const [resourceSearch, setResourceSearch] = useState('');
  const [glossarySearch, setGlossarySearch] = useState('');

  // Modals
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);

  // New Resource Form
  const [newResName, setNewResName] = useState('');
  const [newResType, setNewResType] = useState<Resource['type']>('Video Drive');
  const [newResLink, setNewResLink] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResCompanyId, setNewResCompanyId] = useState(
    selectedCompanyId !== 'all' ? selectedCompanyId : ''
  );

  // New Glossary Form
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newTip, setNewTip] = useState('');

  // New SMART Goal Form
  const [newSmartTitle, setNewSmartTitle] = useState('');
  const [newSmartDeadline, setNewSmartDeadline] = useState('2026-12-31');
  const [newSmartActions, setNewSmartActions] = useState('Prospectar 25 leads diarios\nEnviar video de caso de éxito en objeción');

  // Filtered resources
  const searchFilteredResources = filteredResources.filter(
    (r) =>
      r.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(resourceSearch.toLowerCase()))
  );

  // Filtered glossary
  const searchFilteredGlossary = filteredGlossaryItems.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName) return;

    addResource({
      companyId: newResCompanyId || undefined,
      name: newResName,
      type: newResType,
      link: newResLink || 'https://drive.google.com',
      description: newResDesc,
      tags: ['BDR', 'Drive', newResType],
      recommendedSemaforos: ['Amarillo', 'Verde'],
    });

    setShowResourceModal(false);
    setNewResName('');
    setNewResLink('');
    setNewResDesc('');
  };

  const handleAddGlossary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm || !newDef) return;

    addGlossaryItem({
      term: newTerm,
      definition: newDef,
      example: newExample,
      proTip: newTip,
    });

    setShowGlossaryModal(false);
    setNewTerm('');
    setNewDef('');
    setNewExample('');
    setNewTip('');
  };

  const handleAddSmart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmartTitle) return;

    const actionList = newSmartActions
      .split('\n')
      .filter((a) => a.trim().length > 0)
      .map((a, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        title: a.trim(),
        completed: false,
      }));

    addSMARTGoal({
      companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '',
      title: newSmartTitle,
      specific: newSmartTitle,
      measurable: '100% de acciones completadas',
      achievable: 'Asignación diaria sostenida',
      relevant: 'Impacto directo en pipeline',
      timeBound: newSmartDeadline,
      actions: actionList,
    });

    setShowSmartModal(false);
    setNewSmartTitle('');
  };

  return (
    <div id="screen-recursos-glosario" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Playbook, Glosario & Recursos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Biblioteca de videos Drive, glosario de terminología BDR y seguimiento de metas SMART
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveTab('recursos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'recursos'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            📁 Recursos Drive ({filteredResources.length})
          </button>
          <button
            onClick={() => setActiveTab('glosario')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'glosario'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            📖 Glosario BDR ({filteredGlossaryItems.length})
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'smart'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            🎯 Metas SMART ({filteredSmartGoals.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Recursos Drive */}
      {activeTab === 'recursos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar recursos, etiquetas o tipo..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              />
            </div>

            <button
              onClick={() => setShowResourceModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Recurso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchFilteredResources.map((res) => {
              const comp = companies.find((c) => c.id === res.companyId);
              return (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {res.type}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                        {res.timesRecommended}x recomendado
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-stone-900 dark:text-white">{res.name}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      {res.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {res.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        incrementResourceUsage(res.id);
                      }}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      + Registrar Uso (+1)
                    </button>

                    <a
                      href={res.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition"
                      title="Abrir en Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Glosario BDR */}
      {activeTab === 'glosario' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar término (ej. BANT, ICP, SLA)..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              />
            </div>

            <button
              onClick={() => setShowGlossaryModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Término</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchFilteredGlossary.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">{item.term}</h3>
                  <Bookmark className="w-4 h-4 text-stone-400" />
                </div>

                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {item.definition}
                </p>

                {item.example && (
                  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-xs space-y-1">
                    <span className="font-semibold text-[11px] text-stone-500 uppercase tracking-wider block">
                      Ejemplo Práctico:
                    </span>
                    <p className="text-stone-700 dark:text-stone-300 italic">{item.example}</p>
                  </div>
                )}

                {item.proTip && (
                  <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                    <span className="font-bold text-[10px] uppercase tracking-wider block">
                      💡 Pro Tip de Ejecución:
                    </span>
                    <p>{item.proTip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Metas SMART */}
      {activeTab === 'smart' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-white">
                Metas SMART & Asignaciones Operativas
              </h2>
              <p className="text-xs text-stone-500">
                Progreso calculado dinámicamente según el cumplimiento de acciones
              </p>
            </div>

            <button
              onClick={() => setShowSmartModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Meta SMART</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredSmartGoals.map((goal) => {
              const completedCount = goal.actions.filter((a) => a.completed).length;
              const totalCount = goal.actions.length;
              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                          {goal.title}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">Plazo: {goal.timeBound}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {completedCount}/{totalCount} acciones ({progress}%)
                      </span>
                      <div className="w-28 bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Checklist */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    {goal.actions.map((act) => (
                      <label
                        key={act.id}
                        className={`flex items-center space-x-3 p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                          act.completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-stone-500 line-through'
                            : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-700/60 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={act.completed}
                          onChange={() => toggleSMARTAction(goal.id, act.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="flex-1 font-medium">{act.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Nuevo Recurso Drive</h3>
              <button onClick={() => setShowResourceModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nombre del Recurso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Demo Producto B2B (3 min)"
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as Resource['type'])}
                  className="w-full p-2 rounded-lg border"
                >
                  <option value="Video Drive">Video Drive</option>
                  <option value="Documento">Documento PDF</option>
                  <option value="Plantilla">Plantilla</option>
                  <option value="Guion">Guion de Objeciones</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Enlace (Google Drive URL)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newResLink}
                  onChange={(e) => setNewResLink(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Descripción y caso de uso</label>
                <textarea
                  rows={2}
                  value={newResDesc}
                  onChange={(e) => setNewResDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glossary Modal */}
      {showGlossaryModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Nuevo Término en Glosario</h3>
              <button onClick={() => setShowGlossaryModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGlossary} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Término / Sigla</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cold Outreach"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Definición</label>
                <textarea
                  rows={2}
                  required
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ejemplo Práctico</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Pro Tip</label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGlossaryModal(false)}
                  className="px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART Goal Modal */}
      {showSmartModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Nueva Meta SMART</h3>
              <button onClick={() => setShowSmartModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSmart} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Título de la Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Agendar 15 reuniones cualificadas BANT"
                  value={newSmartTitle}
                  onChange={(e) => setNewSmartTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={newSmartDeadline}
                  onChange={(e) => setNewSmartDeadline(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Acciones Operativas (Una por línea)</label>
                <textarea
                  rows={4}
                  value={newSmartActions}
                  onChange={(e) => setNewSmartActions(e.target.value)}
                  className="w-full p-2 rounded-lg border font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSmartModal(false)}
                  className="px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-lg"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
