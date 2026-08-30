import {
  Company,
  Lead,
  Interaction,
  Meeting,
  Proposal,
  Commission,
  Resource,
  SMARTGoal,
  ReportGoal,
  GlossaryItem,
  FeedbackIA,
  ReportSnapshot,
  Notebook,
  WorkBlock,
} from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'SaaS Scale Latam',
    sector: 'Software Cloud & ERP para Medianas Empresas',
    cycleType: 'Alto ticket / ciclo largo',
    activeReportAreas: ['Actividad', 'Conversión/Pipeline', 'Calidad de leads', 'Velocidad/SLA'],
    color: '#3B82F6', // Blue
    logoText: 'SSL',
    notionDbUrl: 'https://notion.so/saas-scale-latam/pipeline-master-db',
    driveFolderUrl: 'https://drive.google.com/drive/folders/saas-scale-resources',
    icpProfile: `## Perfil de Cliente Ideal (ICP) — SaaS Scale Latam

### 1. Industria & Mercado Objetivo
- Empresas medianas de logística, transporte terrestre, distribución mayorista, manufactura y retail en México, Colombia, Chile y Perú.
- Facturación anual entre $1.5M USD y $20M USD.
- Flota activa de más de 20 vehículos o más de 50 empleados operativos.

### 2. Cargo del Contacto (Buyer Persona)
- Director de Operaciones (COO), Director de Tecnología (CIO / CTO), Gerente General o Gerente de Cadena de Suministro.
- Cuentan con autoridad directa de decisión o liderazgo en el comité de transformación digital.

### 3. Señales de Dolor & Casos de Uso
- Utilizan ERPs legacy o procesos manuales en hojas de cálculo que causan retrasos de más de 4 horas diarias en conciliación y emisión de guías de despacho.
- Quejas frecuentes por soporte técnico deficiente o altos costes de mantenimiento de su software actual.
- Urgencia por integrar APIs en la nube para sincronizar despachos en tiempo real.

### 4. Presupuesto & Ciclo Típico
- Capacidad de inversión anual de $12k a $35k USD.
- Ciclo de venta de 30 a 60 días con demo técnica previa al cierre.`,
  },
  {
    id: 'comp-2',
    name: 'Growth Agency X',
    sector: 'Agencia de Performance & Crecimiento B2B',
    cycleType: 'Ticket medio / ciclo corto',
    activeReportAreas: ['Actividad', 'Engagement', 'Conversión/Pipeline'],
    color: '#10B981', // Emerald
    logoText: 'GAX',
    notionDbUrl: 'https://notion.so/growth-agency-x/bdr-tracker-db',
    driveFolderUrl: 'https://drive.google.com/drive/folders/growth-agency-x-vids',
    icpProfile: `## Perfil de Cliente Ideal (ICP) — Growth Agency X

### 1. Industria & Mercado Objetivo
- Marcas D2C E-commerce (moda, cosmética, nutrición, calzado, gadgets y consumo masivo) en Hispanoamérica y mercado hispano de EE.UU.
- Tiendas online consolidadas con catálogo propio y ventas mensuales comprobables > $30k USD.

### 2. Cargo del Contacto (Buyer Persona)
- Co-Fundadores, CEOs, CMOs (Director de Marketing), Head of Growth o Directores de E-commerce.

### 3. Señales de Dolor & Fricciones
- Invierten más de $10k USD mensuales en pauta (Meta / TikTok / Google Ads) con fatiga creativa y coste por adquisición (CPA) disparado.
- Falta de atribución clara y modelos obsoletos de creatividades estáticas.
- Agencias anteriores que no entregan reportes en tiempo real ni optimizan el ROAS.

### 4. Presupuesto & Modelo Comercial
- Fee mensual (Retainer) de $2,000 a $5,000 USD + variable por rendimiento.
- Ciclo de decisión ágil: 7 a 20 días tras auditoría gratuita de cuenta publicitaria.`,
  },
  {
    id: 'comp-3',
    name: 'Fintech B2B Payments',
    sector: 'Infraestructura de Pagos Transfronterizos y API',
    cycleType: 'Alto ticket / ciclo largo',
    activeReportAreas: ['Actividad', 'Engagement', 'Calidad de leads', 'Velocidad/SLA', 'Financiero'],
    color: '#8B5CF6', // Purple
    logoText: 'FBP',
    notionDbUrl: 'https://notion.so/fintech-b2b/enterprise-crm-db',
    driveFolderUrl: 'https://drive.google.com/drive/folders/fintech-b2b-playbooks',
    icpProfile: `## Perfil de Cliente Ideal (ICP) — Fintech B2B Payments

### 1. Industria & Mercado Objetivo
- Plataformas digitales de remesas, marketplaces transfronterizos, neobancos, empresas de nómina global (EOR) y casas de software financiero con operaciones en América Latina y Estados Unidos.
- Volumen transaccional mensual mínimo procesado de $200k USD en adelante.

### 2. Cargo del Contacto (Buyer Persona)
- Chief Technology Officer (CTO), VP de Finanzas / CFO, VP de Alianzas y Expansión Internacional, Product Lead de Pagos.

### 3. Señales de Dolor & Necesidad Estratégica
- Altas comisiones de intermediación bancaria tradicional SWIFT y tiempos de liquidación lentos (> 48 horas).
- Necesidad de redundancia operativa vía API Gateway con certificaciones ISO 27001 y cumplimiento normativo en múltiples jurisdicciones (SPEI México, ACH Colombia, Pix Brasil, ACH EE.UU.).

### 4. Presupuesto & Valor de Contrato
- Valor anual de contrato (ACV) de $30k a $100k USD según volumen.
- Ciclo de venta de 45 a 90 días con evaluación de arquitectura de seguridad y due diligence legal.`,
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Carlos Mendoza',
    companyContact: 'Logística Transandina S.A.',
    position: 'Director de Operaciones & IT',
    email: 'cmendoza@logtransandina.com',
    phone: '+52 55 4912 3840',
    linkedin: 'https://linkedin.com/in/carlos-mendoza-logistics',
    companyId: 'comp-1',
    timezone: 'America/Mexico_City',
    stage: 'Calificado BANT',
    bant: {
      budget: true,
      authority: true,
      need: true,
      timeline: true,
      notes: 'Presupuesto asignado de $25k USD para renovación tecnológica en Q3.',
    },
    icpScore: 92,
    icpJustification: 'Alineación excepcional con el ICP de SaaS Scale Latam: Director con firma directa en empresa logística mediana (flota > 40 camiones). Dolor confirmado en lentitud de ERP actual y presupuesto asignado de $25k para Q3.',
    icpLastEvaluated: '2026-08-28T14:30:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Caliente',
    semaforo: 'Verde',
    semaforoDescription: 'Alta receptividad. Valida dolor en tiempos de respuesta de su ERP actual.',
    nextAction: 'Enviar invitación a demo técnica con el Closer asignado para este jueves a las 11:00 AM.',
    estimatedValue: 18000,
    summary: 'Carlos confirmó que su ERP actual les genera 6 horas de retraso diario en consolidación de guías de despacho. Cuenta con autoridad directa y busca migrar antes de fin de año. Receptivo a ver demo enfocado en API de sincronización.',
    summaryUpdatedAt: '2026-08-28',
    followUpDate: '2026-08-29',
    createdAt: '2026-08-20',
  },
  {
    id: 'lead-2',
    name: 'Valeria Sotomayor',
    companyContact: 'E-commerce Moda & Retail',
    position: 'Head of Growth',
    email: 'valeria@modaretail.co',
    phone: '+57 310 882 1923',
    linkedin: 'https://linkedin.com/in/valeria-sotomayor-growth',
    companyId: 'comp-2',
    timezone: 'America/Bogota',
    stage: 'Reunión Agendada',
    bant: {
      budget: true,
      authority: true,
      need: true,
      timeline: false,
      notes: 'Requieren escalar pauta en Meta & TikTok antes del Black Friday.',
    },
    icpScore: 88,
    icpJustification: 'Cumple con el perfil objetivo de Growth Agency X: Head of Growth en marca D2C con más de $30k en inversión mensual y dolor crítico en CPA ($45). Solo resta precisar la fecha límite de inicio de contrato.',
    icpLastEvaluated: '2026-08-27T16:00:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Caliente',
    semaforo: 'Verde',
    semaforoDescription: 'Reunión fijada en calendario. Enviar recordatorio previo con video de caso de éxito.',
    nextAction: 'Confirmar asistencia por WhatsApp 2 horas antes de la sesión.',
    estimatedValue: 4500,
    summary: 'Valeria busca una agencia que maneje más de $30k/mes en pauta pagada con atribución multicanal. Aceptó reunión exploratoria para este viernes 3:00 PM.',
    summaryUpdatedAt: '2026-08-27',
    followUpDate: '2026-08-29',
    createdAt: '2026-08-22',
  },
  {
    id: 'lead-3',
    name: 'Mauricio Alarcón',
    companyContact: 'Banco Soluciones Digitales',
    position: 'VP de Nuevos Negocios & Alianzas',
    email: 'malarcon@bancosoluciones.com',
    phone: '+56 9 7721 0094',
    linkedin: 'https://linkedin.com/in/mauricio-alarcon-fintech',
    companyId: 'comp-3',
    timezone: 'America/Santiago',
    stage: 'En Conversación',
    bant: {
      budget: true,
      authority: false,
      need: true,
      timeline: true,
      notes: 'Requiere aprobación final del Comité de Riesgo y Cumplimiento.',
    },
    icpScore: 84,
    icpJustification: 'Institución de alto volumen transaccional y necesidad clara de liquidación transfronteriza. Puntaje moderado a 84 porque la decisión final depende del Comité de Cumplimiento y requiere validación de ISO 27001.',
    icpLastEvaluated: '2026-08-26T11:20:00.000Z',
    icpScoreStatus: 'Sugerido por IA',
    temperature: 'Tibio',
    semaforo: 'Amarillo',
    semaforoDescription: 'Interesado pero tiene dudas sobre compliance regulatorio en transferencias internacionales.',
    nextAction: 'Compartir ficha técnica de licencias y certificaciones ISO 27001 por correo.',
    estimatedValue: 35000,
    summary: 'Mauricio está evaluando proveedores para liquidación en divisas hacia proveedores en EE.UU. Su mayor objeción es la velocidad de acreditación y los límites regulatorios.',
    summaryUpdatedAt: '2026-08-26',
    followUpDate: '2026-08-28',
    createdAt: '2026-08-18',
  },
  {
    id: 'lead-4',
    name: 'Andrea Morales',
    companyContact: 'Nexus Logística Integral',
    position: 'Gerente General',
    email: 'amorales@nexuslog.mx',
    phone: '+52 81 2099 4432',
    linkedin: 'https://linkedin.com/in/andrea-morales-nexus',
    companyId: 'comp-1',
    timezone: 'America/Mexico_City',
    stage: 'Contactado',
    bant: {
      budget: false,
      authority: true,
      need: true,
      timeline: false,
      notes: 'No ha querido revelar presupuesto inicial hasta ver propuesta.',
    },
    icpScore: 78,
    icpJustification: 'Gerente General con autoridad en empresa de logística. Dolor validado en gestión de rutas, pero pendiente de confirmar rango presupuestario y comparación con SAP.',
    icpLastEvaluated: '2026-08-28T09:15:00.000Z',
    icpScoreStatus: 'Sugerido por IA',
    temperature: 'Tibio',
    semaforo: 'Amarillo',
    semaforoDescription: 'Respondió mensaje en LinkedIn pero pidió información rápida por audio o video corto.',
    nextAction: 'Enviar video de 90 segundos explicando cómo SaaS Scale redujo costes en flota de 50 camiones.',
    estimatedValue: 12000,
    summary: 'Andrea vio el mensaje inicial y preguntó: "¿En qué se diferencian de SAP Business One?". Requiere enfoque en facilidad de implementación y coste de onboarding.',
    summaryUpdatedAt: '2026-08-28',
    followUpDate: '2026-08-28',
    createdAt: '2026-08-24',
  },
  {
    id: 'lead-5',
    name: 'Felipe Restrepo',
    companyContact: 'Inmobiliaria Habitat',
    position: 'Director Comercial',
    email: 'frestrepo@habitatcorp.com',
    phone: '+57 315 620 9901',
    linkedin: 'https://linkedin.com/in/felipe-restrepo-habitat',
    companyId: 'comp-2',
    timezone: 'America/Bogota',
    stage: 'Identificado',
    bant: {
      budget: false,
      authority: true,
      need: false,
      timeline: false,
      notes: 'Sin calificar aún.',
    },
    icpScore: 65,
    icpJustification: 'Sector inmobiliario fuera del foco primario D2C de Growth Agency X. Falta calificar dolor y validar si el volumen de pauta justifica el fee mensual.',
    icpLastEvaluated: '2026-08-28T17:00:00.000Z',
    icpScoreStatus: 'Sugerido por IA',
    temperature: 'Frío',
    semaforo: 'Rojo',
    semaforoDescription: 'Lead prospectado en frío. No ha interactuado aún.',
    nextAction: 'Ejecutar cadencia de contacto multicanal (LinkedIn + Email con gancho de caso de éxito en bienes raíces).',
    estimatedValue: 3000,
    summary: 'Empresa inmobiliaria con 4 proyectos activos. Su pauta actual en Facebook parece descuidada con creatividades repetidas desde hace 3 meses.',
    summaryUpdatedAt: '2026-08-28',
    followUpDate: '2026-08-29',
    createdAt: '2026-08-28',
  },
  {
    id: 'lead-6',
    name: 'Gonzalo Ibáñez',
    companyContact: 'Plataforma Global Remesas',
    position: 'Chief Technology Officer (CTO)',
    email: 'gibanez@globalremesas.io',
    phone: '+1 786 552 1190',
    linkedin: 'https://linkedin.com/in/gonzalo-ibanez-cto',
    companyId: 'comp-3',
    timezone: 'America/New_York',
    stage: 'Propuesta Enviada',
    bant: {
      budget: true,
      authority: true,
      need: true,
      timeline: true,
      notes: 'Aprobación presupuestaria lista para $50k anuales.',
    },
    icpScore: 96,
    icpJustification: 'Coincidencia perfecta con el ICP Enterprise de Fintech B2B: CTO con validación técnica de API completada, volumen transaccional masivo de remesas y presupuesto aprobado de $50k/año.',
    icpLastEvaluated: '2026-08-27T10:30:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Caliente',
    semaforo: 'Verde',
    semaforoDescription: 'Propuesta en revisión final con el CEO. Decisión la próxima semana.',
    nextAction: 'Hacer llamada de seguimiento para resolver cualquier duda sobre el SLA de integración.',
    estimatedValue: 48000,
    summary: 'Gonzalo asistió a la llamada técnica, validó la documentación de la API y solicitó propuesta formal con descuento por pago anual por adelantado.',
    summaryUpdatedAt: '2026-08-27',
    followUpDate: '2026-08-30',
    createdAt: '2026-08-10',
  },
  {
    id: 'lead-7',
    name: 'Mariana Duarte',
    companyContact: 'NutraHealth Suplementos',
    position: 'Co-Fundadora & CMO',
    email: 'mduarte@nutrahealth.lat',
    phone: '+52 33 1180 4455',
    linkedin: 'https://linkedin.com/in/mariana-duarte-nutra',
    companyId: 'comp-2',
    timezone: 'America/Mexico_City',
    stage: 'Cerrado Ganado',
    bant: {
      budget: true,
      authority: true,
      need: true,
      timeline: true,
    },
    icpScore: 90,
    icpJustification: 'ICP prototípico para Growth Agency X: Co-fundadora y CMO en nicho de suplementos y nutrición con tienda online activa y capacidad de pago confirmada.',
    icpLastEvaluated: '2026-08-25T15:00:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Caliente',
    semaforo: 'Verde',
    semaforoDescription: 'Cliente cerrado. Onboarding agendado.',
    nextAction: 'Generar registro de comisión por venta cerrada ($6,000 generados).',
    estimatedValue: 6000,
    summary: 'Contrato firmado para fee mensual de $2,000/mes x 3 meses mínimo con Growth Agency X.',
    summaryUpdatedAt: '2026-08-25',
    followUpDate: '2026-09-01',
    createdAt: '2026-08-05',
  },
  {
    id: 'lead-8',
    name: 'Jorge Benítez',
    companyContact: 'Servicios Industriales del Norte',
    position: 'Gerente de Compras',
    email: 'jbenitez@industrialesnorte.com',
    phone: '+52 81 8345 0012',
    linkedin: 'https://linkedin.com/in/jorge-benitez-compras',
    companyId: 'comp-1',
    timezone: 'America/Mexico_City',
    stage: 'Cerrado Perdido',
    bant: {
      budget: false,
      authority: false,
      need: true,
      timeline: false,
      notes: 'Decidieron renovar con proveedor local por bajo coste.',
    },
    icpScore: 45,
    icpJustification: 'Descalificado para SaaS Scale: Sin presupuesto disponible para renovación en la nube y sin autoridad final en la gerencia general.',
    icpLastEvaluated: '2026-08-21T18:00:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Frío',
    semaforo: 'Rojo',
    semaforoDescription: 'Objeción insalvable de presupuesto en este ciclo.',
    nextAction: 'Programar reactivación en 6 meses (Febrero 2027).',
    estimatedValue: 15000,
    summary: 'No contaban con presupuesto disponible para migración este año. Mantener en lista de nutrición.',
    summaryUpdatedAt: '2026-08-21',
    followUpDate: '2027-02-15',
    createdAt: '2026-08-01',
  },
  {
    id: 'lead-9',
    name: 'Esteban Camargo',
    companyContact: 'PayCross América Latina',
    position: 'Director de Expansión Internacional',
    email: 'ecamargo@paycrosslatam.com',
    phone: '+54 11 5821 7733',
    linkedin: 'https://linkedin.com/in/esteban-camargo-paycross',
    companyId: 'comp-3',
    timezone: 'America/Buenos_Aires',
    stage: 'Reunión Agendada',
    bant: {
      budget: true,
      authority: true,
      need: true,
      timeline: true,
      notes: 'Volumen mensual transaccional estimado en $600k USD. Buscan redundancia en pasarelas B2B.',
    },
    icpScore: 94,
    icpJustification: 'Alineación muy alta con el perfil enterprise: Empresa con volumen de $600k/mes que busca redundancia en pasarelas. Director de Expansión con firma y urgencia de despliegue.',
    icpLastEvaluated: '2026-08-28T12:00:00.000Z',
    icpScoreStatus: 'Confirmado por usuario',
    temperature: 'Caliente',
    semaforo: 'Verde',
    semaforoDescription: 'Reunión exploratoria completada con éxito. En espera de envío de propuesta técnica.',
    nextAction: 'Coordinar con el Closer el envío de la propuesta y acordar fecha de revisión de términos de integración.',
    estimatedValue: 28000,
    summary: 'Esteban quedó satisfecho con los tiempos de respuesta de la API y las comisiones por volumen. Solicita desglose detallado de integración de webhooks antes de la firma.',
    summaryUpdatedAt: '2026-08-28',
    followUpDate: '2026-08-30',
    createdAt: '2026-08-14',
  },
];

