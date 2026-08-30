import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { InteractionChannel, InteractionType, Meeting } from '../../types';
import { getLeadLocalTimeInfo } from '../../utils/timezones';
import { X, MessageSquare, Calendar, CheckCircle2, Clock, Globe } from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose }) => {
  const { filteredLeads, addInteraction, addMeeting, updateLead } = useCRM();

  const [mode, setMode] = useState<'interaction' | 'meeting'>('interaction');
  const [selectedLeadId, setSelectedLeadId] = useState(filteredLeads[0]?.id || '');

  // Interaction fields
  const [channel, setChannel] = useState<InteractionChannel>('LinkedIn');
  const [type, setType] = useState<InteractionType>('Primer contacto');
  const [minutesSpent, setMinutesSpent] = useState('15');
  const [note, setNote] = useState('');

  // Meeting fields
  const [closerName, setCloserName] = useState('Mariana Gómez');
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState('11:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/psd-demo');
  const [qualificationNotes, setQualificationNotes] = useState('');

  if (!isOpen) return null;

  const targetLead = filteredLeads.find((l) => l.id === selectedLeadId);
  const targetTzInfo = targetLead ? getLeadLocalTimeInfo(targetLead.timezone || 'America/Bogota') : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    if (mode === 'interaction') {
      addInteraction({
        leadId: selectedLeadId,
        date: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
        channel,
        type,
        minutesSpent: Number(minutesSpent) || 15,
        note: note || `Contacto registrado por ${channel}.`,
      });

      if (targetLead) {
        updateLead(targetLead.id, {
          stage: type === 'Respuesta positiva' ? 'En Conversación' : targetLead.stage,
          summary: `${targetLead.summary}\n• [${channel} - ${type}]: ${note || 'Contacto registrado'}`,
        });
      }
    } else {
      addMeeting({
        leadId: selectedLeadId,
        closerName,
        dateTime: `${meetingDate} ${meetingTime}`,
        status: 'Confirmada',
        link: meetingLink,
        qualificationNotes: qualificationNotes || 'Cualificación BANT realizada con éxito.',
      });

      if (targetLead) {
        updateLead(targetLead.id, {
          stage: 'Reunión Agendada',
          semaforo: 'Verde',
          nextAction: `Reunión agendada para el ${meetingDate} a las ${meetingTime} con ${closerName}`,
        });
      }
    }

    onClose();
    setNote('');
    setQualificationNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 animate-scaleUp shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Registro Rápido de Actividad
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Interacción vs Agendamiento */}
        <div className="flex p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setMode('interaction')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'interaction'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            💬 Interacción / Mensaje
          </button>
          <button
            type="button"
            onClick={() => setMode('meeting')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'meeting'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            📅 Agendar Reunión
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {filteredLeads.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-center space-y-2">
              <p className="font-semibold">No hay prospectos creados todavía</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Debes crear al menos un prospecto antes de poder registrar interacciones o agendar reuniones.
              </p>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Seleccionar Prospecto *
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
                required
              >
                {filteredLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.companyContact} ({l.stage})
                  </option>
                ))}
              </select>
              {/* Prospect Local Time indicator */}
              {targetTzInfo && (
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5 text-stone-600 dark:text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hora local prospecto:</span>
                    <strong className="font-mono">{targetTzInfo.formattedTime}</strong>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      targetTzInfo.isInBusinessHours
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {targetTzInfo.businessStatusText}
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'interaction' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Canal
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as InteractionChannel)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Email">Email</option>
                    <option value="Llamada">Llamada</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InteractionType)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Primer contacto">Primer contacto</option>
                    <option value="Respuesta positiva">Respuesta positiva</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Objeción">Objeción</option>
                    <option value="Cierre">Cierre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Tiempo Invertido (minutos en bloque de trabajo)
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={minutesSpent}
                  onChange={(e) => setMinutesSpent(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nota / Respuesta del Prospecto
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla lo conversado..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Closer Asignado
                </label>
                <input
                  type="text"
                  required
                  value={closerName}
                  onChange={(e) => setCloserName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Enlace de Reunión (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Notas de Cualificación Previa BANT
                </label>
                <textarea
                  rows={2}
                  placeholder="Validado presupuesto y dolor principal..."
                  value={qualificationNotes}
                  onChange={(e) => setQualificationNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 resize-none"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={filteredLeads.length === 0}
              className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Guardar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
