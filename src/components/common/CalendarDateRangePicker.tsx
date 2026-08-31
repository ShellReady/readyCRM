import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { PeriodType } from '../../types';

interface CalendarDateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  periodType: PeriodType;
  onChange: (start: string, end: string, period?: PeriodType) => void;
}

export const CalendarDateRangePicker: React.FC<CalendarDateRangePickerProps> = ({
  startDate,
  endDate,
  periodType,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month being viewed in the visual calendar
  const initialDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Temporary selection state when clicking
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Helpers
  const formatDateToYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseYMD = (str: string): Date => {
    return new Date(str + 'T00:00:00');
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sun, 1 = Mon ... We want Monday as index 0
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Monday = 0, Sunday = 6
  };

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Day Click Logic
  const handleDayClick = (day: number) => {
    const clickedDateStr = formatDateToYMD(new Date(viewYear, viewMonth, day));

    if (selectionStep === 'start') {
      setTempStart(clickedDateStr);
      setTempEnd(clickedDateStr);
      setSelectionStep('end');
    } else {
      // Step === 'end'
      if (clickedDateStr < tempStart) {
        setTempStart(clickedDateStr);
        setTempEnd(tempStart);
      } else {
        setTempEnd(clickedDateStr);
      }
      setSelectionStep('start');
    }
  };

  // Apply Changes
  const handleApply = () => {
    const finalStart = tempStart <= tempEnd ? tempStart : tempEnd;
    const finalEnd = tempStart <= tempEnd ? tempEnd : tempStart;
    onChange(finalStart, finalEnd, 'Rango personalizado');
    setIsOpen(false);
  };

  // Presets
  const applyPreset = (presetKey: string) => {
    const today = new Date();
    let s = new Date();
    let e = new Date();
    let pType: PeriodType = 'Rango personalizado';

    if (presetKey === 'today') {
      s = today;
      e = today;
      pType = 'Diario';
    } else if (presetKey === 'last7') {
      s = new Date(today);
      s.setDate(today.getDate() - 6);
      e = today;
      pType = 'Semanal';
    } else if (presetKey === 'thisWeek') {
      // Monday of current week
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      s = new Date(today.setDate(diff));
      e = new Date(s);
      e.setDate(s.getDate() + 6);
      pType = 'Semanal';
    } else if (presetKey === 'last15') {
      s = new Date(today);
      s.setDate(today.getDate() - 14);
      e = today;
      pType = 'Quincenal';
    } else if (presetKey === 'thisMonth') {
      s = new Date(today.getFullYear(), today.getMonth(), 1);
      e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      pType = 'Mensual';
    } else if (presetKey === 'last30') {
      s = new Date(today);
      s.setDate(today.getDate() - 29);
      e = today;
      pType = 'Mensual';
    } else if (presetKey === 'thisQuarter') {
      const qMonth = Math.floor(today.getMonth() / 3) * 3;
      s = new Date(today.getFullYear(), qMonth, 1);
      e = new Date(today.getFullYear(), qMonth + 3, 0);
      pType = 'Trimestral';
    } else if (presetKey === 'last6Months' || presetKey === 'thisSemester') {
      s = new Date(today);
      s.setMonth(today.getMonth() - 6);
      s.setDate(1);
      e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      pType = 'Semestral';
    }

    const startStr = formatDateToYMD(s);
    const endStr = formatDateToYMD(e);
    setTempStart(startStr);
    setTempEnd(endStr);
    setViewYear(s.getFullYear());
    setViewMonth(s.getMonth());
    onChange(startStr, endStr, pType);
    setIsOpen(false);
  };

  // Calculate day count
  const calculateDays = () => {
    if (!tempStart || !tempEnd) return { total: 0, business: 0 };
    const s = parseYMD(tempStart);
    const e = parseYMD(tempEnd);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let businessDays = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { total: totalDays, business: businessDays };
  };

  const stats = calculateDays();

  // Render Calendar Grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="btn-open-calendar-range"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/90 text-stone-800 dark:text-stone-100 hover:border-stone-400 dark:hover:border-stone-600 transition shadow-2xs cursor-pointer"
      >
        <div className="flex items-center space-x-2 truncate">
          <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-stone-900 dark:text-white">
            {startDate} <span className="text-stone-400">→</span> {endDate}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
            {stats.total} días ({stats.business} hábiles)
          </span>
        </div>
        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium ml-2 hover:underline">
          Ver Calendario
        </span>
      </button>

      {/* Interactive Popover Modal */}
      {isOpen && (
        <div
          id="calendar-range-popover"
          className="absolute z-50 right-0 sm:left-0 top-full mt-2 w-[340px] sm:w-[500px] p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl space-y-4 animate-scaleUp text-stone-800 dark:text-stone-100"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                Seleccionar Periodo en Calendario
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
              Accesos Rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last7')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => applyPreset('thisWeek')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Esta semana
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last15')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Quincena (15d)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('thisMonth')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last30')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => applyPreset('thisQuarter')}
                className="px-2 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 font-medium cursor-pointer transition"
              >
                Este Trimestre
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last6Months')}
                className="px-2 py-1 text-[11px] rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-medium cursor-pointer transition border border-purple-200 dark:border-purple-800"
              >
                6 Meses (Semestral)
              </button>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-stone-400">
            <span>Lu</span>
            <span>Ma</span>
            <span>Mi</span>
            <span>Ju</span>
            <span>Vi</span>
            <span className="text-amber-500">Sá</span>
            <span className="text-amber-500">Do</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 sm:h-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateToYMD(new Date(viewYear, viewMonth, day));
              const isStart = dateStr === tempStart;
              const isEnd = dateStr === tempEnd;
              const isInRange = dateStr >= tempStart && dateStr <= tempEnd;
              const isToday =
                dateStr === formatDateToYMD(new Date());

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-7 sm:h-8 text-xs font-semibold rounded-lg flex items-center justify-center transition cursor-pointer relative ${
                    isStart || isEnd
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : isInRange
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  } ${isToday && !isStart && !isEnd ? 'border border-blue-400' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Direct Inputs & Summary Footer */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-0.5">
                  Fecha Inicio (Desde)
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-stone-400 mb-0.5">
                  Fecha Fin (Hasta)
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Total: <strong>{stats.total} días</strong> ({stats.business} días hábiles)
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-lg shadow-xs hover:bg-stone-800 dark:hover:bg-stone-100 transition cursor-pointer"
                >
                  Aplicar Filtro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
