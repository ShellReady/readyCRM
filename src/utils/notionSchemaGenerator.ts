/**
 * Notion Template Kit & Database Schema Generator
 * Generates CSV scaffold templates with headers & sample rows,
 * JSON Schema definitions, and Markdown setup guides for 1-click Notion database creation.
 */

export interface NotionDatabaseSchema {
  id: string;
  name: string;
  filename: string;
  description: string;
  columns: {
    name: string;
    notionType: string;
    description: string;
    sampleValue: string;
    options?: string[];
  }[];
}

export const NOTION_DATABASE_SCHEMAS: NotionDatabaseSchema[] = [
  {
    id: "prospects",
    name: "1. Base de Datos: Prospectos & Leads (CRM BDR)",
    filename: "notion_schema_prospectos_bdr.csv",
    description: "Esquema completo para gestionar leads, calificación ICP, etapas del embudo, canales de contacto y datos de seguimiento.",
    columns: [
      { name: "Nombre Completo", notionType: "title", description: "Nombre y apellido del prospecto", sampleValue: "Carlos Mendoza" },
      { name: "Empresa", notionType: "select", description: "Empresa a la que pertenece o cuenta B2B", sampleValue: "TechCorp Latam", options: ["TechCorp Latam", "InnovateX", "SaaS Growth"] },
      { name: "Cargo / Rol", notionType: "text", description: "Puesto de decisión del contacto", sampleValue: "Chief Revenue Officer (CRO)" },
      { name: "Etapa Funnel", notionType: "select", description: "Estado actual dentro del embudo", sampleValue: "Contacto Inicial", options: ["Nuevo", "Contacto Inicial", "En Conversación", "Llamada Agendada", "Cualificado", "No Cualificado", "Ganado", "Perdido"] },
      { name: "Semáforo ICP", notionType: "select", description: "Nivel de ajuste con el perfil de cliente ideal", sampleValue: "🟢 Verde (Alta Prioridad)", options: ["🟢 Verde (Alta Prioridad)", "🟡 Amarillo (Medio/Evaluar)", "🔴 Rojo (Bajo/Descartado)"] },
      { name: "Score ICP (0-10)", notionType: "number", description: "Puntaje numérico calculado por IA", sampleValue: "9.2" },
      { name: "Teléfono / WhatsApp", notionType: "phone_number", description: "Número con código de país para mensajería directa", sampleValue: "+56 9 8765 4321" },
      { name: "Email Corporativo", notionType: "email", description: "Correo electrónico verificado", sampleValue: "cmendoza@techcorp.io" },
      { name: "Perfil LinkedIn", notionType: "url", description: "Enlace directo al perfil", sampleValue: "https://linkedin.com/in/carlos-mendoza-cro" },
      { name: "País / Ciudad", notionType: "text", description: "Ubicación geográfica", sampleValue: "Santiago, Chile" },
      { name: "Zona Horaria", notionType: "select", description: "Huso horario para timing óptimo", sampleValue: "America/Santiago (UTC-3)", options: ["America/Santiago (UTC-3)", "America/Bogota (UTC-5)", "America/Mexico_City (UTC-6)", "America/Buenos_Aires (UTC-3)", "Europe/Madrid (UTC+1)"] },
      { name: "Canal de Prospección", notionType: "select", description: "Origen o canal del primer contacto", sampleValue: "LinkedIn DM", options: ["LinkedIn DM", "WhatsApp", "Email Frío", "Llamada Directa", "Referido"] },
      { name: "Objeciones Principales", notionType: "multi_select", description: "Barreras manifestadas por el lead", sampleValue: "Presupuesto, Timing", options: ["Presupuesto", "Timing", "Ya tienen proveedor", "Falta de autoridad", "Sin respuesta"] },
      { name: "Siguiente Paso", notionType: "text", description: "Acción requerida inmediata", sampleValue: "Enviar propuesta ejecutiva y agendar demo" },
      { name: "Fecha Último Contacto", notionType: "date", description: "Última fecha de interacción", sampleValue: "2026-08-30" },
      { name: "Fecha Próximo Seguimiento", notionType: "date", description: "Fecha de recordatorio programado", sampleValue: "2026-09-02" },
      { name: "Valor Estimado (USD)", notionType: "number", description: "Monto potencial del negocio", sampleValue: "4500" },
      { name: "Notas de Calificación", notionType: "text", description: "Anotaciones clave de dolor y fit", sampleValue: "Busca automatizar generación de reuniones B2B para su equipo de 6 setters." }
    ]
  },
  {
    id: "companies",
    name: "2. Base de Datos: Empresas Clientes & Cuentas (B2B)",
    filename: "notion_schema_empresas_b2b.csv",
    description: "Estructura para empresas contratantes, modelos de comisión, verticales de mercado y criterios ICP.",
    columns: [
      { name: "Nombre de la Empresa", notionType: "title", description: "Razón social o nombre comercial", sampleValue: "TechCorp Latam" },
      { name: "Industria / Vertical", notionType: "select", description: "Sector de negocio", sampleValue: "Software B2B / SaaS", options: ["Software B2B / SaaS", "Agencia Digital", "Consultoría Estratégica", "Fintech", "Educación Online"] },
      { name: "Tamaño Empresa", notionType: "select", description: "Rango de colaboradores", sampleValue: "11-50 colaboradores", options: ["1-10 colaboradores", "11-50 colaboradores", "51-200 colaboradores", "200+ colaboradores"] },
      { name: "Ticket Promedio (USD)", notionType: "number", description: "Valor típico de sus contratos", sampleValue: "3500" },
      { name: "Comisión por Cita (USD)", notionType: "number", description: "Pago fijo por reunión cualificada asistida", sampleValue: "75" },
      { name: "Comisión por Cierre (%)", notionType: "number", description: "Porcentaje sobre el valor de venta cerrada", sampleValue: "10" },
      { name: "Sitio Web", notionType: "url", description: "URL institucional", sampleValue: "https://techcorp.io" },
      { name: "Criterios ICP Clave", notionType: "text", description: "Requisitos indispensables de prospección", sampleValue: "Empresas con más de 10 empleados y facturación superior a 20k USD/mes." },
      { name: "Propuesta de Valor", notionType: "text", description: "Pitch central de la empresa", sampleValue: "Reducción del 40% en tiempo de prospección mediante workflows automatizados." },
      { name: "Estado Contrato", notionType: "select", description: "Vigencia de la relación comercial", sampleValue: "Activo", options: ["Activo", "Pausado", "En Negociación", "Finalizado"] }
    ]
  },
  {
    id: "logs",
    name: "3. Base de Datos: Registros Rápidos & Actividad Diaria",
    filename: "notion_schema_registros_actividad.csv",
    description: "Esquema para auditar cada llamada, mensaje, objeción y resultado diario del Setter/BDR.",
    columns: [
      { name: "Registro ID / Título", notionType: "title", description: "Identificador del registro", sampleValue: "Actividad - 2026-08-30 - Carlos Mendoza" },
      { name: "Fecha y Hora", notionType: "date", description: "Momento exacto del registro", sampleValue: "2026-08-30 11:30" },
      { name: "Prospecto Relacionado", notionType: "text", description: "Nombre del lead contactado", sampleValue: "Carlos Mendoza" },
      { name: "Empresa", notionType: "text", description: "Empresa del prospecto", sampleValue: "TechCorp Latam" },
      { name: "Tipo de Actividad", notionType: "select", description: "Acción ejecutada", sampleValue: "Llamada Saliente", options: ["Llamada Saliente", "WhatsApp Enviado", "LinkedIn DM", "Email Frío", "Reunión Cualificada", "Objeción Superada"] },
      { name: "Resultado", notionType: "select", description: "Respuesta obtenida", sampleValue: "Cita Agendada", options: ["Cita Agendada", "En Seguimiento", "No Contesta", "Rechazo / No Califica", "Mensaje Leído"] },
      { name: "Duración (Minutos)", notionType: "number", description: "Tiempo invertido", sampleValue: "12" },
      { name: "Objeción Encontrada", notionType: "select", description: "Objeción principal si existió", sampleValue: "Presupuesto", options: ["Ninguna", "Presupuesto", "Falta de Tiempo", "Ya tienen solución", "No es prioridad"] },
      { name: "Detalles / Transcripción", notionType: "text", description: "Resumen de lo conversado", sampleValue: "Mostró alto interés en el módulo de seguimiento automático. Agendó demo para el jueves 16:00 hrs." }
    ]
  },
  {
    id: "metrics_config",
    name: "4. Base de Datos: Metas, Métricas & Snapshot CRM",
    filename: "notion_schema_metas_snapshot.csv",
    description: "Esquema para almacenar metas mensuales de facturación, cuotas de prospección y respaldos integrales.",
    columns: [
      { name: "Período / Nombre Snapshot", notionType: "title", description: "Identificador de la meta o respaldo", sampleValue: "Metas Agosto 2026 - Roni Tovar" },
      { name: "Meta Mensual Facturación (USD)", notionType: "number", description: "Objetivo de ingresos mensual", sampleValue: "5000" },
      { name: "Facturación Actual (USD)", notionType: "number", description: "Total acumulado facturado", sampleValue: "3450" },
      { name: "Meta Citas Agendadas", notionType: "number", description: "Objetivo de reuniones agendadas", sampleValue: "40" },
      { name: "Citas Agendadas Reales", notionType: "number", description: "Total reuniones agendadas", sampleValue: "32" },
      { name: "Meta Citas Asistidas (Show-up)", notionType: "number", description: "Objetivo de reuniones con show-up", sampleValue: "32" },
      { name: "Citas Asistidas Reales", notionType: "number", description: "Total reuniones asistidas", sampleValue: "28" },
      { name: "Tasa Show-up (%)", notionType: "number", description: "Porcentaje de asistencia calculado", sampleValue: "87.5" },
      { name: "Total Prospectos Gestionados", notionType: "number", description: "Volumen de leads en base", sampleValue: "124" },
      { name: "Fecha de Respaldo / Snapshot", notionType: "date", description: "Timestamp de captura de datos", sampleValue: "2026-08-30" },
      { name: "JSON Snapshot Integral", notionType: "text", description: "Copia serializada del estado CRM para restauración instantánea", sampleValue: "{\"version\":\"2.0\",\"leadsCount\":124,\"companiesCount\":3}" }
    ]
  }
];

