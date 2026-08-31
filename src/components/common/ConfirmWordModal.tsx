import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Check } from 'lucide-react';

export interface ConfirmWordModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: string;
  requiredWord?: string; // Default: 'confirmar'
  confirmButtonText?: string;
  confirmButtonVariant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmWordModal: React.FC<ConfirmWordModalProps> = ({
  isOpen,
  title,
  description,
  details,
  requiredWord = 'confirmar',
  confirmButtonText = 'Confirmar Acción',
  confirmButtonVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const [typedValue, setTypedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = typedValue.trim().toLowerCase() === requiredWord.trim().toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
      // Autofocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header bar */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-rose-50/60 dark:bg-rose-950/40 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="font-bold text-stone-900 dark:text-white text-base">
                {title}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                Acción de alta sensibilidad requerida
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {description}
          </p>

          {details && (
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 font-mono">
              {details}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
              Para continuar, escribe la palabra <span className="font-mono font-bold text-rose-600 dark:text-rose-400 select-all">"{requiredWord}"</span>:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Escribe ${requiredWord} aquí...`}
              autoComplete="off"
              spellCheck={false}
              className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder:text-stone-400"
            />
            {!isValid && typedValue.length > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                La palabra ingresada no coincide con "{requiredWord}".
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isValid}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition ${
                isValid
                  ? confirmButtonVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                    : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                  : 'bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
