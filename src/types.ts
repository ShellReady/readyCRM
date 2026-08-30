export type CycleType = 'Alto ticket / ciclo largo' | 'Ticket medio / ciclo corto';

export type ReportArea =
  | 'Actividad'
  | 'Engagement'
  | 'Conversión/Pipeline'
  | 'Calidad de leads'
  | 'Velocidad/SLA'
  | 'Financiero';

export interface Company {
  id: string;
  name: string;
  sector: string;
  cycleType: CycleType;
  activeReportAreas: ReportArea[];
  color: string;
  logoText: string;
  notionDbUrl?: string;
  driveFolderUrl?: string;
  icpProfile?: string; // Perfil de Cliente Ideal (ICP): descripción libre de industria, tamaño, dolor, cargo y presupuesto
}

export type CRMStage =
  | 'Identificado'
  | 'Contactado'
  | 'En Conversación'
  | 'Calificado BANT'
  | 'Reunión Agendada'
  | 'Propuesta Enviada'
  | 'Cerrado Ganado'
  | 'Cerrado Perdido';

export type SemaforoColor = 'Rojo' | 'Amarillo' | 'Verde';
export type Temperature = 'Frío' | 'Tibio' | 'Caliente';
export type ICPScoreStatus = 'Sugerido por IA' | 'Confirmado por usuario';

export interface BANTCriteria {
  budget: boolean;
  authority: boolean;
  need: boolean;
  timeline: boolean;
  notes?: string;
}

/**
 * REGLA DE PERSISTENCIA (Excepción arquitectónica documentada):
 * A diferencia de otros valores derivados del sistema que se calculan al vuelo en memoria
 * (como el avance del funnel y prorrateo de días hábiles), el `icpScore`, `icpJustification`,
 * `icpLastEvaluated` e `icpScoreStatus` SÍ se persisten en la base de datos (Notion/LocalStorage)
 * porque su cálculo requiere una llamada a la API de Gemini (costosa en tiempo y cuota).
 * Se trata como una caché que se refresca solo cuando el usuario lo solicita explícitamente vía botón.
 */
export interface Lead {
  id: string;
  name: string;
  companyContact: string;
  position: string;
  email: string;
  phone: string;
  linkedin?: string;
  companyId: string; // Relation → Empresas
  timezone?: string; // IANA Format (e.g., 'America/Bogota', 'America/New_York')
  stage: CRMStage;
  bant: BANTCriteria;
  icpScore: number; // 0-100 (Resultado cacheado y persistido de la evaluación IA)
  icpJustification?: string; // Breve explicación que devuelve la IA de por qué asignó ese puntaje
  icpLastEvaluated?: string; // Fecha y hora ISO de la última evaluación para validar si está desactualizado
  icpScoreStatus?: ICPScoreStatus; // 'Sugerido por IA' | 'Confirmado por usuario'
  temperature: Temperature;
  semaforo: SemaforoColor;
  semaforoDescription: string;
  nextAction: string;
  estimatedValue: number; // $
  summary: string; // Resumen actual (se regenera al actualizar el estado; contexto para Chat de recursos)
  summaryUpdatedAt: string;
  followUpDate: string; // SLA date
  createdAt: string;
}

export type WorkBlockType =
  | 'Prospección'
  | 'Seguimiento'
  | 'Administrativo'
  | 'Descanso/Personal';

export type DayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface WorkBlock {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "12:00"
  type: WorkBlockType;
  companyId?: string; // Relation → Empresas (asociación para cálculo de horas invertidas)
  objective?: string;
  notes?: string;
}

export type InteractionChannel =
  | 'Instagram'
  | 'Facebook'
  | 'WhatsApp'
  | 'LinkedIn'
  | 'Email'
  | 'Llamada';

export type InteractionType =
  | 'Primer contacto'
  | 'Respuesta positiva'
  | 'Seguimiento'
  | 'Objeción'
  | 'Cierre';

export interface Interaction {
  id: string;
  leadId: string; // Relation → Leads
  date: string;
  channel: InteractionChannel;
  type: InteractionType;
  note: string;
  companyId?: string; // Relation → Empresas
  minutesSpent?: number; // Minutos invertidos en esta actividad
}

export type MeetingStatus = 'Confirmada' | 'Realizada' | 'No-show' | 'Reprogramada';

export interface Meeting {
  id: string;
  leadId: string; // Relation → Leads
  closerName: string;
  dateTime: string;
  link: string; // Meet/Zoom
  status: MeetingStatus;
  qualificationNotes: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  leadId: string; // Relation → Leads
  title: string;
  totalAmount: number;
  deliverables: string;
  paymentTerms: string;
  status: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada';
  createdAt: string;
}