export const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    leadId: 'lead-1',
    date: '2026-08-20 09:30',
    channel: 'LinkedIn',
    type: 'Primer contacto',
    note: 'Inmail personalizado comentando su publicación sobre cuellos de botella en distribución.',
  },
  {
    id: 'int-2',
    leadId: 'lead-1',
    date: '2026-08-22 14:15',
    channel: 'LinkedIn',
    type: 'Respuesta positiva',
    note: 'Carlos respondió: "Justo estamos evaluando reemplazar nuestro software actual porque el soporte es pésimo".',
  },
  {
    id: 'int-3',
    leadId: 'lead-1',
    date: '2026-08-25 11:00',
    channel: 'WhatsApp',
    type: 'Seguimiento',
    note: 'Llamada de calificación BANT de 12 minutos. Confirmó presupuesto de $25k y fecha límite en Q3.',
  },
  {
    id: 'int-4',
    leadId: 'lead-2',
    date: '2026-08-22 16:00',
    channel: 'Instagram',
    type: 'Primer contacto',
    note: 'DM a la cuenta de la marca felicitando por su nueva colección y preguntando por su CAC actual.',
  },
  {
    id: 'int-5',
    leadId: 'lead-2',
    date: '2026-08-23 10:20',
    channel: 'WhatsApp',
    type: 'Respuesta positiva',
    note: 'Valeria pasó su WhatsApp directo: "Queremos bajar el CPA urgente, estamos pagando $45 por compra".',
  },
  {
    id: 'int-6',
    leadId: 'lead-3',
    date: '2026-08-26 15:40',
    channel: 'Email',
    type: 'Objeción',
    note: 'Objeción sobre tiempo de acreditación y licencias para operar en Perú y Colombia.',
  },
  {
    id: 'int-7',
    leadId: 'lead-4',
    date: '2026-08-24 11:20',
    channel: 'LinkedIn',
    type: 'Primer contacto',
    note: 'Mensaje de prospección enfocado en control de costes de combustible y rutas.',
  },
  {
    id: 'int-8',
    leadId: 'lead-4',
    date: '2026-08-27 18:00',
    channel: 'LinkedIn',
    type: 'Objeción',
    note: 'Preguntó si somos más caros que SAP y si la migración tarda más de 2 meses.',
  },
  {
    id: 'int-9',
    leadId: 'lead-7',
    date: '2026-08-24 16:30',
    channel: 'Llamada',
    type: 'Cierre',
    note: 'Llamada final de confirmación de pago y entrega de accesos.',
  },
  {
    id: 'int-10',
    leadId: 'lead-9',
    date: '2026-08-27 11:30',
    channel: 'WhatsApp',
    type: 'Seguimiento',
    note: 'Esteban confirmó asistencia a reunión técnica con David Paredes sobre integración de pasarelas.',
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    leadId: 'lead-1',
    closerName: 'Rodrigo Méndez (Closer Senior SSL)',
    dateTime: '2026-08-29 11:00',
    link: 'https://meet.google.com/abc-ssl-demo',
    status: 'Confirmada',
    qualificationNotes: 'Carlos Mendoza (Logística Transandina). BANT 100%. Dolor en integración de ERP y lentitud de soporte. Presupuesto $25k.',
    createdAt: '2026-08-26',
  },
  {
    id: 'meet-2',
    leadId: 'lead-2',
    closerName: 'Ana Lucía Gómez (Head Closer GAX)',
    dateTime: '2026-08-29 15:00',
    link: 'https://zoom.us/j/9823412903',
    status: 'Confirmada',
    qualificationNotes: 'Valeria Sotomayor (Moda & Retail). E-commerce con $30k pauta actual. Dolor en CPA elevado ($45) y falta de atribución.',
    createdAt: '2026-08-27',
  },
  {
    id: 'meet-3',
    leadId: 'lead-6',
    closerName: 'David Paredes (Director Comercial FBP)',
    dateTime: '2026-08-27 10:00',
    link: 'https://meet.google.com/fbp-tech-review',
    status: 'Realizada',
    qualificationNotes: 'Gonzalo Ibáñez (CTO Global Remesas). Revisión de arquitectura API completada exitosamente. Se envió propuesta de $48k.',
    createdAt: '2026-08-20',
  },
  {
    id: 'meet-4',
    leadId: 'lead-7',
    closerName: 'Ana Lucía Gómez (Head Closer GAX)',
    dateTime: '2026-08-24 14:00',
    link: 'https://zoom.us/j/7721990412',
    status: 'Realizada',
    qualificationNotes: 'Mariana Duarte (NutraHealth). Cierre exitoso por $6k trimestral.',
    createdAt: '2026-08-18',
  },
  {
    id: 'meet-5',
    leadId: 'lead-9',
    closerName: 'David Paredes (Director Comercial FBP)',
    dateTime: '2026-08-28 11:30',
    link: 'https://meet.google.com/fbp-paycross-eval',
    status: 'Realizada',
    qualificationNotes: 'Esteban Camargo (PayCross). Pasarela B2B de $600k/mes. Reunión realizada exitosamente.',
    createdAt: '2026-08-22',
  },
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    leadId: 'lead-6',
    title: 'Implementación Enterprise API Pagos Transfronterizos',
    totalAmount: 48000,
    deliverables: 'API Gateway dedicado, SLA 99.99%, Sandbox ilimitado, soporte 24/7 y conciliación automatizada.',
    paymentTerms: '50% al contrato, 50% a la puesta en producción (30 días).',
    status: 'Enviada',
    createdAt: '2026-08-27',
  },
  {
    id: 'prop-2',
    leadId: 'lead-7',
    title: 'Growth Retainer Q3/Q4 - Meta & TikTok Performance',
    totalAmount: 6000,
    deliverables: 'Estrategia de adquisición, 20 creatividades mensuales, optimización de funnel y dashboards en Looker.',
    paymentTerms: 'Prepago mensual recurrente de $2,000 USD.',
    status: 'Aceptada',
    createdAt: '2026-08-20',
  },
];