/**
 * Generates a clean CSV file string for a given database schema with 1 sample row (scaffold)
 */
export function generateSchemaCSV(schema: NotionDatabaseSchema): string {
  const headers = schema.columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
  const sampleValues = schema.columns.map((c) => `"${c.sampleValue.replace(/"/g, '""')}"`).join(',');
  return `${headers}\n${sampleValues}\n`;
}

/**
 * Generates a full Notion Blueprint JSON for developers / API users
 */
export function generateNotionBlueprintJSON(): string {
  const blueprint = {
    title: "CRM BDR & Setter Pro - Notion Multi-Database Schema Kit",
    version: "2.0.0",
    author: "Roni Tovar Digital",
    generatedAt: new Date().toISOString(),
    description: "Definición completa de estructuras, tipos de campo y relaciones para recrear el ecosistema de bases de datos CRM en Notion.",
    databases: NOTION_DATABASE_SCHEMAS.map((schema) => ({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      properties: schema.columns.reduce((acc, col) => {
        acc[col.name] = {
          type: col.notionType,
          description: col.description,
          sample: col.sampleValue,
          ...(col.options ? { options: col.options } : {}),
        };
        return acc;
      }, {} as Record<string, any>),
    })),
  };
  return JSON.stringify(blueprint, null, 2);
}

