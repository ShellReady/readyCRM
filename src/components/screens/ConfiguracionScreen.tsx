import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Settings,
  ShieldCheck,
  Building2,
  Database,
  FolderSync,
  Mail,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Trash2,
  RefreshCw,
  Layers,
  AlertCircle,
  Clock,
  Globe,
  Plus,
  Briefcase,
  Target,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  UploadCloud,
  DownloadCloud,
  Link,
  FileSpreadsheet,
  HardDrive,
  Info,
  HelpCircle,
  FileCode,
  FileText,
  Package,
  Download,
  Check,
} from 'lucide-react';
import { INITIAL_COMPANIES, INITIAL_LEADS } from '../../data/initialData';
import { COMMON_TIMEZONES, DAYS_OF_WEEK, getLeadLocalTimeInfo } from '../../utils/timezones';
import { DayOfWeek, WorkBlockType } from '../../types';
import {
  NOTION_DATABASE_SCHEMAS,
  generateSchemaCSV,
  generateNotionBlueprintJSON,
  generateNotionMarkdownGuide,
  downloadFile,
} from '../../utils/notionSchemaGenerator';

export const ConfiguracionScreen: React.FC = () => {
  const {
    authorizedEmail,
    setAuthorizedEmail,
    currentUserEmail,
    companies,
    updateCompany,
    leads,
    interactions,
    meetings,
    commissions,
    clearAllLeadsAndData,
    restoreDefaultSampleData,
    userTimezone,
    setUserTimezone,
    workBlocks,
    addWorkBlock,
    deleteWorkBlock,
    changePassword,
    logout,
    notionConfig,
    updateNotionConfig,
    testNotionConnection,
    syncPushToNotion,
    syncPullFromNotion,
    isSyncingNotion,
    notionSyncFeedback,
  } = useCRM();

  const [emailInput, setEmailInput] = useState(authorizedEmail);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  const [isSaved, setIsSaved] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  // Notion Integration Form State
  const [notionApiKey, setNotionApiKey] = useState(notionConfig.apiKey || '');
  const [notionProspectsDbId, setNotionProspectsDbId] = useState(notionConfig.prospectsDbId || '');
  const [notionCompaniesDbId, setNotionCompaniesDbId] = useState(notionConfig.companiesDbId || '');
  const [notionLogsDbId, setNotionLogsDbId] = useState(notionConfig.logsDbId || '');
  const [notionConfigDbId, setNotionConfigDbId] = useState(notionConfig.configDbId || '');
  const [showNotionKey, setShowNotionKey] = useState(false);
  const [isTestingNotion, setIsTestingNotion] = useState(false);
  const [notionTestResult, setNotionTestResult] = useState<{
    success: boolean;
    botName?: string;
    workspaceName?: string;
    databasesChecked?: { id: string; name: string; accessible: boolean; title?: string }[];
    missingAccessNotice?: string;
    error?: string;
  } | null>(null);
  const [notionSavedNotice, setNotionSavedNotice] = useState(false);
  const [downloadedFeedback, setDownloadedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (notionConfig.apiKey) setNotionApiKey(notionConfig.apiKey);
    if (notionConfig.prospectsDbId) setNotionProspectsDbId(notionConfig.prospectsDbId);
    if (notionConfig.companiesDbId) setNotionCompaniesDbId(notionConfig.companiesDbId);
    if (notionConfig.logsDbId) setNotionLogsDbId(notionConfig.logsDbId);
    if (notionConfig.configDbId) setNotionConfigDbId(notionConfig.configDbId);
  }, [notionConfig]);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // New WorkBlock form state
  const [newDay, setNewDay] = useState<DayOfWeek>('Lunes');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newType, setNewType] = useState<WorkBlockType>('Outreach en frío');
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '');
  const [newObjective, setNewObjective] = useState('');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Notion handlers
  const handleSaveNotionConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateNotionConfig({
      apiKey: notionApiKey.trim(),
      prospectsDbId: notionProspectsDbId.trim(),
      companiesDbId: notionCompaniesDbId.trim(),
      logsDbId: notionLogsDbId.trim(),
      configDbId: notionConfigDbId.trim(),
    });
    setNotionSavedNotice(true);
    setTimeout(() => setNotionSavedNotice(false), 3500);
  };

  const handleTestNotion = async () => {
    setIsTestingNotion(true);
    setNotionTestResult(null);
    updateNotionConfig({
      apiKey: notionApiKey.trim(),
      prospectsDbId: notionProspectsDbId.trim(),
      companiesDbId: notionCompaniesDbId.trim(),
      logsDbId: notionLogsDbId.trim(),
      configDbId: notionConfigDbId.trim(),
    });
    const res = await testNotionConnection();
    setIsTestingNotion(false);
    setNotionTestResult(res);
  };

  const handleDownloadSingleSchemaCSV = (schemaId: string) => {
    const schema = NOTION_DATABASE_SCHEMAS.find((s) => s.id === schemaId);
    if (!schema) return;
    const csvContent = generateSchemaCSV(schema);
    downloadFile(csvContent, schema.filename, 'text/csv');
    setDownloadedFeedback(`Plantilla CSV "${schema.name}" descargada.`);
    setTimeout(() => setDownloadedFeedback(null), 4000);
  };

  const handleDownloadAllSchemasCSV = () => {
    NOTION_DATABASE_SCHEMAS.forEach((schema, idx) => {
      setTimeout(() => {
        const csvContent = generateSchemaCSV(schema);
        downloadFile(csvContent, schema.filename, 'text/csv');
      }, idx * 250);
    });
    setDownloadedFeedback('¡Descargadas las 4 plantillas CSV de esquemas para Notion!');
    setTimeout(() => setDownloadedFeedback(null), 5000);
  };

  const handleDownloadBlueprintJSON = () => {
    const jsonContent = generateNotionBlueprintJSON();
    downloadFile(jsonContent, 'notion_crm_blueprint_schema.json', 'application/json');
    setDownloadedFeedback('Notion Blueprint JSON descargado exitosamente.');
    setTimeout(() => setDownloadedFeedback(null), 4000);
  };

  const handleDownloadMarkdownGuide = () => {
    const mdContent = generateNotionMarkdownGuide();
    downloadFile(mdContent, 'GUIA_NOTION_TEMPLATE_KIT.md', 'text/markdown');
    setDownloadedFeedback('Guía Markdown de instalación en Notion descargada.');
    setTimeout(() => setDownloadedFeedback(null), 4000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setAuthorizedEmail(emailInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('Debes ingresar tu clave actual.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('La nueva clave debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('La nueva clave y su confirmación no coinciden.');
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);

    if (result.success) {
      setPassSuccess(result.message || 'Clave actualizada con éxito en el vault seguro.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 6000);
    } else {
      setPassError(result.error || 'Error al actualizar la clave. Verifica la clave actual.');
    }
  };

  const handleClearData = () => {
    if (window.confirm('¿Confirmas limpiar todos los prospectos, interacciones y métricas para el lanzamiento oficial?')) {
      clearAllLeadsAndData();
      setDataMessage('Base de datos inicializada en blanco (0 registros). Sistema listo para lanzamiento oficial.');
      setTimeout(() => setDataMessage(null), 5000);
    }
  };

  const handleRestoreSample = () => {
    if (window.confirm('¿Deseas restaurar los 9 prospectos de ejemplo y datos de prueba completos?')) {
      restoreDefaultSampleData();
      setDataMessage('9 prospectos de ejemplo y flujo de demostración restaurados con éxito.');
      setTimeout(() => setDataMessage(null), 5000);
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkBlock({
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      type: newType,
      companyId: newCompanyId,
      objective: newObjective || `Sesión de ${newType}`,
    });
    setNewObjective('');
  };

  const handleToggleReportArea = (area: string) => {
    if (!selectedCompany) return;
    const currentAreas = selectedCompany.activeReportAreas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area];

    updateCompany(selectedCompany.id, { activeReportAreas: newAreas });
  };

  const allPossibleReportAreas = [
    'Actividad',
    'Engagement',
    'Conversión/Pipeline',
    'Calidad de leads',
    'Velocidad/SLA',
    'Financiero',
  ];

  const userTzInfo = getLeadLocalTimeInfo(userTimezone);

  return (
    <div id="screen-configuracion" className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-stone-500/10 text-stone-700 dark:text-stone-300">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Configuración & Conexiones del Sistema
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Seguridad de acceso, correo autorizado, zona horaria del Setter, bloques de tiempo y parámetros por empresa
        </p>
      </div>

      {/* 1. Seguridad & Correo Autorizado */}
      <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-sm text-stone-900 dark:text-white">
            1. Seguridad de Acceso & Correo Maestro Autorizado
          </h2>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          El sistema valida la variable de entorno <code>AUTHORIZED_EMAIL</code>. Únicamente el operador maestro tiene permisos para ver finanzas privadas y modificar cuadernillos de IA.
        </p>

        <form onSubmit={handleSaveSecurity} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Correo Electrónico Autorizado (Operador PSD)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-xl shadow-sm"
              >
                {isSaved ? '¡Guardado!' : 'Actualizar'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Sesión activa validada como:{' '}
                <strong>{currentUserEmail}</strong> (Rol: Master BDR/Setter)
              </span>
            </div>
            <button
              type="button"
              id="btn-config-logout"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-semibold self-start sm:self-auto transition"
            >
              Bloquear / Cerrar Sesión
            </button>
          </div>
        </form>

        {/* Subsección: Cambiar Clave de Acceso */}
        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
              Gestión de Clave Maestra (Cambiar Clave)
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Actualiza tu clave de acceso. El backend valida la clave actual contra el hash seguro en el vault/Notion y genera un nuevo hash criptográfico (PBKDF2 con Salt único).
          </p>

          {passError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                Clave Actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                Nueva Clave
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                Confirmar Nueva Clave
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva clave"
                  className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                id="btn-submit-change-password"
                disabled={isChangingPass || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                {isChangingPass ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Actualizando en Vault...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Guardar Nueva Clave</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Zona Horaria del Setter & Rutina por Bloques */}
      <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-sm text-stone-900 dark:text-white">
              2. Zona Horaria del Setter & Bloques de Trabajo
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
            🕒 Hora Actual: {userTzInfo.formattedTime}
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300">
          Configura tu huso horario de base para que el Cockpit calcule automáticamente qué bloque de prospección está activo y sincronice las horas de contacto con los prospectos.
        </p>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Tu Zona Horaria de Operación
            </label>
            <select
              value={userTimezone}
              onChange={(e) => setUserTimezone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} — {tz.region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Work Blocks list */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Bloques de Prospección Programados ({workBlocks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {workBlocks.map((b) => {
              const comp = companies.find((c) => c.id === b.companyId);
              return (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {b.day}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-900 dark:text-white">
                        {b.startTime} - {b.endTime}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {b.type}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {comp ? comp.name : 'Todas las empresas'} • {b.objective}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteWorkBlock(b.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition"
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Add Block Inline Form */}
          <form
            onSubmit={handleAddBlock}
            className="p-3.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-800/20 space-y-3"
          >
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
              + Agregar Nuevo Bloque de Horario
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Día</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Tipo</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as WorkBlockType)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="Outreach en frío">Outreach en frío</option>
                  <option value="Seguimiento y reactivación">Seguimiento y reactivación</option>
                  <option value="Agendamiento y confirmación">Agendamiento y confirmación</option>
                  <option value="Acompañamiento a cierres">Acompañamiento a cierres</option>
                  <option value="Formación y roleplay">Formación y roleplay</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Inicio</label>
                <input
                  type="time"
                  required
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Fin</label>
                <input
                  type="time"
                  required
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Empresa Asignada
                </label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Objetivo / Meta del Bloque
                </label>
                <input
                  type="text"
                  placeholder="Ej. Enviar 25 mensajes a CEOs"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg shadow-2xs"
            >
              Guardar Bloque
            </button>
          </form>
        </div>
      </div>

      {/* 3. Conexión & Sincronización Multi-Base con Notion */}
      <div id="section-notion-center" className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-white">
                3. Conexión y Sincronización Multi-Base con Notion
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Centraliza y respalda prospectos, empresas, registros rápidos y métricas entre cualquier dispositivo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center space-x-1.5 ${
                notionConfig.apiKey && notionConfig.configDbId
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${notionConfig.apiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{notionConfig.apiKey ? 'Notion Configurado' : 'Pendiente de Configuración'}</span>
            </span>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {notionSyncFeedback && (
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 flex items-center justify-between gap-3 text-xs text-purple-900 dark:text-purple-200 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 text-purple-600 ${isSyncingNotion ? 'animate-spin' : ''}`} />
              <span className="font-medium">{notionSyncFeedback}</span>
            </div>
            {notionConfig.lastSyncedAt && (
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                {new Date(notionConfig.lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Sync Action Buttons Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            id="btn-notion-push-all"
            disabled={isSyncingNotion || !notionConfig.apiKey}
            onClick={() => syncPushToNotion()}
            className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-200 font-bold text-xs transition flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className={`w-4 h-4 text-purple-600 ${isSyncingNotion ? 'animate-bounce' : ''}`} />
            <span>Sincronizar Todo a Notion (Subir)</span>
          </button>

          <button
            type="button"
            id="btn-notion-pull-all"
            disabled={isSyncingNotion || !notionConfig.apiKey}
            onClick={() => syncPullFromNotion()}
            className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-900 dark:text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadCloud className={`w-4 h-4 text-stone-600 dark:text-stone-300 ${isSyncingNotion ? 'animate-bounce' : ''}`} />
            <span>Traer Datos de Notion (Descargar)</span>
          </button>

          <button
            type="button"
            id="btn-notion-test-conn"
            disabled={isTestingNotion || !notionApiKey}
            onClick={handleTestNotion}
            className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isTestingNotion ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Probando conexión...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>Probar Conexión Notion</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result Message */}
        {notionTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
              notionTestResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
            }`}
          >
            {notionTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5 flex-1">
              <p className="font-bold">
                {notionTestResult.success
                  ? `✅ Conexión Exitosa con Notion Workspace: "${notionTestResult.workspaceName || notionTestResult.botName}"`
                  : '❌ Error de Conexión con Notion'}
              </p>
              {notionTestResult.error && (
                <p className="text-[11px] opacity-90">{notionTestResult.error}</p>
              )}
              {notionTestResult.databasesChecked && notionTestResult.databasesChecked.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {notionTestResult.databasesChecked.map((db) => (
                    <div
                      key={db.id}
                      className={`text-[11px] px-2 py-1 rounded-lg border flex items-center justify-between ${
                        db.accessible
                          ? 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-100/70 dark:bg-rose-900/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      <span className="font-medium truncate mr-1">{db.name}</span>
                      <span className="font-bold font-mono text-[10px] shrink-0">
                        {db.accessible ? '✓ Conectada' : '✗ Sin acceso'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {notionTestResult.missingAccessNotice && (
                <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <span>💡 ¿Cómo dar acceso en 1 clic?</span>
                  </p>
                  <p className="leading-relaxed">
                    En Notion, abre tu página <strong>&quot;CRM BDR Hub&quot;</strong>, haz clic en los <strong>3 puntos (···)</strong> en la esquina superior derecha ➔ selecciona <strong>&quot;Conexiones&quot; / &quot;Conectar con...&quot;</strong> ➔ busca y elige <strong>&quot;BDR PSD&quot;</strong>. Al autorizar la página principal, las 4 bases de datos quedarán conectadas automáticamente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de Conexión de Bases de Datos */}
        <form onSubmit={handleSaveNotionConfig} className="p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center space-x-1.5">
              <Settings className="w-3.5 h-3.5 text-stone-500" />
              <span>Credenciales y Direcciones de Bases de Datos</span>
            </h3>
            {notionSavedNotice && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full animate-fadeIn">
                ¡Parámetros de Notion guardados!
              </span>
            )}
          </div>

          {/* 1. API Token */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Token de Integración de Notion (API Key / Internal Integration Secret)
            </label>
            <div className="relative">
              <input
                type={showNotionKey ? 'text' : 'password'}
                value={notionApiKey}
                onChange={(e) => setNotionApiKey(e.target.value)}
                placeholder="ntn_... o secret_..."
                className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNotionKey(!showNotionKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showNotionKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Token generado en <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-purple-600 underline">notion.so/my-integrations</a>.
            </p>
          </div>

          {/* Grid de Bases de Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* DB 1: Prospectos */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                1. Base de Datos: Prospectos & Leads (ID o URL)
              </label>
              <input
                type="text"
                value={notionProspectsDbId}
                onChange={(e) => setNotionProspectsDbId(e.target.value)}
                placeholder="3cc7b90ab60d80ad874eff490ff6b43b o URL de Notion"
                className="w-full p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-stone-400">Guarda contactos, estados, semáforos, teléfonos y scores ICP.</span>
            </div>

            {/* DB 2: Empresas Clientes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                2. Base de Datos: Empresas Clientes (ID o URL)
              </label>
              <input
                type="text"
                value={notionCompaniesDbId}
                onChange={(e) => setNotionCompaniesDbId(e.target.value)}
                placeholder="ID o enlace de la base de datos de empresas"
                className="w-full p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-stone-400">Guarda configuración B2B, tipos de ciclo y perfiles ICP.</span>
            </div>

            {/* DB 3: Registros Rápidos & Actividad */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                3. Base de Datos: Registros Rápidos & Logs (ID o URL)
              </label>
              <input
                type="text"
                value={notionLogsDbId}
                onChange={(e) => setNotionLogsDbId(e.target.value)}
                placeholder="ID o enlace de la base de datos de actividad"
                className="w-full p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-stone-400">Guarda llamadas, mensajes enviados, objeciones y notas.</span>
            </div>

            {/* DB 4: Metas & Snapshot Central */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                4. Base de Datos: Metas, Métricas & Snapshot (ID o URL)
              </label>
              <input
                type="text"
                value={notionConfigDbId}
                onChange={(e) => setNotionConfigDbId(e.target.value)}
                placeholder="3cc7b90ab60d80ad874eff490ff6b43b"
                className="w-full p-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-stone-400">Base central de respaldo integral y métricas operativas.</span>
            </div>
          </div>

          {/* Botón Guardar Formulario */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Puedes pegar el ID de 32 caracteres o la URL completa de tu base de datos Notion.</span>
            </div>
            <button
              type="submit"
              id="btn-save-notion-config"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Configuración de Notion</span>
            </button>
          </div>
        </form>

        {/* Guía rápida de conexión Notion */}
        <div className="p-3.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/40 dark:bg-stone-800/30 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
          <p className="font-bold text-stone-800 dark:text-stone-200 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-purple-600" />
            <span>¿Cómo conectar tu base de datos de Notion en 2 pasos?</span>
          </p>
          <ol className="list-decimal list-inside text-[11px] space-y-1 pl-1">
            <li>Abre tu base de datos en Notion (en navegador o app).</li>
            <li>Haz clic en los <strong>tres puntos (...)</strong> arriba a la derecha &gt; <strong>Conexiones (Connections)</strong> &gt; Selecciona tu integración.</li>
            <li>Copia el enlace de la página o su ID y pégalo en los campos anteriores. ¡Listo!</li>
          </ol>
        </div>

        {/* NOTION TEMPLATE KIT & SCHEMA SCAFFOLD DOWNLOAD CENTER */}
        <div id="section-notion-template-kit" className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                  Notion Template Kit & Plantillas de Esquema (Schema / Scaffold)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Descarga las definiciones estructurales de columnas, tipos y filas seed para importar y recrear tus bases de datos en Notion desde cero.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadAllSchemasCSV}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Kit Completo (4 CSVs)</span>
              </button>
            </div>
          </div>

          {/* Download Feedback Alert */}
          {downloadedFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-center space-x-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{downloadedFeedback}</span>
            </div>
          )}

          {/* Grid of Individual Schema Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NOTION_DATABASE_SCHEMAS.map((schema) => (
              <div
                key={schema.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-stone-900 dark:text-white flex items-center space-x-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                      <span>{schema.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {schema.columns.length} columnas
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {schema.description}
                  </p>

                  {/* Badges of main fields */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {schema.columns.slice(0, 5).map((col) => (
                      <span
                        key={col.name}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-stone-750 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-mono"
                        title={`${col.name} (${col.notionType})`}
                      >
                        {col.name}: <em>{col.notionType}</em>
                      </span>
                    ))}
                    {schema.columns.length > 5 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 font-mono">
                        +{schema.columns.length - 5} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">
                    {schema.filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleSchemaCSV(schema.id)}
                    className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold transition flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3 text-stone-500" />
                    <span>Descargar CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formats Complementarios: JSON Blueprint & Markdown Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-xs text-stone-900 dark:text-white">Notion Blueprint JSON</p>
                  <p className="text-[10px] text-stone-500">Esquema estructural tipado con metadatos para desarrolladores.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadBlueprintJSON}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-xs transition flex items-center space-x-1 shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-bold text-xs text-stone-900 dark:text-white">Guía de Importación Markdown (.md)</p>
                  <p className="text-[10px] text-stone-500">Instrucciones paso a paso con tablas de propiedades de Notion.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadMarkdownGuide}
                className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 font-semibold text-xs transition flex items-center space-x-1 shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Markdown</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Configuración por Empresa */}
      <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-sm text-stone-900 dark:text-white">
              4. Parámetros de la Empresa Cliente
            </h2>
          </div>

          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && (
          <div className="space-y-4 pt-2">
            {/* Cycle Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tipo de Ciclo de Venta
              </label>
              <select
                value={selectedCompany.cycleType}
                onChange={(e) =>
                  updateCompany(selectedCompany.id, {
                    cycleType: e.target.value as any,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
              >
                <option value="Alto ticket / ciclo largo">Alto ticket / ciclo largo</option>
                <option value="Ciclo corto / transaccional">Ciclo corto / transaccional</option>
              </select>
            </div>

            {/* Active Report Areas Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Áreas de Reporte Activas para {selectedCompany.name}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allPossibleReportAreas.map((area) => {
                  const isChecked = selectedCompany.activeReportAreas?.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleToggleReportArea(area)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white shadow-2xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span>{area}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perfil de Cliente Ideal (ICP) */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <label className="block text-xs font-bold text-stone-900 dark:text-white">
                    Perfil de Cliente Ideal (ICP) para {selectedCompany.name}
                  </label>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                  ✨ Base de Referencia para Evaluación IA
                </span>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Describe con texto libre las características de las empresas y cargos que representan el cliente perfecto para esta empresa (industria, tamaño, nivel del tomador de decisión, dolores críticos y capacidad presupuestaria). Este texto es inyectado dinámicamente como contexto cuando presionas <strong>"Evaluar ICP con IA"</strong> en el Drawer de prospectos.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  1. Industria & Tamaño
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  2. Cargo del Contacto
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  3. Señales de Dolor
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                  4. Rango de Presupuesto
                </span>
              </div>

              <textarea
                rows={7}
                value={selectedCompany.icpProfile || ''}
                onChange={(e) => updateCompany(selectedCompany.id, { icpProfile: e.target.value })}
                className="w-full text-xs p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder={`## Perfil de Cliente Ideal (ICP)\n- Industria objetivo: ...\n- Cargo / Rol tomador de decisión: ...\n- Fricción o dolor clave: ...\n- Presupuesto típico: ...`}
              />
            </div>

            {/* Notion URL input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Enlace a Notion Database del Cliente
              </label>
              <input
                type="url"
                value={selectedCompany.notionDbUrl || ''}
                onChange={(e) => updateCompany(selectedCompany.id, { notionDbUrl: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                placeholder="https://notion.so/..."
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Modo de Operación & Estado de la Base de Datos */}
      <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-sm text-stone-900 dark:text-white">
              5. Control de Base de Datos y Modo de Lanzamiento
            </h2>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              leads.length === 0
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}
          >
            {leads.length === 0 ? 'Modo Producción Limpio (0 Leads)' : `Modo Demostración (${leads.length} Leads)`}
          </span>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          Gestiona el estado de los registros locales. El sistema cuenta con <strong>9 prospectos de ejemplo</strong> para
          pruebas operativas completas, y permite limpiar todos los registros para iniciar la operación comercial real sin
          datos previos.
        </p>

        {dataMessage && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{dataMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-center">
            <span className="text-xl font-bold text-stone-900 dark:text-white">{leads.length}</span>
            <p className="text-[11px] text-stone-500 mt-0.5">Prospectos</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-center">
            <span className="text-xl font-bold text-stone-900 dark:text-white">{interactions.length}</span>
            <p className="text-[11px] text-stone-500 mt-0.5">Interacciones</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-center">
            <span className="text-xl font-bold text-stone-900 dark:text-white">{meetings.length}</span>
            <p className="text-[11px] text-stone-500 mt-0.5">Reuniones</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-center">
            <span className="text-xl font-bold text-stone-900 dark:text-white">{commissions.length}</span>
            <p className="text-[11px] text-stone-500 mt-0.5">Comisiones</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClearData}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar Sistema para Lanzamiento (0 registros)</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreSample}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-xs font-semibold transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Cargar 9 Prospectos de Ejemplo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