export const INITIAL_COMMISSIONS: Commission[] = [
  {
    id: 'com-1',
    eventType: 'Venta cerrada',
    companyId: 'comp-2',
    leadId: 'lead-7',
    productName: 'Retainer Trimestral Growth Scale',
    valueGenerated: 6000,
    commissionPercent: 12, // 12% = $720
    status: 'Aprobada',
    date: '2026-08-25',
    notes: 'Venta cerrada con NutraHealth Suplementos. Comisión pactada del 12%.',
  },
  {
    id: 'com-2',
    eventType: 'Agendamiento',
    companyId: 'comp-1',
    leadId: 'lead-1',
    valueGenerated: 18000,
    commissionPercent: 100, // Bono fijo por reunión calificada = $100
    isFixedAmount: true,
    status: 'Pendiente',
    date: '2026-08-26',
    notes: 'Reunión calificada BANT confirmada para Carlos Mendoza con Rodrigo Méndez.',
  },
  {
    id: 'com-3',
    eventType: 'Agendamiento',
    companyId: 'comp-2',
    leadId: 'lead-2',
    valueGenerated: 4500,
    commissionPercent: 75, // Bono fijo = $75
    isFixedAmount: true,
    status: 'Pendiente',
    date: '2026-08-27',
    notes: 'Reunión agendada para Valeria Sotomayor (Moda Retail).',
  },
  {
    id: 'com-4',
    eventType: 'Venta cerrada',
    companyId: 'comp-1',
    leadId: 'lead-8', // Previously closed historic deal
    productName: 'Licencia Cloud Anual 20 usuarios',
    valueGenerated: 14000,
    commissionPercent: 10, // 10% = $1,400
    status: 'Pagada',
    date: '2026-08-08',
    notes: 'Liquidado en cuenta bancaria el 10 de Agosto.',
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    name: 'Video Demo: Reducción de 6h a 20min en Conciliación de Carga',
    type: 'Video',
    link: 'https://drive.google.com/file/d/1a2b3c-saas-demo-logistica/view',
    description: 'Video de 2 minutos que muestra en pantalla dividida cómo nuestro software automatiza la lectura de guías de despacho y actualiza el ERP sin error humano. Ideal para directores de operaciones y gerentes de logística.',
    tags: ['Logística', 'Ahorro de Tiempo', 'ROI', 'Caso de Éxito'],
    recommendedSemaforos: ['Amarillo', 'Verde'],
    companyId: 'comp-1',
    timesRecommended: 14,
    lastUsedDate: '2026-08-27',
  },
  {
    id: 'res-2',
    name: 'Calculadora de ROI y Ficha Comparativa vs SAP & Oracle',
    type: 'Documento',
    link: 'https://notion.so/saas-scale/calculadora-roi-sap-vs-ssl',
    description: 'Ficha ejecutiva de 1 página con tabla de costes de implementación, tiempo de onboarding (14 días vs 6 meses) y coste total de propiedad (TCO) a 3 años.',
    tags: ['Objeción Precio', 'Competencia', 'SAP', 'Finanzas'],
    recommendedSemaforos: ['Amarillo', 'Rojo'],
    companyId: 'comp-1',
    timesRecommended: 9,
    lastUsedDate: '2026-08-26',
  },
  {
    id: 'res-3',
    name: 'Video Caso de Estudio E-commerce: De $45 a $18 CPA en 30 días',
    type: 'Video',
    link: 'https://drive.google.com/file/d/2b3c4d-gax-nutra-case-study/view',
    description: 'Video testimonial donde la fundadora de una marca de belleza explica cómo reestructuraron los ángulos de video en TikTok y Meta para triplicar las conversiones.',
    tags: ['E-commerce', 'TikTok Ads', 'Meta Ads', 'CPA'],
    recommendedSemaforos: ['Amarillo', 'Verde'],
    companyId: 'comp-2',
    timesRecommended: 22,
    lastUsedDate: '2026-08-28',
  },
  {
    id: 'res-4',
    name: 'Guion de Desarme de Objeción "Ya tenemos agencia"',
    type: 'Guion',
    link: 'https://notion.so/gax/guion-desarme-ya-tenemos-agencia',
    description: 'Guion táctico en 3 pasos para no competir en precio sino pedir una auditoría sin costo de 10 minutos de su cuenta publicitaria actual.',
    tags: ['Guion', 'Objeción Competencia', 'Auditoría', 'WhatsApp'],
    recommendedSemaforos: ['Rojo', 'Amarillo'],
    companyId: 'comp-2',
    timesRecommended: 31,
    lastUsedDate: '2026-08-28',
  },
  {
    id: 'res-5',
    name: 'Ficha Técnica de Cumplimiento Normativo & Certificación ISO 27001',
    type: 'Documento',
    link: 'https://drive.google.com/file/d/3c4d5e-fintech-security-whitepaper/view',
    description: 'Documento oficial con sellos de seguridad bancaria, cifrado de 256 bits y licencias para operar transferencias en México (SPEI), Colombia y EE.UU.',
    tags: ['Compliance', 'Seguridad', 'Bancos', 'Legal'],
    recommendedSemaforos: ['Amarillo', 'Verde'],
    companyId: 'comp-3',
    timesRecommended: 8,
    lastUsedDate: '2026-08-26',
  },
];