export type CommissionEventType = 'Agendamiento' | 'Venta cerrada';
export type CommissionStatus = 'Pendiente' | 'Aprobada' | 'Pagada';

export interface Commission {
  id: string;
  eventType: CommissionEventType;
  companyId: string; // Relation → Empresas
  leadId: string; // Relation → Leads
  productName?: string; // Solo si Tipo = Venta cerrada
  valueGenerated: number; // Valor generado para la empresa ($)
  commissionPercent: number; // % o ratio de comisión acordado (e.g. 10 para 10%, o 100 si fijo)
  isFixedAmount?: boolean;
  status: CommissionStatus;
  date: string;
  notes?: string;
  // Nota: La comisión ganada se calcula vía fórmula (Valor generado * % comisión / 100)
}

export type ResourceType = 'Video' | 'Documento' | 'Plantilla' | 'Guion';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  link: string; // Drive if video, Notion/link if text
  description: string; // Texto clave usado por la IA
  tags: string[];
  recommendedSemaforos: SemaforoColor[];
  companyId?: string; // Relation → Empresas (or undefined if shared)
  timesRecommended: number;
  lastUsedDate?: string;
}

export interface SMARTAction {
  id: string;
  text: string;
  completed: boolean;
}

export interface SMARTGoal {
  id: string;
  companyId: string; // Relation → Empresas
  title: string;
  targetMetric: string;
  targetValue: number;
  currentMetricValue?: number;
  actions: SMARTAction[]; // % de avance se calcula contando marcados / total
  dueDate: string;
}

export interface ReportGoal {
  id: string;
  companyId: string; // Relation → Empresas
  period: string; // e.g., "2026-08"
  outreachTarget: number;
  engagedTarget: number;
  callsScheduledTarget: number;
  completedCallsTarget: number;
  pipelineGeneratedTarget: number;
}

export interface GlossaryItem {
  id: string;
  companyId?: string; // Relation → Empresas or general
  term: string;
  definition: string;
  practicalExample: string;
  proTip: string;
  category?: string;
}

export interface FeedbackIA {
  id: string;
  date: string;
  chatOrigin: 'Recursos' | 'Coach' | 'Evaluación ICP';
  contextSent: string;
  aiResponse: string;
  rating: 'positive' | 'negative';
  reason?: string;
  leadId?: string; // Relation → Leads (si aplica)
}

export type PeriodType =
  | 'Diario'
  | 'Semanal'
  | 'Quincenal'
  | 'Mensual'
  | 'Trimestral'
  | 'Anual'
  | 'Rango personalizado';

export interface ReportSnapshot {
  id: string;
  companyId: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  createdAt: string;
  executiveSummary: string;
  funnelMetrics: {
    outreach: { actual: number; target: number; percentage: number };
    engaged: { actual: number; target: number; percentage: number };
    scheduled: { actual: number; target: number; percentage: number };
    completed: { actual: number; target: number; percentage: number };
    pipelineGenerated: { actual: number; target: number; percentage: number };
  };
  coreMetrics: {
    area: ReportArea;
    metrics: { name: string; value: string | number; benchmark?: string }[];
  }[];
  qualitativeFeedback: string;
  actionPlan: string;
  liveCrmLink: string;
}

export interface Notebook {
  id: 'cuaderno_recursos' | 'cuaderno_coach';
  title: string;
  filename: string;
  content: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedResourceId?: string;
  feedbackGiven?: 'positive' | 'negative';
  leadId?: string;
}

export interface AuthStep1Result {
  success: boolean;
  challengeToken?: string;
  expiresInSeconds?: number;
  maskedEmail?: string;
  error?: string;
  devCodeNotice?: string;
}

export interface AuthStep2Result {
  success: boolean;
  sessionToken?: string;
  user?: {
    email: string;
    role: string;
  };
  remainingAttempts?: number;
  maxAttemptsReached?: boolean;
  error?: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthGoogleResult {
  success: boolean;
  sessionToken?: string;
  user?: {
    email: string;
    role: string;
    name?: string;
  };
  error?: string;
}

export interface NotionConfig {
  apiKey: string;
  prospectsDbId: string;
  companiesDbId: string;
  logsDbId: string;
  configDbId: string;
  lastSyncedAt?: string | null;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string | null;
}

export interface NotionSyncResult {
  success: boolean;
  syncedCounts?: {
    leads: number;
    companies: number;
    logs: number;
    blocks: number;
  };
  data?: {
    leads?: Lead[];
    companies?: Company[];
    workBlocks?: WorkBlock[];
    commissions?: Commission[];
    meetings?: Meeting[];
    interactions?: Interaction[];
    notebooks?: Notebook[];
    systemConfig?: any;
  };
  error?: string;
  message?: string;
  timestamp?: string;
}
