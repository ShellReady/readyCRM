import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { PeriodType, ReportSnapshot } from '../../types';
import {
  BarChart3,
  Calendar,
  Copy,
  Check,
  FileText,
  Bookmark,
  Share2,
  ExternalLink,
  Printer,
  ChevronDown,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const ReportesScreen: React.FC = () => {
  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    activeCompany,
    calculateFunnelForPeriod,
    saveReportSnapshot,
    reportSnapshots,
    leads,
    interactions,
    meetings,
  } = useCRM();

  const [periodType, setPeriodType] = useState<PeriodType>('Semanal');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeOutputFormat, setActiveOutputFormat] = useState<'quick' | 'email' | 'formal' | 'snapshots'>('email');
  const [copiedFormat, setCopiedFormat] = useState(false);

  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);

  // Target company for report
  const reportCompanyId = selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '';
  const currentCompany = companies.find((c) => c.id === reportCompanyId) || companies[0];

  // Calculate funnel metrics
  const funnelData = calculateFunnelForPeriod(reportCompanyId, periodType, startDate, endDate);

  // Qualitative analysis from objections
  const recentObjections = interactions
    .filter((i) => i.type === 'Objeción')
    .slice(0, 3)
    .map((i) => i.note);

  // Generate plain text report
  const generateQuickText = () => {
    return `📊 REPORTE DE PROSPECCIÓN (${periodType.toUpperCase()})
🏢 Empresa: ${currentCompany?.name}
📅 Periodo: ${startDate} al ${endDate} ${funnelData.isProrated ? '(Metas prorrateadas)' : ''}

🎯 FUNNEL COMERCIAL:
• Outreach (Primer contacto): ${funnelData.outreach.actual} / ${funnelData.outreach.target} (${funnelData.outreach.percentage}%)
• Engaged (Respuestas positivas): ${funnelData.engaged.actual} / ${funnelData.engaged.target} (${funnelData.engaged.percentage}%)
• Reuniones Agendadas: ${funnelData.scheduled.actual} / ${funnelData.scheduled.target} (${funnelData.scheduled.percentage}%)
• Reuniones Realizadas: ${funnelData.completed.actual} / ${funnelData.completed.target} (${funnelData.completed.percentage}%)
• Pipeline Generado: $${funnelData.pipelineGenerated.actual.toLocaleString()} USD (${funnelData.pipelineGenerated.percentage}% de meta)

💡 INSIGHTS CUALITATIVOS & OBJECIONES:
${recentObjections.length > 0 ? recentObjections.map((o) => `• "${o}"`).join('\n') : '• Buen flujo de respuesta en canales activos.'}

🚀 PLAN DE ACCIÓN:
• Priorizar leads en Semáforo Verde listos para confirmación de agenda.
• Aplicar guiones de nutrición y videos Drive para objeciones de presupuesto.

🔗 Tracker en vivo: ${currentCompany?.notionDbUrl || 'Disponible en Notion BDR Database'}`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateQuickText());
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  const handleSaveSnapshot = () => {
    const snap = saveReportSnapshot({
      companyId: currentCompany?.id || 'all',
      periodType,
      dateRange: `${startDate} al ${endDate}`,
      funnelData,
      executiveSummary: `Reporte ${periodType} para ${currentCompany?.name}. Cumplimiento de pipeline al ${funnelData.pipelineGenerated.percentage}%.`,
      qualitativeInsights: recentObjections.join(' | ') || 'Sin objeciones críticas.',
      actionPlan: 'Continuar prospección multicanal y seguimiento de leads tibios.',
      rawOutputText: generateQuickText(),
    });
    setSnapshotMsg(`Snapshot #${snap.id} guardado con éxito.`);
    setTimeout(() => setSnapshotMsg(null), 4000);
  };

  return (
    <div id="screen-reportes" className="space-y-6 animate-fadeIn">
      {snapshotMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-scaleUp">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{snapshotMsg}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Generador de Reportes & Funnel
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Métricas ejecutivas, metas prorrateadas por días hábiles y formatos exportables
          </p>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveOutputFormat('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeOutputFormat === 'email'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            ✉️ Email Ejecutivo
          </button>
          <button
            onClick={() => setActiveOutputFormat('quick')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeOutputFormat === 'quick'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            💬 Texto Slack/WhatsApp
          </button>
          <button
            onClick={() => setActiveOutputFormat('formal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeOutputFormat === 'formal'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            📄 Formal Imprimible
          </button>
          <button
            onClick={() => setActiveOutputFormat('snapshots')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeOutputFormat === 'snapshots'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            📦 Snapshots ({reportSnapshots.length})
          </button>
        </div>
      </div>

      {/* Control Panel: Company + Period + Date Filter */}
      <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            Empresa para el Reporte
          </label>
          <select
            value={reportCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.cycleType})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            Frecuencia
          </label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
          >
            <option value="Diario">Diario</option>
            <option value="Semanal">Semanal</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Anual">Anual</option>
            <option value="Rango personalizado">Rango personalizado</option>
          </select>
        </div>

        <div className="sm:col-span-5 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Prorated Meta Notification */}
      {funnelData.isProrated && (
        <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 text-xs flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0 text-blue-600" />
          <span>
            <strong>Meta prorrateada automáticamente:</strong> Las metas se calcularon en base a los días hábiles del periodo seleccionado en proporción a los 22 días del mes estándar.
          </span>
        </div>
      )}

      {/* Output Content */}
      {activeOutputFormat === 'email' && (
        <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Vista Previa de Email Ejecutivo
              </span>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-1">
                Reporte de Prospección — {currentCompany?.name}
              </h2>
              <p className="text-xs text-stone-500">
                Periodo: {startDate} al {endDate} • Ciclo: {currentCompany?.cycleType}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyText}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                {copiedFormat ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat ? 'Copiado' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={handleSaveSnapshot}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Guardar Snapshot</span>
              </button>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
              1. Resumen Ejecutivo
            </h3>
            <p>
              Durante este ciclo {periodType.toLowerCase()}, se registraron{' '}
              <strong>{funnelData.outreach.actual} contactos iniciales</strong>, logrando un ratio de respuesta positiva del{' '}
              <strong>
                {funnelData.outreach.actual > 0
                  ? ((funnelData.engaged.actual / funnelData.outreach.actual) * 100).toFixed(1)
                  : 0}
                %
              </strong>
              . Se completaron exitosamente <strong>{funnelData.completed.actual} llamadas</strong>, totalizando un pipeline calificado activo de{' '}
              <strong>${funnelData.pipelineGenerated.actual.toLocaleString()} USD</strong>.
            </p>
          </div>

          {/* Section 2: Funnel Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
              2. Desglose del Funnel Comercial
            </h3>

            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Etapa del Funnel</th>
                    <th className="py-2.5 px-4">Real</th>
                    <th className="py-2.5 px-4">
                      Meta {funnelData.isProrated ? '(Prorrateada)' : ''}
                    </th>
                    <th className="py-2.5 px-4">% Cumplimiento</th>
                    <th className="py-2.5 px-4">Progreso Visual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  <tr>
                    <td className="py-3 px-4 font-semibold">Outreach (Primer contacto)</td>
                    <td className="py-3 px-4">{funnelData.outreach.actual}</td>
                    <td className="py-3 px-4 text-stone-500">{funnelData.outreach.target}</td>
                    <td className="py-3 px-4 font-bold">{funnelData.outreach.percentage}%</td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, funnelData.outreach.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold">Engaged (Respuestas Positivas)</td>
                    <td className="py-3 px-4">{funnelData.engaged.actual}</td>
                    <td className="py-3 px-4 text-stone-500">{funnelData.engaged.target}</td>
                    <td className="py-3 px-4 font-bold">{funnelData.engaged.percentage}%</td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, funnelData.engaged.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold">Reuniones Agendadas</td>
                    <td className="py-3 px-4">{funnelData.scheduled.actual}</td>
                    <td className="py-3 px-4 text-stone-500">{funnelData.scheduled.target}</td>
                    <td className="py-3 px-4 font-bold">{funnelData.scheduled.percentage}%</td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, funnelData.scheduled.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold">Reuniones Realizadas</td>
                    <td className="py-3 px-4">{funnelData.completed.actual}</td>
                    <td className="py-3 px-4 text-stone-500">{funnelData.completed.target}</td>
                    <td className="py-3 px-4 font-bold">{funnelData.completed.percentage}%</td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, funnelData.completed.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                      Pipeline Generado ($ USD)
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                      ${funnelData.pipelineGenerated.actual.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      ${funnelData.pipelineGenerated.target.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {funnelData.pipelineGenerated.percentage}%
                    </td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, funnelData.pipelineGenerated.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Qualitative Feedback & Action Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                3. Insights de Mercado & Objeciones
              </h4>
              <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-disc list-inside">
                {recentObjections.length > 0 ? (
                  recentObjections.map((obj, i) => <li key={i}>{obj}</li>)
                ) : (
                  <li>Sin fricciones detectadas en las conversaciones recientes.</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                4. Plan de Acción Inmediato
              </h4>
              <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-disc list-inside">
                <li>Seguimiento prioritario con leads calificados en BANT.</li>
                <li>Inyección de videos de caso de éxito para acelerar agendamientos.</li>
                <li>Alineación con Closers para feedback de reuniones completadas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Output Content: Quick Slack/WhatsApp */}
      {activeOutputFormat === 'quick' && (
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Formato Rápido para Slack / WhatsApp
            </span>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold"
            >
              {copiedFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat ? '¡Copiado!' : 'Copiar para Enviar'}</span>
            </button>
          </div>

          <pre className="text-xs p-4 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed border border-stone-200 dark:border-stone-800">
            {generateQuickText()}
          </pre>
        </div>
      )}

      {/* Output Content: Formal Printable */}
      {activeOutputFormat === 'formal' && (
        <div className="p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                INFORME DE RENDIMIENTO COMERCIAL BDR
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                EMPRESA: {currentCompany?.name} | {startDate} — {endDate}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <p className="leading-relaxed">
              Documento formal de prospección y generación de demanda generado por el sistema CRM BDR/PSD v2 para el cliente <strong>{currentCompany?.name}</strong>.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                <span className="text-stone-500">Contactos Realizados</span>
                <p className="text-lg font-bold mt-1">{funnelData.outreach.actual}</p>
              </div>
              <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                <span className="text-stone-500">Reuniones Agendadas</span>
                <p className="text-lg font-bold mt-1">{funnelData.scheduled.actual}</p>
              </div>
              <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                <span className="text-stone-500">Pipeline Calificado</span>
                <p className="text-lg font-bold mt-1">${funnelData.pipelineGenerated.actual.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Content: Snapshots List */}
      {activeOutputFormat === 'snapshots' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white">
            Historial de Snapshots Guardados ({reportSnapshots.length})
          </h3>
          <div className="space-y-3">
            {reportSnapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-white">
                    {snap.periodType} • {snap.dateRange}
                  </span>
                  <p className="text-stone-500 text-[11px] mt-0.5">{snap.executiveSummary}</p>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Guardado el: {snap.createdAt}
                  </span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(snap.rawOutputText);
                    alert('Texto del snapshot copiado al portapapeles');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium"
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