export const INITIAL_SMART_GOALS: SMARTGoal[] = [
  {
    id: 'goal-1',
    companyId: 'comp-1',
    title: 'Generar $80k en Pipeline Calificado en Agosto 2026',
    targetMetric: 'Pipeline Generado ($)',
    targetValue: 80000,
    currentMetricValue: 65000,
    actions: [
      { id: 'act-1', text: 'Enviar 40 Inmails diarios a directores de logística en México y Colombia', completed: true },
      { id: 'act-2', text: 'Implementar seguimiento de 3 toques por WhatsApp a leads que abrieron ficha técnica', completed: true },
      { id: 'act-3', text: 'Cerrar 8 reuniones agendadas con BANT completo antes del 31 de Agosto', completed: true },
      { id: 'act-4', text: 'Actualizar notas de dolor y resumen en Notion antes de transferir al Closer', completed: false },
    ],
    dueDate: '2026-08-31',
  },
  {
    id: 'goal-2',
    companyId: 'comp-2',
    title: 'Alcanzar 25 Respuestas Positivas y 12 Llamadas Agendadas',
    targetMetric: 'Llamadas Agendadas',
    targetValue: 12,
    currentMetricValue: 9,
    actions: [
      { id: 'act-5', text: 'Prospectar 20 nuevas marcas de D2C E-commerce al día en Instagram y TikTok', completed: true },
      { id: 'act-6', text: 'Ofrecer auditoría rápida de creatividades como gancho de valor', completed: true },
      { id: 'act-7', text: 'Enviar video de caso de estudio a todos los leads tibios', completed: false },
    ],
    dueDate: '2026-08-31',
  },
  {
    id: 'goal-3',
    companyId: 'comp-3',
    title: 'Penetración en 10 Fintechs y Plataformas de Remesas Tier 1',
    targetMetric: 'Reuniones con CTO/CPO',
    targetValue: 6,
    currentMetricValue: 4,
    actions: [
      { id: 'act-8', text: 'Mapear el organigrama tecnológico de 15 empresas objetivo', completed: true },
      { id: 'act-9', text: 'Contacto personalizado por LinkedIn citando su stack de APIs actual', completed: true },
      { id: 'act-10', text: 'Coordinar sesión técnica conjunta con el Director de Producto', completed: false },
    ],
    dueDate: '2026-09-15',
  },
];

