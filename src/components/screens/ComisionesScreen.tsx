import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Commission, CommissionEventType, CommissionIncomeType, CommissionStatus, Lead } from '../../types';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Lock,
  Building,
  Calendar,
  X,
  User,
  Search,
  Filter,
  ArrowUpRight,
  Briefcase,
  Check,
  UserPlus,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Gauge,
  HelpCircle,
} from 'lucide-react';

interface ComisionesScreenProps {
  onSelectLead?: (lead: Lead) => void;
}

export const ComisionesScreen: React.FC<ComisionesScreenProps> = ({ onSelectLead }) => {
  const {
    filteredCommissions,
    companies,
    selectedCompanyId,
    addCommission,
    updateCommission,
    updateCommissionStatus,
    calculateCommissionAmount,
    leads,
    addLead,
    workBlocks,
  } = useCRM();

  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Commission Form State
  const [newCompanyId, setNewCompanyId] = useState(
    selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || ''
  );
  const [newLeadId, setNewLeadId] = useState<string>('');
  const [newCustomLeadName, setNewCustomLeadName] = useState('');
  const [newEventType, setNewEventType] = useState<CommissionEventType>('Agendado');
  const [newIncomeType, setNewIncomeType] = useState<CommissionIncomeType>('Bono fijo');
  const [newConcept, setNewConcept] = useState('');
  const [newValueGenerated, setNewValueGenerated] = useState('15000');
  const [newCommissionPercent, setNewCommissionPercent] = useState('100'); // default $100 fixed for agendamiento
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  // Auto-complete default income type when event type changes
  const handleEventTypeChange = (type: CommissionEventType) => {
    setNewEventType(type);
    if (type === 'Agendado' || type === 'Agendamiento') {
      setNewIncomeType('Bono fijo');
      if (newCommissionPercent === '10' || !newCommissionPercent) {
        setNewCommissionPercent('100');
      }
    } else {
      setNewIncomeType('Comisión %');
      if (newCommissionPercent === '100' || !newCommissionPercent) {
        setNewCommissionPercent('10');
      }
    }
  };

  // -------------------------------------------------------------
  // FINANCIAL METRICS & BREAKDOWN BY EVENT TYPE (AGENDADOS VS CERRADOS)
  // -------------------------------------------------------------
  const isAgendadoEvent = (eType: string) => eType === 'Agendado' || eType === 'Agendamiento';
  const isCerradoEvent = (eType: string) => eType === 'Cerrado' || eType === 'Venta cerrada';

  // 1. Cobrado (Pagado)
  const paidCommissions = filteredCommissions.filter((c) => c.status === 'Pagada');
  const totalEarned = paidCommissions.reduce(
    (sum, c) => sum + calculateCommissionAmount(c),
    0
  );
  const earnedAgendamientos = paidCommissions
    .filter((c) => isAgendadoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);
  const earnedVentas = paidCommissions
    .filter((c) => isCerradoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  // 2. Por Cobrar (Aprobado)
  const approvedCommissions = filteredCommissions.filter((c) => c.status === 'Aprobada');
  const totalApproved = approvedCommissions.reduce(
    (sum, c) => sum + calculateCommissionAmount(c),
    0
  );
  const approvedAgendamientos = approvedCommissions
    .filter((c) => isAgendadoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);
  const approvedVentas = approvedCommissions
    .filter((c) => isCerradoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  // 3. Pendiente de Validación
  const pendingCommissions = filteredCommissions.filter((c) => c.status === 'Pendiente');
  const totalPending = pendingCommissions.reduce(
    (sum, c) => sum + calculateCommissionAmount(c),
    0
  );
  const pendingAgendamientos = pendingCommissions
    .filter((c) => isAgendadoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);
  const pendingVentas = pendingCommissions
    .filter((c) => isCerradoEvent(c.eventType))
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  // 4. Valor Total Generado
  const totalValueGenerated = filteredCommissions.reduce(
    (sum, c) => sum + (c.valueGenerated || 0),
    0
  );
  const valueAgendamientos = filteredCommissions
    .filter((c) => isAgendadoEvent(c.eventType))
    .reduce((sum, c) => sum + (c.valueGenerated || 0), 0);
  const valueVentas = filteredCommissions
    .filter((c) => isCerradoEvent(c.eventType))
    .reduce((sum, c) => sum + (c.valueGenerated || 0), 0);

  // -------------------------------------------------------------
  // 5. MÉTRICA DE RENTABILIDAD POR HORA (HORAS INVERTIDAS)
  // -------------------------------------------------------------
  // Calcular horas semanales y mensuales invertidas según los bloques de trabajo asociados
  const relevantBlocks = (workBlocks || []).filter((wb) => {
    if (wb.type === 'Descanso/Personal') return false;
    if (selectedCompanyId !== 'all') {
      return wb.companyId === selectedCompanyId;
    }
    return true;
  });

  const totalWeeklyMinutes = relevantBlocks.reduce((acc, wb) => {
    if (!wb.startTime || !wb.endTime) return acc;
    const [sh, sm] = wb.startTime.split(':').map(Number);
    const [eh, em] = wb.endTime.split(':').map(Number);
    const mins = eh * 60 + (em || 0) - (sh * 60 + (sm || 0));
    return acc + (mins > 0 ? mins : 0);
  }, 0);

  const weeklyHours = totalWeeklyMinutes / 60 || 1; // avoid division by 0
  const monthlyHours = weeklyHours * 4.28; // standard 4.28 weeks/month

  // Total ganadas en el ciclo (Pagadas + Aprobadas)
  const totalCommissionGains = totalEarned + totalApproved;
  const hourlyProfitability = monthlyHours > 0 ? totalCommissionGains / monthlyHours : 0;

  // -------------------------------------------------------------
  // CONVERTIR PROSPECTO PERSONALIZADO A LEAD REAL DEL CRM
  // -------------------------------------------------------------
  const handleConvertToLead = (comm: Commission) => {
    const comp = companies.find((c) => c.id === comm.companyId) || companies[0];
    const candidateName = comm.leadName || comm.concept || 'Nuevo Prospecto';

    const newLead = addLead({
      name: candidateName,
      companyContact: comp?.name || 'Empresa por definir',
      position: 'Prospecto comercial',
      email: '',
      phone: '',
      companyId: comm.companyId,
      timezone: 'America/Mexico_City',
      stage: (comm.eventType === 'Agendado' || comm.eventType === 'Agendamiento') ? 'Reunión Agendada' : 'Cerrado Ganado',
      bant: {
        budget: true,
        authority: true,
        need: true,
        timeline: true,
        notes: `Convertido desde registro de comisión: ${comm.concept || ''}`,
      },
      icpScore: 82,
      icpJustification: 'Generado a través de agendamiento calificado con valor verificado.',
      temperature: 'Caliente',
      semaforo: 'Verde',
      semaforoDescription: 'Lead con reunión o comisión registrada.',
      nextAction: 'Revisar detalles en CRM y continuar ciclo comercial.',
      estimatedValue: comm.valueGenerated || 15000,
      summary: `Convertido automáticamente desde comisión registrada el ${comm.date}. Concepto: ${comm.concept || 'Sin concepto'}`,
      summaryUpdatedAt: new Date().toISOString().split('T')[0],
      followUpDate: new Date().toISOString().split('T')[0],
    });

    // Actualizar la comisión para vincularla formalmente por Relation
    updateCommission(comm.id, {
      leadId: newLead.id,
      leadName: newLead.name,
    });

    setFeedbackToast(`¡"${newLead.name}" se ha convertido en Lead del CRM y quedó vinculado!`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // -------------------------------------------------------------
  // FILTRADO DE LA TABLA
  // -------------------------------------------------------------
  const filteredList = filteredCommissions.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all') {
      if (typeFilter === 'Agendado' && !isAgendadoEvent(c.eventType)) return false;
      if (typeFilter === 'Cerrado' && !isCerradoEvent(c.eventType)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const comp = companies.find((comp) => comp.id === c.companyId);
      const lead = leads.find((l) => l.id === c.leadId);
      const prospectName = (lead?.name || c.leadName || '').toLowerCase();
      const compName = (comp?.name || '').toLowerCase();
      const conceptText = (c.concept || '').toLowerCase();
      const prodText = (c.productName || '').toLowerCase();
      const notesText = (c.notes || '').toLowerCase();

      return (
        prospectName.includes(q) ||
        compName.includes(q) ||
        conceptText.includes(q) ||
        prodText.includes(q) ||
        notesText.includes(q)
      );
    }

    return true;
  });

  // Calculate live preview of commission in modal
  const isFixed = newIncomeType === 'Bono fijo';
  const modalCalculatedCommission = isFixed
    ? Number(newCommissionPercent) || 0
    : ((Number(newValueGenerated) || 0) * (Number(newCommissionPercent) || 0)) / 100;

  // Handle lead selection in modal
  const handleLeadSelect = (leadId: string) => {
    setNewLeadId(leadId);
    if (leadId) {
      const selected = leads.find((l) => l.id === leadId);
      if (selected) {
        setNewCompanyId(selected.companyId);
        setNewCustomLeadName(selected.name);
        if (!newConcept) {
          setNewConcept(`Reunión con ${selected.name} (${selected.position || 'Prospecto'})`);
        }
        if (selected.estimatedValue && selected.estimatedValue > 0) {
          setNewValueGenerated(String(selected.estimatedValue));
        }
      }
    }
  };

  const handleCreateCommission = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLead = leads.find((l) => l.id === newLeadId);
    const finalLeadName = selectedLead ? selectedLead.name : newCustomLeadName.trim();
    const finalConcept =
      newConcept.trim() ||
      (isAgendadoEvent(newEventType)
        ? `Reunión agendada - ${finalLeadName || 'Prospecto'}`
        : `Venta cerrada - ${finalLeadName || 'Cliente'}`);

    addCommission({
      companyId: newCompanyId,
      leadId: newLeadId || undefined,
      leadName: finalLeadName || undefined,
      concept: finalConcept,
      eventType: newEventType,
      incomeType: newIncomeType,
      valueGenerated: Number(newValueGenerated) || 0,
      commissionPercent: Number(newCommissionPercent) || 0,
      isFixedAmount: newIncomeType === 'Bono fijo',
      status: 'Pendiente',
      date: newDate,
      notes: newNotes.trim() || undefined,
    });

    setShowAddModal(false);
    // Reset form
    setNewConcept('');
    setNewLeadId('');
    setNewCustomLeadName('');
    setNewNotes('');

    setFeedbackToast('¡Comisión registrada con éxito!');
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  return (
    <div id="screen-comisiones" className="space-y-6 animate-fadeIn">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-2xl flex items-center space-x-3 border border-stone-700 dark:border-stone-200 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold">{feedbackToast}</span>
        </div>
      )}

      {/* Header with Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Control de Finanzas & Comisiones
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Privado</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Registro detallado de agendamientos, prospectos calificados, ventas cerradas y liquidaciones por empresa
          </p>
        </div>

        <button
          id="btn-add-commission"
          onClick={() => {
            handleEventTypeChange('Agendado');
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm hover:bg-stone-800 dark:hover:bg-stone-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Comisión</span>
        </button>
      </div>

      {/* KPI Cards Row (5 Cards including Rentabilidad por Hora & Desgloses) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Cobrado */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400">
                Cobrado (Pagado)
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              ${totalEarned.toLocaleString()} USD
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-[10px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-between">
              <span>📅 Agendados: ${earnedAgendamientos.toLocaleString()}</span>
              <span>·</span>
              <span>🤝 Cerrados: ${earnedVentas.toLocaleString()}</span>
            </p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              Liquidado en cuenta bancaria
            </p>
          </div>
        </div>

        {/* Card 2: Por Cobrar */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400">
                Por Cobrar (Aprobado)
              </p>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
              ${totalApproved.toLocaleString()} USD
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-[10px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-between">
              <span>📅 Agendados: ${approvedAgendamientos.toLocaleString()}</span>
              <span>·</span>
              <span>🤝 Cerrados: ${approvedVentas.toLocaleString()}</span>
            </p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              Cierre o reunión confirmada
            </p>
          </div>
        </div>

        {/* Card 3: Pendiente de Validación */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400">
                Pendiente Validación
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              ${totalPending.toLocaleString()} USD
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-[10px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-between">
              <span>📅 Agendados: ${pendingAgendamientos.toLocaleString()}</span>
              <span>·</span>
              <span>🤝 Cerrados: ${pendingVentas.toLocaleString()}</span>
            </p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              En revisión con el cliente
            </p>
          </div>
        </div>

        {/* Card 4: Valor Total Generado */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-stone-500 dark:text-stone-400">
                Valor Total Generado
              </p>
              <DollarSign className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1 font-mono">
              ${totalValueGenerated.toLocaleString()} USD
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-[10px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-between">
              <span>📅 Agendados: ${valueAgendamientos.toLocaleString()}</span>
              <span>·</span>
              <span>🤝 Cerrados: ${valueVentas.toLocaleString()}</span>
            </p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              Volumen bruto facturado
            </p>
          </div>
        </div>

        {/* Card 5: Métrica de Rentabilidad por Hora */}
        <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-stone-900 shadow-2xs col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase text-purple-700 dark:text-purple-300 flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-purple-600" />
                <span>Rentabilidad / Hora</span>
              </p>
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                Auto
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1 font-mono">
              ${hourlyProfitability.toFixed(1)} <span className="text-xs font-normal text-purple-600/80">USD/h</span>
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
            <p className="text-[10px] font-medium text-purple-900 dark:text-purple-200 flex items-center justify-between">
              <span>{weeklyHours.toFixed(1)}h/sem</span>
              <span>·</span>
              <span>{Math.round(monthlyHours)}h/mes</span>
            </p>
            <p className="text-[9px] text-purple-600/80 dark:text-purple-400 mt-0.5">
              Comisión ÷ Horas en horario
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por prospecto, empresa o deal..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          >
            <option value="all">Todos los eventos</option>
            <option value="Agendado">📅 Agendados</option>
            <option value="Cerrado">🤝 Cerrados</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
          >
            <option value="all">Todos los estados ({filteredCommissions.length})</option>
            <option value="Pagada">Pagada</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Commission Breakdown Table */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-stone-900 dark:text-white">
              Historial de Comisiones & Prospectos Agendados
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Mostrando {filteredList.length} de {filteredCommissions.length} comisiones registradas
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Prospecto Agendado / Cliente</th>
                <th className="py-3 px-4">Empresa Cliente</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Valor Generado</th>
                <th className="py-3 px-4">% o Bono</th>
                <th className="py-3 px-4">Comisión Neta</th>
                <th className="py-3 px-4 text-center">Estado de Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No se encontraron registros de comisiones con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredList.map((comm) => {
                  const comp = companies.find((c) => c.id === comm.companyId);
                  const lead = leads.find((l) => l.id === comm.leadId);
                  const isLinkedLead = Boolean(lead);
                  const amount = calculateCommissionAmount(comm);

                  // Extract verified name
                  const displayName = lead
                    ? lead.name
                    : comm.leadName || comm.concept || 'Prospecto sin nombre';
                  const displayPosition = lead?.position || '';
                  const displayCompanyContact = lead?.companyContact || '';

                  return (
                    <tr
                      key={comm.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition group"
                    >
                      {/* Prospecto Agendado / Cliente */}
                      <td className="py-3 px-4">
                        <div className="flex items-start space-x-2.5">
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 ${
                              isLinkedLead
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                : 'bg-stone-100 dark:bg-stone-800 border-dashed border-stone-300 dark:border-stone-700 text-stone-500'
                            }`}
                          >
                            {displayName
                              .split(' ')
                              .map((n) => n[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* If Linked to Lead CRM: Clickable navigation */}
                            {isLinkedLead && lead ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => onSelectLead && onSelectLead(lead)}
                                  className="text-left font-semibold text-stone-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1.5 group-hover:underline cursor-pointer"
                                  title="Ver detalle completo del Lead en el CRM"
                                >
                                  <span className="truncate">{displayName}</span>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center space-x-0.5 flex-shrink-0">
                                    <span>Lead CRM</span>
                                    <ExternalLink className="w-2 h-2 inline ml-0.5" />
                                  </span>
                                </button>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                  {displayPosition && <span>{displayPosition}</span>}
                                  {displayPosition && displayCompanyContact && <span> · </span>}
                                  {displayCompanyContact && <span>{displayCompanyContact}</span>}
                                </div>
                              </div>
                            ) : (
                              /* If Custom Prospect Name (Not yet in CRM): Distinct styling + Convert to Lead action */
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-semibold italic text-stone-800 dark:text-stone-200">
                                    {displayName}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 italic">
                                    Personalizado
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleConvertToLead(comm)}
                                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold transition cursor-pointer"
                                    title="Crear ficha en base de Leads y vincular automáticamente"
                                  >
                                    <UserPlus className="w-2.5 h-2.5" />
                                    <span>Convertir a Lead</span>
                                  </button>
                                </div>
                                <div className="text-[10px] text-stone-400 italic mt-0.5">
                                  {comm.concept || 'Prospecto directo sin vincular'}
                                </div>
                              </div>
                            )}

                            {/* Date and Notes */}
                            <div className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center space-x-1.5 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-2.5 h-2.5 inline" />
                                <span>{comm.date}</span>
                              </span>
                              {comm.notes && (
                                <span className="truncate max-w-[200px] text-stone-400">
                                  · "{comm.notes}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Empresa Cliente */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                          <Building className="w-3 h-3 mr-1 text-stone-500" />
                          {comp?.name || 'Empresa'}
                        </span>
                      </td>

                      {/* Tipo de Evento */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isAgendadoEvent(comm.eventType)
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                          }`}
                        >
                          {isAgendadoEvent(comm.eventType) ? '📅 Agendado' : '🤝 Cerrado'}
                        </span>
                      </td>

                      {/* Valor Generado */}
                      <td className="py-3 px-4 font-mono font-semibold text-stone-900 dark:text-stone-100">
                        ${comm.valueGenerated.toLocaleString()} USD
                      </td>

                      {/* % o Bono Fijo */}
                      <td className="py-3 px-4 font-mono text-stone-500">
                        {comm.incomeType === 'Bono fijo' || comm.isFixedAmount ? (
                          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                            Bono ${comm.commissionPercent} USD
                          </span>
                        ) : (
                          <span>{comm.commissionPercent}%</span>
                        )}
                      </td>

                      {/* Monto Comisión Ganada */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${amount.toLocaleString()} USD
                      </td>

                      {/* Estado de Liquidación Interactivo (Fusión de Estado + Actualizar) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <select
                            value={comm.status}
                            onChange={(e) =>
                              updateCommissionStatus(comm.id, e.target.value as CommissionStatus)
                            }
                            className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-none transition ${
                              comm.status === 'Pagada'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100'
                                : comm.status === 'Aprobada'
                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-blue-100'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
                            }`}
                            title="Haz clic para actualizar el estado de liquidación"
                          >
                            <option value="Pendiente">⏳ Pendiente</option>
                            <option value="Aprobada">✓ Aprobada</option>
                            <option value="Pagada">$$ Pagada</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Commission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 animate-scaleUp shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Coins className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Registrar Comisión de Prospección
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommission} className="space-y-3.5">
              {/* Type Selector: Agendado vs Cerrado */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Tipo de Evento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEventTypeChange('Agendado')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      isAgendadoEvent(newEventType)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span>📅 Agendado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEventTypeChange('Cerrado')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer ${
                      isCerradoEvent(newEventType)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span>🤝 Cerrado</span>
                  </button>
                </div>
              </div>

              {/* Income Type Selector: Bono fijo vs Comisión % */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Tipo de Ingreso
                  </label>
                  <select
                    value={newIncomeType}
                    onChange={(e) => {
                      const val = e.target.value as CommissionIncomeType;
                      setNewIncomeType(val);
                      if (val === 'Bono fijo' && (newCommissionPercent === '10' || !newCommissionPercent)) {
                        setNewCommissionPercent('100');
                      } else if (val === 'Comisión %' && (newCommissionPercent === '100' || !newCommissionPercent)) {
                        setNewCommissionPercent('10');
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Bono fijo">💵 Bono fijo ($ USD)</option>
                    <option value="Comisión %">% Comisión porcentual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Fecha del Registro
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Prospect Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Prospecto Agendado / Lead
                </label>
                <select
                  value={newLeadId}
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="">-- Seleccionar prospecto registrado en el CRM --</option>
                  {leads.map((l) => {
                    const c = companies.find((comp) => comp.id === l.companyId);
                    return (
                      <option key={l.id} value={l.id}>
                        {l.name} · {l.position || l.companyContact} ({c?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fallback Custom Prospect Name */}
              {!newLeadId && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    O Escribe el Nombre del Prospecto / Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Rodrigo Fernández (VP Comercial)"
                    value={newCustomLeadName}
                    onChange={(e) => setNewCustomLeadName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              )}

              {/* Company Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Empresa Cliente
                </label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.cycleType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Concept */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Concepto o Detalle
                </label>
                <input
                  type="text"
                  placeholder="Ej. Reunión calificada con Director de Operaciones"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              {/* Financial Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Valor Generado ($ USD)
                  </label>
                  <input
                    type="number"
                    value={newValueGenerated}
                    onChange={(e) => setNewValueGenerated(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    {newIncomeType === 'Bono fijo' ? 'Bono Fijo ($ USD)' : '% de Comisión (%)'}
                  </label>
                  <input
                    type="number"
                    value={newCommissionPercent}
                    onChange={(e) => setNewCommissionPercent(e.target.value)}
                    placeholder={newIncomeType === 'Bono fijo' ? '100' : '10'}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  Comisión Calculada a Ganar:
                </span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                  ${modalCalculatedCommission.toLocaleString()} USD
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-xl shadow-sm hover:bg-stone-800 dark:hover:bg-stone-100 transition cursor-pointer"
                >
                  Guardar Comisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
