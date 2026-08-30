import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Commission } from '../../types';
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
} from 'lucide-react';

export const ComisionesScreen: React.FC = () => {
  const {
    filteredCommissions,
    companies,
    addCommission,
    updateCommissionStatus,
    calculateCommissionAmount,
    leads,
  } = useCRM();

  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Commission Form State
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '');
  const [newLeadId, setNewLeadId] = useState(leads[0]?.id || '');
  const [newConcept, setNewConcept] = useState('');
  const [newValueGenerated, setNewValueGenerated] = useState('10000');
  const [newCommissionPercent, setNewCommissionPercent] = useState('10');
  const [newIsFixed, setNewIsFixed] = useState(false);

  // Financial Calculations
  const totalEarned = filteredCommissions
    .filter((c) => c.status === 'Pagada')
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  const totalApproved = filteredCommissions
    .filter((c) => c.status === 'Aprobada')
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  const totalPending = filteredCommissions
    .filter((c) => c.status === 'Pendiente')
    .reduce((sum, c) => sum + calculateCommissionAmount(c), 0);

  const totalValueGenerated = filteredCommissions.reduce(
    (sum, c) => sum + (c.valueGenerated || 0),
    0
  );

  const filteredList = filteredCommissions.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter
  );

  const handleCreateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept) return;

    addCommission({
      companyId: newCompanyId,
      leadId: newLeadId,
      concept: newConcept,
      valueGenerated: Number(newValueGenerated) || 0,
      commissionPercent: Number(newCommissionPercent) || 0,
      isFixedAmount: newIsFixed,
      status: 'Pendiente',
      date: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setNewConcept('');
  };

  return (
    <div id="screen-comisiones" className="space-y-6 animate-fadeIn">
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
            Fórmula de cálculo: <code>(Valor Generado × % Comisión)</code> o monto fijo pactado por contrato
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm hover:bg-stone-800 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Comisión</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase text-stone-500">Cobrado (Pagado)</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalEarned.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-stone-400 mt-1">Liquidado en cuenta bancaria</p>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase text-stone-500">Por Cobrar (Aprobado)</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ${totalApproved.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-stone-400 mt-1">Cierre confirmado por closer</p>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase text-stone-500">Pendiente de Validación</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${totalPending.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-stone-400 mt-1">Propuesta enviada / En negociación</p>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase text-stone-500">Valor Generado a Clientes</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
            ${totalValueGenerated.toLocaleString()} USD
          </p>
          <p className="text-[10px] text-stone-400 mt-1">Total facturado para empresas</p>
        </div>
      </div>

      {/* Commission Breakdown Table */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">
            Historial de Comisiones & Liquidaciones
          </h2>

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Concepto / Prospecto</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Valor Generado</th>
                <th className="py-3 px-4">% / Tipo</th>
                <th className="py-3 px-4">Monto Comisión</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Actualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {filteredList.map((comm) => {
                const comp = companies.find((c) => c.id === comm.companyId);
                const amount = calculateCommissionAmount(comm);

                return (
                  <tr key={comm.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {comm.concept}
                      </span>
                      <div className="text-[10px] text-stone-400">{comm.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {comp?.name}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      ${comm.valueGenerated.toLocaleString()} USD
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-500">
                      {comm.isFixedAmount ? 'Monto Fijo' : `${comm.commissionPercent}%`}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${amount.toLocaleString()} USD
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          comm.status === 'Pagada'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : comm.status === 'Aprobada'
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {comm.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={comm.status}
                        onChange={(e) =>
                          updateCommissionStatus(comm.id, e.target.value as Commission['status'])
                        }
                        className="text-[11px] p-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Pagada">Pagada</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Commission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Registrar Nueva Comisión
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Empresa Cliente</label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Concepto / Prospecto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cierre SaaS Plan Enterprise - Logística Transandina"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Valor Generado ($)</label>
                  <input
                    type="number"
                    value={newValueGenerated}
                    onChange={(e) => setNewValueGenerated(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">% Comisión o Monto</label>
                  <input
                    type="number"
                    value={newCommissionPercent}
                    onChange={(e) => setNewCommissionPercent(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsFixed}
                  onChange={(e) => setNewIsFixed(e.target.checked)}
                  className="rounded"
                />
                <span>Es un monto fijo (en vez de porcentaje)</span>
              </label>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