export const INITIAL_REPORT_GOALS: ReportGoal[] = [
  {
    id: 'rep-goal-1',
    companyId: 'comp-1',
    period: '2026-08',
    outreachTarget: 250,
    engagedTarget: 45,
    callsScheduledTarget: 14,
    completedCallsTarget: 10,
    pipelineGeneratedTarget: 80000,
  },
  {
    id: 'rep-goal-2',
    companyId: 'comp-2',
    period: '2026-08',
    outreachTarget: 320,
    engagedTarget: 60,
    callsScheduledTarget: 18,
    completedCallsTarget: 14,
    pipelineGeneratedTarget: 40000,
  },
  {
    id: 'rep-goal-3',
    companyId: 'comp-3',
    period: '2026-08',
    outreachTarget: 150,
    engagedTarget: 25,
    callsScheduledTarget: 8,
    completedCallsTarget: 6,
    pipelineGeneratedTarget: 120000,
  },
];

export const INITIAL_GLOSSARY: GlossaryItem[] = [
  {
    id: 'glo-1',
    term: 'BANT (Budget, Authority, Need, Timeline)',
    definition: 'Framework clásico de calificación de prospectos para determinar si un lead tiene viabilidad real de compra.',
    practicalExample: '"Carlos cuenta con $25k asignados (Budget), es Director con firma directa (Authority), sufren 6h de retraso diario (Need) y deben migrar en Q3 (Timeline)".',
    proTip: 'Nunca preguntes "¿Cuál es tu presupuesto?" directamente. Pregunta: "¿Tienen un rango asignado para resolver este cuello de botella o están en fase de justificación financiera?".',
    category: 'Metodología',
  },
  {
    id: 'glo-2',
    term: 'Semáforo de Prospecto (Rojo / Amarillo / Verde)',
    definition: 'Indicador visual del estado psicológico y avance del prospecto en la conversación comercial.',
    practicalExample: 'Verde: Pide agenda o muestra urgencia. Amarillo: Tiene objeción de tiempo o compara con competencia. Rojo: No responde o objeción dura de presupuesto.',
    proTip: 'A un semáforo Amarillo jamás le insistas con un link de calendario; envíale primero un video de caso de estudio o recurso de valor.',
    category: 'Operativa',
  },
  {
    id: 'glo-3',
    term: 'SLA de Respuesta (Service Level Agreement)',
    definition: 'Compromiso de tiempo máximo para responder a un prospecto desde que muestra interés o envía un mensaje.',
    practicalExample: 'En canal WhatsApp el SLA es < 5 minutos en horario laboral. En LinkedIn Inmail es < 2 horas.',
    proTip: 'Responder dentro de los primeros 5 minutos incrementa la probabilidad de agendamiento en un 400% respecto a responder 1 hora después.',
    category: 'Métricas',
  },
  {
    id: 'glo-4',
    term: 'ICP (Ideal Customer Profile) Score',
    definition: 'Puntuación de 0 a 100 que mide la correspondencia entre la empresa/cargo del prospecto y el cliente ideal de la solución.',
    practicalExample: 'Director de IT en empresa de más de 100 empleados con facturación > $2M USD = 95 puntos.',
    proTip: 'Filtra en LinkedIn Sales Navigator por años de antigüedad de la empresa y tecnologías utilizadas para asegurar ICP > 80 antes de escribir.',
    category: 'Prospección',
  },
];

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: 'cuaderno_recursos',
    title: 'Cuadernillo de Recursos y Patrones de Objeción',
    filename: 'cuaderno_recursos.md',
    lastUpdated: '2026-08-28',
    content: `# Cuadernillo de Recursos y Patrones de Objeción — Setter Digital Remoto

## 1. Matriz de Recomendación por Semáforo
- **Semáforo Verde:** El prospecto ya validó dolor. No sobrecargar de material extenso. Enviar confirmación directa de reunión + enlace a video corto de 60s como pre-work para elevar el show-up rate.
- **Semáforo Amarillo:**
  - *Objeción "Es muy caro / no tenemos presupuesto":* Enviar Calculadora de ROI / Ficha Comparativa de Coste Total de Propiedad (TCO).
  - *Objeción "Ya trabajamos con otra agencia/proveedor":* Enviar Guion de Auditoría de 10 min sin compromiso + Caso de Estudio de migración rápida.
  - *Objeción de Seguridad/Cumplimiento:* Enviar Ficha de Certificación ISO 27001 / Whitepaper técnico de compliance.
- **Semáforo Rojo:** No enviar enlaces largos. Utilizar ganchos de texto desarmantes ("¿Tiene sentido que te comparta un audio de 45 segundos explicando esto o prefieres que no te contacte más?").

## 2. Regla de Oro del Copy de Introducción
Nunca digas "Te adjunto este archivo para que lo leas". Di siempre:
*"Justo recordando lo que me comentaste sobre [dolor específico], grabamos un video de 90 segundos que muestra exactamente cómo [empresa similar] lo resolvió. ¿Te parece que te lo pase por aquí?"*
`,
  },
  {
    id: 'cuaderno_coach',
    title: 'Cuadernillo Coach BDR y Playbook de Prospección',
    filename: 'cuaderno_coach.md',
    lastUpdated: '2026-08-28',
    content: `# Cuadernillo Coach BDR — Playbook Operativo de Alto Rendimiento

## 1. Responsabilidades del Setter Digital Remoto (PSD/BDR)
1. **Generación de Oportunidades:** Prospección multicanal rigurosa (LinkedIn Inmail, Instagram DM, Email y WhatsApp).
2. **Calificación Estricta BANT:** Proteger el tiempo de los Closers asegurando que cada lead agendado tenga dolor real y poder de decisión.
3. **Velocidad y SLA:** Mantener tiempos de respuesta < 5 min en inbound/warm y seguimiento constante a 3-5 toques.
4. **Higiene del CRM:** Mantener el campo "Resumen actual" actualizado y clasificar el Semáforo de forma objetiva.

## 2. Flujograma de Conversación
- **Fase 1: Apertura Relevante:** Mencionar un hecho real de la empresa del prospecto (noticia, post, vacante abierta).
- **Fase 2: Pregunta de Diagnóstico / Disrupción:** "¿Cómo están manejando actualmente el cuello de botella en [proceso clave]?"
- **Fase 3: Calificación Ligera:** Validar si es una prioridad para este trimestre.
- **Fase 4: Transición al Agendamiento:** "Vale la pena que lo revise nuestro especialista en 15 minutos. ¿Te queda mejor jueves a las 11:00 AM o viernes a las 3:00 PM?"
`,
  },
];