/**
 * Generates a step-by-step Markdown Setup Guide for Notion
 */
export function generateNotionMarkdownGuide(): string {
  let md = `# 🚀 Guía de Creación y Plantilla de Bases de Datos Notion (CRM BDR/Setter)\n\n`;
  md += `Esta plantilla te permite recrear en **Notion** las 4 bases de datos necesarias para que tu CRM funcione con sincronización total en tiempo real entre tu PC, móvil y tablet.\n\n`;
  md += `## 📋 Resumen de Bases de Datos\n\n`;

  NOTION_DATABASE_SCHEMAS.forEach((db, i) => {
    md += `### ${db.name}\n`;
    md += `*${db.description}*\n\n`;
    md += `| Propiedad (Columna) | Tipo en Notion | Ejemplo / Opciones |\n`;
    md += `| :--- | :--- | :--- |\n`;
    db.columns.forEach((c) => {
      const opts = c.options ? `Opciones: \`${c.options.join('`, `')}\`` : `Ej: *${c.sampleValue}*`;
      md += `| **${c.name}** | \`${c.notionType}\` | ${opts} |\n`;
    });
    md += `\n---\n\n`;
  });

  md += `## ⚡ Cómo importar en Notion en 1 minuto:\n\n`;
  md += `1. Descarga los archivos \`.csv\` generados desde la pantalla de **Configuración** del CRM.\n`;
  md += `2. En Notion, ve a cualquier página o crea una nueva llamada **"CRM BDR Hub"**.\n`;
  md += `3. Haz clic en **Importar (Import)** > Selecciona **CSV** y sube el archivo descargado.\n`;
  md += `4. Notion creará automáticamente la base de datos con todas las columnas configuradas y la fila de ejemplo.\n`;
  md += `5. Haz clic en los tres puntos **(...)** de la base de datos > **Conexiones (Connections)** > Agrega tu integración de Notion.\n`;
  md += `6. Copia el ID o la URL de la base de datos y pégala en el panel de **Configuración** del CRM.\n\n`;
  md += `¡Listo! Ahora podrás subir y descargar prospectos desde cualquier dispositivo con 1 solo clic.\n`;

  return md;
}

/**
 * Helper to trigger browser download of text/csv/json/markdown content
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