export const INITIAL_FEEDBACK_IA: FeedbackIA[] = [
  {
    id: 'fb-1',
    date: '2026-08-27',
    chatOrigin: 'Recursos',
    contextSent: 'Lead Carlos Mendoza con objeción de lentitud de soporte en su ERP actual.',
    aiResponse: 'Recomendó video demo de 2 minutos de sincronización de guías.',
    rating: 'positive',
    reason: 'El micro-copy sugerido logró que el prospecto respondiera en menos de 10 minutos.',
    leadId: 'lead-1',
  },
  {
    id: 'fb-2',
    date: '2026-08-26',
    chatOrigin: 'Coach',
    contextSent: 'Consulta sobre cómo responder a un director que dice "No tengo tiempo esta semana".',
    aiResponse: 'Sugirió pedir una respuesta por audio de 30 segundos.',
    rating: 'positive',
    reason: 'Muy efectivo para bajar la guardia en WhatsApp.',
  },
];

export const INITIAL_REPORT_SNAPSHOTS: ReportSnapshot[] = [
  {
    id: 'snap-1',
    companyId: 'comp-1',
    periodType: 'Semanal',
    startDate: '2026-08-18',
    endDate: '2026-08-24',
    createdAt: '2026-08-24 18:30',
    executiveSummary: 'Semana de alta tracción en el sector logístico. Se alcanzaron 65 contactos en frío, 12 respuestas positivas y 3 reuniones agendadas con BANT calificado, generando $38,000 en pipeline estimado.',
    funnelMetrics: {
      outreach: { actual: 65, target: 60, percentage: 108 },
      engaged: { actual: 12, target: 11, percentage: 109 },
      scheduled: { actual: 3, target: 3, percentage: 100 },
      completed: { actual: 2, target: 2, percentage: 100 },
      pipelineGenerated: { actual: 38000, target: 35000, percentage: 108 },
    },
    coreMetrics: [
      {
        area: 'Actividad',
        metrics: [
          { name: 'Mensajes enviados (Inmail/Email)', value: '65', benchmark: 'Meta: 60' },
          { name: 'Toques de seguimiento ejecutados', value: '42', benchmark: 'Meta: 35' },
        ],
      },
      {
        area: 'Conversión/Pipeline',
        metrics: [
          { name: 'Tasa de respuesta inicial', value: '18.4%', benchmark: 'Obj: > 15%' },
          { name: 'Tasa de agendamiento sobre respuestas', value: '25.0%', benchmark: 'Obj: > 20%' },
        ],
      },
      {
        area: 'Calidad de leads',
        metrics: [
          { name: 'ICP Score Promedio de leads agendados', value: '89.3 / 100', benchmark: 'Tier 1' },
          { name: '% Leads con Presupuesto Verificado', value: '100%', benchmark: '100%' },
        ],
      },
      {
        area: 'Velocidad/SLA',
        metrics: [
          { name: 'Tiempo promedio de primer respuesta', value: '8 min', benchmark: 'SLA < 15 min' },
          { name: 'Show-up rate a reuniones', value: '100%', benchmark: 'Target > 80%' },
        ],
      },
    ],
    qualitativeFeedback: 'La principal objeción encontrada fue la comparación contra SAP Business One y el temor al tiempo de migración. Al enviar la calculadora de ROI y el video de 2 minutos, la resistencia disminuyó notablemente.',
    actionPlan: '1. Intensificar prospección en empresas de logística con flota > 30 vehículos.\n2. Acompañar a los Closers con notas de dolor previas a la demo.',
    liveCrmLink: 'https://notion.so/saas-scale-latam/pipeline-master-db?view=semana-34',
  },
];

export const INITIAL_WORK_BLOCKS: WorkBlock[] = [
  // Lunes
  { id: 'wb-lun-1', day: 'Lunes', startTime: '08:30', endTime: '11:30', type: 'Prospección', companyId: 'comp-1', notes: 'Outreach activo en frío y personalización Inmail' },
  { id: 'wb-lun-2', day: 'Lunes', startTime: '11:30', endTime: '13:00', type: 'Seguimiento', companyId: 'comp-2', notes: 'Nutrición de leads tibios y resolución de objeciones' },
  { id: 'wb-lun-3', day: 'Lunes', startTime: '13:00', endTime: '14:30', type: 'Descanso/Personal', notes: 'Almuerzo y desconexión' },
  { id: 'wb-lun-4', day: 'Lunes', startTime: '14:30', endTime: '17:00', type: 'Prospección', companyId: 'comp-3', notes: 'Contacto C-Level Fintech y Banca' },
  { id: 'wb-lun-5', day: 'Lunes', startTime: '17:00', endTime: '18:30', type: 'Administrativo', notes: 'Actualización CRM, reportes diarios y sincronización Notion' },

  // Martes
  { id: 'wb-mar-1', day: 'Martes', startTime: '08:30', endTime: '11:30', type: 'Prospección', companyId: 'comp-1', notes: 'Cadencias multicanal y mensajes de video' },
  { id: 'wb-mar-2', day: 'Martes', startTime: '11:30', endTime: '13:00', type: 'Seguimiento', companyId: 'comp-2', notes: 'Reactivación de leads en semáforo amarillo' },
  { id: 'wb-mar-3', day: 'Martes', startTime: '13:00', endTime: '14:30', type: 'Descanso/Personal', notes: 'Almuerzo' },
  { id: 'wb-mar-4', day: 'Martes', startTime: '14:30', endTime: '17:00', type: 'Prospección', companyId: 'comp-3', notes: 'Prospección enterprise' },
  { id: 'wb-mar-5', day: 'Martes', startTime: '17:00', endTime: '18:30', type: 'Administrativo', notes: 'Cierre de agenda de reuniones' },

  // Miércoles
  { id: 'wb-mie-1', day: 'Miércoles', startTime: '08:30', endTime: '11:30', type: 'Prospección', companyId: 'comp-1', notes: 'Outreach focalizado' },
  { id: 'wb-mie-2', day: 'Miércoles', startTime: '11:30', endTime: '13:00', type: 'Seguimiento', companyId: 'comp-2', notes: 'Confirmación de citas para jueves/viernes' },
  { id: 'wb-mie-3', day: 'Miércoles', startTime: '13:00', endTime: '14:30', type: 'Descanso/Personal', notes: 'Almuerzo' },
  { id: 'wb-mie-4', day: 'Miércoles', startTime: '14:30', endTime: '17:00', type: 'Prospección', companyId: 'comp-3', notes: 'Prospección outbound' },
  { id: 'wb-mie-5', day: 'Miércoles', startTime: '17:00', endTime: '18:30', type: 'Administrativo', notes: 'Limpieza de base y notas BANT' },

  // Jueves
  { id: 'wb-jue-1', day: 'Jueves', startTime: '08:30', endTime: '11:30', type: 'Prospección', companyId: 'comp-1', notes: 'Campañas de primer contacto' },
  { id: 'wb-jue-2', day: 'Jueves', startTime: '11:30', endTime: '13:00', type: 'Seguimiento', companyId: 'comp-2', notes: 'Seguimiento intensivo de respuestas' },
  { id: 'wb-jue-3', day: 'Jueves', startTime: '13:00', endTime: '14:30', type: 'Descanso/Personal', notes: 'Almuerzo' },
  { id: 'wb-jue-4', day: 'Jueves', startTime: '14:30', endTime: '17:00', type: 'Prospección', companyId: 'comp-3', notes: 'Prospección API y Pagos' },
  { id: 'wb-jue-5', day: 'Jueves', startTime: '17:00', endTime: '18:30', type: 'Administrativo', notes: 'Revisión con Closers' },

  // Viernes
  { id: 'wb-vie-1', day: 'Viernes', startTime: '08:30', endTime: '11:30', type: 'Prospección', companyId: 'comp-1', notes: 'Último empuje de prospección semanal' },
  { id: 'wb-vie-2', day: 'Viernes', startTime: '11:30', endTime: '13:00', type: 'Seguimiento', companyId: 'comp-2', notes: 'Nutrición y cierre de acuerdos' },
  { id: 'wb-vie-3', day: 'Viernes', startTime: '13:00', endTime: '14:30', type: 'Descanso/Personal', notes: 'Almuerzo' },
  { id: 'wb-vie-4', day: 'Viernes', startTime: '14:30', endTime: '16:30', type: 'Seguimiento', companyId: 'comp-3', notes: 'Seguimiento propuestas enviadas' },
  { id: 'wb-vie-5', day: 'Viernes', startTime: '16:30', endTime: '18:30', type: 'Administrativo', notes: 'Generación de reportes ejecutivos semanales' },

  // Sábado
  { id: 'wb-sab-1', day: 'Sábado', startTime: '09:00', endTime: '11:30', type: 'Seguimiento', companyId: 'comp-1', notes: 'Revisión rápida de respuestas de fin de semana' },
  { id: 'wb-sab-2', day: 'Sábado', startTime: '11:30', endTime: '13:00', type: 'Administrativo', notes: 'Planificación de listas para el lunes' },
];
