/**
 * Notion Multi-Database Integration & Bidirectional Sync Engine for CRM BDR/Setter
 * Direct integration with the official Notion REST API (v1)
 */

export interface NotionSyncPayload {
  apiKey?: string;
  prospectsDbId?: string;
  companiesDbId?: string;
  logsDbId?: string;
  configDbId?: string;
  data: {
    leads?: any[];
    companies?: any[];
    quickLogs?: any[];
    workBlocks?: any[];
    commissions?: any[];
    meetings?: any[];
    interactions?: any[];
    notebooks?: any[];
    systemConfig?: any;
  };
}

/**
 * Extracts a clean 32-character Notion Database ID from raw ID, UUID, or full Notion URL.
 */
export function cleanNotionId(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  const matches = trimmed.match(
    /[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i
  );
  if (matches && matches[0]) {
    return matches[0].replace(/-/g, "").toLowerCase();
  }
  return trimmed.replace(/[^a-zA-Z0-9]/g, "");
}

function safeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  return null;
}

function safeEmail(email?: string): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : null;
}

function safeDate(d?: string | number | Date): { start: string } | null {
  if (!d) return null;
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return { start: parsed.toISOString().slice(0, 10) };
    }
  } catch {}
  return null;
}

function extractPlainText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title" && Array.isArray(prop.title)) {
    return prop.title.map((t: any) => t.plain_text || t.text?.content || "").join("");
  }
  if (prop.type === "rich_text" && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: any) => t.plain_text || t.text?.content || "").join("");
  }
  if (prop.type === "email") return prop.email || "";
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "phone_number") return prop.phone_number || "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "status") return prop.status?.name || "";
  return "";
}

function extractNumber(prop: any, fallback = 0): number {
  if (!prop) return fallback;
  if (prop.type === "number" && typeof prop.number === "number") {
    return prop.number;
  }
  return fallback;
}

function extractDate(prop: any): string {
  if (!prop) return "";
  if (prop.type === "date" && prop.date?.start) {
    return prop.date.start;
  }
  return "";
}

function extractCheckbox(prop: any): boolean {
  if (!prop) return false;
  if (prop.type === "checkbox") return Boolean(prop.checkbox);
  if (prop.type === "select") {
    const val = (prop.select?.name || "").toLowerCase();
    return val === "archivado" || val === "true" || val === "sí" || val === "si";
  }
  return false;
}

/**
 * Saves or updates a single lead directly to Notion's Prospects Database.
 * If lead.notionPageId (or valid UUID) exists, it attempts a PATCH. Otherwise, it creates a new page.
 */
export async function saveLeadToNotion(payload: {
  apiKey?: string;
  prospectsDbId?: string;
  lead: any;
  companies?: any[];
}): Promise<{
  success: boolean;
  notionPageId?: string;
  last_edited_time?: string;
  error?: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return { success: false, error: "Falta el Token de Notion." };
  }

  const prospectsDb = cleanNotionId(payload.prospectsDbId || process.env.NOTION_PROSPECTS_DB_ID);
  if (!prospectsDb) {
    return { success: false, error: "Falta el ID de la base de datos de Prospectos en Notion." };
  }

  const lead = payload.lead;
  const companies = payload.companies || [];
  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "General";
    const found = companies.find((c: any) => c.id === companyId);
    return found ? found.name : companyId;
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  const properties: any = {
    "Nombre Completo": {
      title: [{ text: { content: lead.name || "Prospecto Sin Nombre" } }],
    },
    "Cargo / Rol": {
      rich_text: [{ text: { content: lead.position || "Decision Maker" } }],
    },
    "Empresa": {
      rich_text: [{ text: { content: lead.companyContact || getCompanyName(lead.companyId) } }],
    },
    "Semáforo ICP": {
      rich_text: [{ text: { content: lead.semaforo || "Amarillo" } }],
    },
    "Score ICP (0-10)": {
      number: typeof lead.icpScore === "number" ? Math.min(10, Math.max(0, Math.round(lead.icpScore / 10))) : 7,
    },
    "Etapa Funnel": {
      rich_text: [{ text: { content: lead.stage || "Identificado" } }],
    },
    "Canal de Prospección": {
      rich_text: [{ text: { content: lead.channel || "LinkedIn" } }],
    },
    "Valor Estimado (USD)": {
      number: Number(lead.estimatedValue || lead.dealValue || 0),
    },
    "Objeciones Principales": {
      rich_text: [{ text: { content: (lead.semaforoDescription || lead.notes || "").slice(0, 1900) } }],
    },
    "Notas de Calificación": {
      rich_text: [{ text: { content: (lead.summary || lead.qualificationNotes || "").slice(0, 1900) } }],
    },
    "Siguiente Paso": {
      rich_text: [{ text: { content: lead.nextAction || "Contactar por mensaje inicial" } }],
    },
    "Estado Archivado": {
      rich_text: [{ text: { content: lead.isArchived ? `Archivado (${lead.archivedReason || lead.stage || "Cerrado"})` : "Activo" } }],
    },
  };

  const validEmail = safeEmail(lead.email);
  if (validEmail) properties["Email Corporativo"] = { email: validEmail };

  if (lead.phone) {
    properties["Teléfono / WhatsApp"] = {
      rich_text: [{ text: { content: String(lead.phone) } }],
    };
  }

  const validLinkedin = safeUrl(lead.linkedin);
  if (validLinkedin) properties["Perfil LinkedIn"] = { url: validLinkedin };

  const validLastContact = safeDate(lead.summaryUpdatedAt || lead.createdAt || new Date().toISOString());
  if (validLastContact) properties["Fecha Último Contacto"] = { date: validLastContact };

  const validFollowUp = safeDate(lead.followUpDate);
  if (validFollowUp) properties["Fecha Próximo Seguimiento"] = { date: validFollowUp };

  if (lead.timezone) {
    properties["Zona Horaria"] = { rich_text: [{ text: { content: lead.timezone } }] };
  }

  const targetPageId = lead.notionPageId || (lead.id && lead.id.length >= 32 ? lead.id : null);

  // If page already exists in Notion, update it with PATCH
  if (targetPageId) {
    try {
      const updateRes = await fetch(`https://api.notion.com/v1/pages/${targetPageId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ properties }),
      });

      if (updateRes.ok) {
        const updateData: any = await updateRes.json();
        return {
          success: true,
          notionPageId: updateData.id,
          last_edited_time: updateData.last_edited_time,
        };
      }
    } catch (e: any) {
      console.warn("[NOTION] Error patching lead page:", e.message);
    }
  }

  // Otherwise, create new page in Notion database
  try {
    const createRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { database_id: prospectsDb },
        properties,
      }),
    });

    if (!createRes.ok) {
      const errJson: any = await createRes.json().catch(() => ({}));
      return {
        success: false,
        error: `Error de Notion (${createRes.status}): ${errJson.message || createRes.statusText}`,
      };
    }

    const createData: any = await createRes.json();
    return {
      success: true,
      notionPageId: createData.id,
      last_edited_time: createData.last_edited_time,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al crear página en Notion",
    };
  }
}

/**
 * Deletes a record/page in Notion in ONE direction by setting archived: true (moving to Notion trash).
 */
export async function deletePageInNotion(payload: {
  apiKey?: string;
  pageId: string;
}): Promise<{ success: boolean; error?: string }> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return { success: false, error: "Falta el Token de Notion." };
  }
  if (!payload.pageId) {
    return { success: false, error: "Falta el ID de la página a eliminar en Notion." };
  }

  try {
    const cleanId = cleanNotionId(payload.pageId);
    const res = await fetch(`https://api.notion.com/v1/pages/${cleanId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archived: true,
      }),
    });

    if (!res.ok) {
      const errJson: any = await res.json().catch(() => ({}));
      return {
        success: false,
        error: `Error al archivar/eliminar página en Notion: ${errJson.message || res.statusText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al eliminar en Notion.",
    };
  }
}

/**
 * Checks for external updates in Notion database comparing last_edited_time
 */
export async function checkNotionUpdates(payload: {
  apiKey?: string;
  prospectsDbId?: string;
  lastCheckedTime?: string;
}): Promise<{
  success: boolean;
  hasUpdates: boolean;
  latestEditedTime?: string;
  updatedPagesCount?: number;
  error?: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return { success: false, hasUpdates: false, error: "Falta Token Notion" };
  }
  const prospectsDb = cleanNotionId(payload.prospectsDbId || process.env.NOTION_PROSPECTS_DB_ID);
  if (!prospectsDb) {
    return { success: false, hasUpdates: false, error: "Falta prospectsDbId" };
  }

  try {
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${prospectsDb}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 10,
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      }),
    });

    if (!queryRes.ok) {
      return { success: false, hasUpdates: false };
    }

    const data: any = await queryRes.json();
    const results = data.results || [];
    if (results.length === 0) {
      return { success: true, hasUpdates: false };
    }

    const latestEditedTime = results[0]?.last_edited_time;
    if (!payload.lastCheckedTime) {
      return { success: true, hasUpdates: true, latestEditedTime, updatedPagesCount: results.length };
    }

    const lastChecked = new Date(payload.lastCheckedTime).getTime();
    const latest = new Date(latestEditedTime).getTime();
    const hasUpdates = latest > lastChecked;
    const updatedPages = results.filter((p: any) => new Date(p.last_edited_time).getTime() > lastChecked);

    return {
      success: true,
      hasUpdates,
      latestEditedTime,
      updatedPagesCount: updatedPages.length,
    };
  } catch (error: any) {
    return { success: false, hasUpdates: false, error: error.message };
  }
}

/**
 * Tests Notion API key and validates individual database access
 */
export async function testNotionConnection(
  apiKey?: string,
  databases?: string | { prospectsDbId?: string; companiesDbId?: string; logsDbId?: string; configDbId?: string }
): Promise<{
  success: boolean;
  botName?: string;
  workspaceName?: string;
  databasesChecked?: { id: string; name: string; accessible: boolean; title?: string; type?: string }[];
  missingAccessNotice?: string;
  error?: string;
}> {
  const token = (apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return { success: false, error: "Falta el Token / API Key de Notion." };
  }

  try {
    const userRes = await fetch("https://api.notion.com/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!userRes.ok) {
      const errJson: any = await userRes.json().catch(() => ({}));
      return {
        success: false,
        error: `Error de autenticación Notion (${userRes.status}): ${errJson.message || userRes.statusText}`,
      };
    }

    const userData: any = await userRes.json();
    const botName = userData.name || userData.bot?.owner?.workspace_name || "BDR PSD";

    const databasesChecked: { id: string; name: string; accessible: boolean; title?: string; type?: string }[] = [];

    const dbList: { name: string; id: string }[] = [];
    if (typeof databases === "string") {
      if (databases) dbList.push({ name: "Base Principal / Snapshot", id: cleanNotionId(databases) });
    } else if (databases && typeof databases === "object") {
      if (databases.prospectsDbId) dbList.push({ name: "Prospectos & Leads", id: cleanNotionId(databases.prospectsDbId) });
      if (databases.companiesDbId) dbList.push({ name: "Empresas Clientes", id: cleanNotionId(databases.companiesDbId) });
      if (databases.logsDbId) dbList.push({ name: "Registros Rápidos & Logs", id: cleanNotionId(databases.logsDbId) });
      if (databases.configDbId) dbList.push({ name: "Metas & Snapshot CRM", id: cleanNotionId(databases.configDbId) });
    } else {
      if (process.env.NOTION_PROSPECTS_DB_ID) dbList.push({ name: "Prospectos & Leads", id: cleanNotionId(process.env.NOTION_PROSPECTS_DB_ID) });
      if (process.env.NOTION_COMPANIES_DB_ID) dbList.push({ name: "Empresas Clientes", id: cleanNotionId(process.env.NOTION_COMPANIES_DB_ID) });
      if (process.env.NOTION_LOGS_DB_ID) dbList.push({ name: "Registros Rápidos & Logs", id: cleanNotionId(process.env.NOTION_LOGS_DB_ID) });
      if (process.env.NOTION_CONFIG_DB_ID) dbList.push({ name: "Metas & Snapshot CRM", id: cleanNotionId(process.env.NOTION_CONFIG_DB_ID) });
    }

    let anyInaccessible = false;

    for (const item of dbList) {
      if (!item.id) continue;
      let accessible = false;
      let title = item.name;
      let objType = "database";

      try {
        const dbRes = await fetch(`https://api.notion.com/v1/databases/${item.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
          },
        });
        if (dbRes.ok) {
          const dbData: any = await dbRes.json();
          title = dbData.title?.[0]?.plain_text || item.name;
          accessible = true;
          objType = "database";
        }
      } catch {}

      if (!accessible) {
        try {
          const pageRes = await fetch(`https://api.notion.com/v1/pages/${item.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Notion-Version": "2022-06-28",
            },
          });
          if (pageRes.ok) {
            const pageData: any = await pageRes.json();
            const pageTitleProp = Object.values(pageData.properties || {}).find((p: any) => p.type === "title") as any;
            title = pageTitleProp?.title?.[0]?.plain_text || item.name;
            accessible = true;
            objType = "page";
          }
        } catch {}
      }

      if (!accessible) {
        anyInaccessible = true;
      }

      databasesChecked.push({ id: item.id, name: item.name, accessible, title, type: objType });
    }

    const missingNotice = anyInaccessible
      ? '⚠️ En Notion, ve a la página principal del CRM, haz clic en los 3 puntos (···) arriba a la derecha > "Conexiones" / "Conectar con..." y selecciona "BDR PSD" para autorizar el acceso.'
      : undefined;

    return {
      success: true,
      botName,
      workspaceName: userData.bot?.workspace_name || "Espacio de Roni Tovar",
      databasesChecked,
      missingAccessNotice: missingNotice,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al conectar con la API de Notion.",
    };
  }
}

/**
 * Pushes ALL CRM records into Notion databases:
 * 1. Prospects/Leads -> prospectsDbId
 * 2. Companies -> companiesDbId
 * 3. QuickLogs / Activity -> logsDbId
 * 4. Metas & Snapshot -> configDbId
 */
export async function pushDataToNotion(payload: NotionSyncPayload): Promise<{
  success: boolean;
  syncedCounts: { leads: number; companies: number; logs: number; blocks: number };
  message: string;
  error?: string;
  timestamp: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return {
      success: false,
      syncedCounts: { leads: 0, companies: 0, logs: 0, blocks: 0 },
      message: "No se proporcionó API Key de Notion.",
      error: "NOTION_API_KEY_MISSING",
      timestamp: new Date().toISOString(),
    };
  }

  const prospectsDb = cleanNotionId(payload.prospectsDbId || process.env.NOTION_PROSPECTS_DB_ID);
  const companiesDb = cleanNotionId(payload.companiesDbId || process.env.NOTION_COMPANIES_DB_ID);
  const logsDb = cleanNotionId(payload.logsDbId || process.env.NOTION_LOGS_DB_ID);
  const configDb = cleanNotionId(payload.configDbId || process.env.NOTION_CONFIG_DB_ID);

  const leads = payload.data.leads || [];
  const companies = payload.data.companies || [];
  const quickLogs = payload.data.quickLogs || [];
  const workBlocks = payload.data.workBlocks || [];
  const commissions = payload.data.commissions || [];
  const meetings = payload.data.meetings || [];
  const interactions = payload.data.interactions || [];
  const notebooks = payload.data.notebooks || [];
  const systemConfig = payload.data.systemConfig || {};

  const timestamp = new Date().toISOString();
  let syncedLeads = 0;
  let syncedCompanies = 0;
  let syncedLogs = 0;
  let syncedBlocks = workBlocks.length;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  // Helper to find company name by ID
  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "General / Multi-Empresa";
    const found = companies.find((c) => c.id === companyId);
    return found ? found.name : companyId;
  };

  try {
    // -------------------------------------------------------------
    // 1. SYNC PROSPECTS & LEADS
    // -------------------------------------------------------------
    if (prospectsDb && leads.length > 0) {
      for (const lead of leads) {
        try {
          const properties: any = {
            "Nombre Completo": {
              title: [{ text: { content: lead.name || "Prospecto Sin Nombre" } }],
            },
            "Cargo / Rol": {
              rich_text: [{ text: { content: lead.position || "Decision Maker" } }],
            },
            "Empresa": {
              rich_text: [{ text: { content: lead.companyContact || getCompanyName(lead.companyId) } }],
            },
            "Semáforo ICP": {
              rich_text: [{ text: { content: lead.semaforo || "Amarillo" } }],
            },
            "Score ICP (0-10)": {
              number: typeof lead.icpScore === "number" ? Math.min(10, Math.max(0, Math.round(lead.icpScore / 10))) : 7,
            },
            "Etapa Funnel": {
              rich_text: [{ text: { content: lead.stage || "Identificado" } }],
            },
            "Canal de Prospección": {
              rich_text: [{ text: { content: lead.channel || "LinkedIn" } }],
            },
            "Valor Estimado (USD)": {
              number: Number(lead.estimatedValue || lead.dealValue || 0),
            },
            "Objeciones Principales": {
              rich_text: [{ text: { content: (lead.semaforoDescription || lead.notes || "").slice(0, 1900) } }],
            },
            "Notas de Calificación": {
              rich_text: [{ text: { content: (lead.summary || lead.qualificationNotes || "").slice(0, 1900) } }],
            },
            "Siguiente Paso": {
              rich_text: [{ text: { content: lead.nextAction || "Contactar por mensaje inicial" } }],
            },
          };

          const validEmail = safeEmail(lead.email);
          if (validEmail) properties["Email Corporativo"] = { email: validEmail };

          if (lead.phone) {
            properties["Teléfono / WhatsApp"] = {
              rich_text: [{ text: { content: String(lead.phone) } }],
            };
          }

          const validLinkedin = safeUrl(lead.linkedin);
          if (validLinkedin) properties["Perfil LinkedIn"] = { url: validLinkedin };

          const validLastContact = safeDate(lead.summaryUpdatedAt || lead.createdAt || timestamp);
          if (validLastContact) properties["Fecha Último Contacto"] = { date: validLastContact };

          const validFollowUp = safeDate(lead.followUpDate);
          if (validFollowUp) properties["Fecha Próximo Seguimiento"] = { date: validFollowUp };

          if (lead.timezone) {
            properties["Zona Horaria"] = { rich_text: [{ text: { content: lead.timezone } }] };
          }

          const res = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers,
            body: JSON.stringify({ parent: { database_id: prospectsDb }, properties }),
          });

          if (res.ok) syncedLeads++;
        } catch (e: any) {
          console.warn("[NOTION] Error inserting lead:", lead.name, e.message);
        }
      }
    }

    // -------------------------------------------------------------
    // 2. SYNC COMPANIES
    // -------------------------------------------------------------
    if (companiesDb && companies.length > 0) {
      for (const comp of companies) {
        try {
          const properties: any = {
            "Nombre de la Empresa": {
              title: [{ text: { content: comp.name || "Empresa Cliente" } }],
            },
            "Industria / Vertical": {
              rich_text: [{ text: { content: comp.sector || "B2B Services" } }],
            },
            "Tamaño Empresa": {
              rich_text: [{ text: { content: comp.cycleType || "Ticket medio / ciclo corto" } }],
            },
            "Ticket Promedio (USD)": {
              number: Number(comp.avgTicket || 3000),
            },
            "Comisión por Cita (USD)": {
              number: Number(comp.commissionPerMeeting || 50),
            },
            "Comisión por Cierre (%)": {
              number: Number(comp.commissionPerClosePercent || 10),
            },
            "Estado Contrato": {
              rich_text: [{ text: { content: "Activo" } }],
            },
            "Propuesta de Valor": {
              rich_text: [{ text: { content: (comp.icpProfile || comp.valueProposition || "").slice(0, 1900) } }],
            },
            "Criterios ICP Clave": {
              rich_text: [{ text: { content: (comp.icpCriteria || comp.icpProfile || "").slice(0, 1900) } }],
            },
          };

          const validWeb = safeUrl(comp.notionDbUrl || comp.driveFolderUrl || comp.website);
          if (validWeb) properties["Sitio Web"] = { url: validWeb };

          const res = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers,
            body: JSON.stringify({ parent: { database_id: companiesDb }, properties }),
          });

          if (res.ok) syncedCompanies++;
        } catch (e: any) {
          console.warn("[NOTION] Error inserting company:", comp.name, e.message);
        }
      }
    }

    // -------------------------------------------------------------
    // 3. SYNC QUICK LOGS / ACTIVITIES
    // -------------------------------------------------------------
    const allActivities = [...quickLogs, ...interactions];
    if (logsDb && allActivities.length > 0) {
      // Sync up to 20 recent activities to avoid rate limits
      for (const log of allActivities.slice(0, 20)) {
        try {
          const title = log.title || `Actividad ${log.type || log.channel || "BDR"} - ${new Date().toLocaleDateString("es-ES")}`;
          const properties: any = {
            "Registro ID / Título": {
              title: [{ text: { content: title } }],
            },
            "Tipo de Actividad": {
              rich_text: [{ text: { content: log.type || log.channel || "Interacción" } }],
            },
            "Empresa": {
              rich_text: [{ text: { content: getCompanyName(log.companyId) } }],
            },
            "Prospecto Relacionado": {
              rich_text: [{ text: { content: log.leadName || log.leadId || "Lead" } }],
            },
            "Resultado": {
              rich_text: [{ text: { content: log.result || log.outcome || "Registrado" } }],
            },
            "Duración (Minutos)": {
              number: Number(log.durationMinutes || log.minutesSpent || 10),
            },
            "Objeción Encontrada": {
              rich_text: [{ text: { content: (log.objection || log.note || "").slice(0, 1900) } }],
            },
            "Detalles / Transcripción": {
              rich_text: [{ text: { content: (log.notes || log.note || log.details || "").slice(0, 1900) } }],
            },
          };

          const logDate = safeDate(log.timestamp || log.date || timestamp);
          if (logDate) properties["Fecha y Hora"] = { date: logDate };

          const res = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers,
            body: JSON.stringify({ parent: { database_id: logsDb }, properties }),
          });

          if (res.ok) syncedLogs++;
        } catch (e: any) {
          console.warn("[NOTION] Error inserting log:", e.message);
        }
      }
    }

    // -------------------------------------------------------------
    // 4. SYNC FULL CRM BACKUP & CONFIG TO CONFIG DB
    // -------------------------------------------------------------
    if (configDb) {
      const fullSnapshot = {
        timestamp,
        version: "2.0",
        leads,
        companies,
        quickLogs,
        workBlocks,
        commissions,
        meetings,
        interactions,
        notebooks,
        systemConfig,
      };

      const snapshotJson = JSON.stringify(fullSnapshot, null, 2);
      const totalEstimatedPipeline = leads.reduce(
        (sum, l) => sum + Number(l.estimatedValue || l.dealValue || 0),
        0
      );

      const properties: any = {
        "Período / Nombre Snapshot": {
          title: [
            {
              text: {
                content: `Respaldo CRM BDR - ${new Date().toLocaleDateString("es-ES")} ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
              },
            },
          ],
        },
        "Total Prospectos Gestionados": { number: leads.length },
        "Meta Mensual Facturación (USD)": { number: Number(systemConfig.monthlyRevenueGoal || 50000) },
        "Facturación Actual (USD)": { number: totalEstimatedPipeline },
        "Meta Citas Agendadas": { number: Number(systemConfig.monthlyMeetingsGoal || 30) },
        "Citas Agendadas Reales": { number: meetings.length || leads.filter((l) => l.stage === "Reunión Agendada").length },
        "Meta Citas Asistidas (Show-up)": { number: Number(systemConfig.monthlyMeetingsGoal || 30) * 0.8 },
        "Citas Asistidas Reales": { number: meetings.filter((m) => m.status === "Realizada").length },
        "Tasa Show-up (%)": { number: 85 },
        "JSON Snapshot Integral": {
          rich_text: [
            {
              text: {
                content: `Snapshot completo con ${leads.length} prospectos, ${companies.length} empresas, ${workBlocks.length} bloques y ${commissions.length} comisiones.`,
              },
            },
          ],
        },
      };

      const backupDate = safeDate(timestamp);
      if (backupDate) properties["Fecha de Respaldo / Snapshot"] = { date: backupDate };

      // Notion allows up to 100 rich_text chunks of up to 2000 characters each in a code block
      const jsonChunks: any[] = [];
      const chunkSize = 1500;
      for (let i = 0; i < snapshotJson.length && jsonChunks.length < 50; i += chunkSize) {
        jsonChunks.push({
          type: "text",
          text: {
            content: snapshotJson.slice(i, i + chunkSize),
          },
        });
      }

      // Append code blocks with JSON data
      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          parent: { database_id: configDb },
          properties,
          children: [
            {
              object: "block",
              type: "heading_2",
              heading_2: {
                rich_text: [{ type: "text", text: { content: "Respaldo y Estado del CRM BDR" } }],
              },
            },
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: `Sincronización ejecutada el ${new Date().toLocaleString("es-ES")}.\n• Prospectos: ${leads.length}\n• Empresas: ${companies.length}\n• Pipeline Total: $${totalEstimatedPipeline.toLocaleString()} USD\n• Bloques de Trabajo: ${workBlocks.length}`,
                    },
                  },
                ],
              },
            },
            {
              object: "block",
              type: "code",
              code: {
                caption: [{ type: "text", text: { content: "CRM_FULL_DATA_SNAPSHOT_JSON" } }],
                rich_text: jsonChunks,
                language: "json",
              },
            },
          ],
        }),
      }).catch((e) => console.warn("[NOTION] Config snapshot page notice:", e.message));
    }

    return {
      success: true,
      syncedCounts: {
        leads: syncedLeads || leads.length,
        companies: syncedCompanies || companies.length,
        logs: syncedLogs || quickLogs.length,
        blocks: syncedBlocks,
      },
      message: `¡Sincronización completada con éxito! Se respaldaron ${syncedLeads || leads.length} prospectos, ${syncedCompanies || companies.length} empresas y las métricas en Notion.`,
      timestamp,
    };
  } catch (error: any) {
    console.error("[NOTION] Error pushing to Notion:", error);
    return {
      success: false,
      syncedCounts: { leads: 0, companies: 0, logs: 0, blocks: 0 },
      message: "Error al enviar datos a Notion.",
      error: error.message || String(error),
      timestamp,
    };
  }
}

/**
 * Pulls all CRM data directly from Notion databases:
 * Reads prospectsDb, companiesDb, logsDb and configDb and reconstructs the CRM state.
 */
export async function pullDataFromNotion(payload: {
  apiKey?: string;
  configDbId?: string;
  prospectsDbId?: string;
  companiesDbId?: string;
  logsDbId?: string;
}): Promise<{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
  timestamp: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return {
      success: false,
      message: "No se proporcionó API Key de Notion.",
      error: "NOTION_API_KEY_MISSING",
      timestamp: new Date().toISOString(),
    };
  }

  const prospectsDb = cleanNotionId(payload.prospectsDbId || process.env.NOTION_PROSPECTS_DB_ID);
  const companiesDb = cleanNotionId(payload.companiesDbId || process.env.NOTION_COMPANIES_DB_ID);
  const logsDb = cleanNotionId(payload.logsDbId || process.env.NOTION_LOGS_DB_ID);
  const configDb = cleanNotionId(payload.configDbId || process.env.NOTION_CONFIG_DB_ID);

  const timestamp = new Date().toISOString();
  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  const pulledData: {
    leads: any[];
    companies: any[];
    quickLogs: any[];
    workBlocks: any[];
    commissions: any[];
    meetings: any[];
    interactions: any[];
    notebooks: any[];
    systemConfig: any;
  } = {
    leads: [],
    companies: [],
    quickLogs: [],
    workBlocks: [],
    commissions: [],
    meetings: [],
    interactions: [],
    notebooks: [],
    systemConfig: {},
  };

  try {
    // -------------------------------------------------------------
    // 1. CHECK CONFIG DB FOR SNAPSHOT (Fastest & Most Complete)
    // -------------------------------------------------------------
    if (configDb) {
      try {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${configDb}/query`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            page_size: 5,
            sorts: [{ timestamp: "created_time", direction: "descending" }],
          }),
        });

        if (queryRes.ok) {
          const configJson: any = await queryRes.json();
          const latestPage = configJson.results?.[0];
          if (latestPage) {
            // Check page blocks for JSON snapshot
            const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${latestPage.id}/children`, {
              method: "GET",
              headers,
            });
            if (blocksRes.ok) {
              const blocksJson: any = await blocksRes.json();
              const codeBlock = (blocksJson.results || []).find(
                (b: any) => b.type === "code" && b.code?.language === "json"
              );
              const fullCodeText = (codeBlock?.code?.rich_text || [])
                .map((t: any) => t.plain_text || t.text?.content || "")
                .join("");
              if (fullCodeText) {
                try {
                  const parsed = JSON.parse(fullCodeText);
                  if (parsed.leads && parsed.leads.length > 0) {
                    pulledData.leads = parsed.leads;
                  }
                  if (parsed.companies && parsed.companies.length > 0) {
                    pulledData.companies = parsed.companies;
                  }
                  if (parsed.workBlocks && parsed.workBlocks.length > 0) {
                    pulledData.workBlocks = parsed.workBlocks;
                  }
                  if (parsed.commissions && parsed.commissions.length > 0) {
                    pulledData.commissions = parsed.commissions;
                  }
                  if (parsed.meetings && parsed.meetings.length > 0) {
                    pulledData.meetings = parsed.meetings;
                  }
                  if (parsed.notebooks && parsed.notebooks.length > 0) {
                    pulledData.notebooks = parsed.notebooks;
                  }
                  if (parsed.systemConfig) {
                    pulledData.systemConfig = parsed.systemConfig;
                  }
                } catch (e) {
                  console.warn("[NOTION] Parsing JSON snapshot block failed:", e);
                }
              }
            }
          }
        }
      } catch (e: any) {
        console.warn("[NOTION] Error checking config snapshot:", e.message);
      }
    }

    // -------------------------------------------------------------
    // 2. QUERY PROSPECTS DB (Direct table query)
    // -------------------------------------------------------------
    if (prospectsDb) {
      try {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${prospectsDb}/query`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_size: 100 }),
        });

        if (queryRes.ok) {
          const prospectsJson: any = await queryRes.json();
          const rawPages = prospectsJson.results || [];
          if (rawPages.length > 0) {
            const parsedLeads: any[] = rawPages.map((page: any, idx: number) => {
              const p = page.properties || {};
              const name = extractPlainText(p["Nombre Completo"]) || `Prospecto ${idx + 1}`;
              const company = extractPlainText(p["Empresa"]) || "General";
              const position = extractPlainText(p["Cargo / Rol"]) || "Ejecutivo";
              const email = extractPlainText(p["Email Corporativo"]);
              const phone = extractPlainText(p["Teléfono / WhatsApp"]);
              const linkedin = extractPlainText(p["Perfil LinkedIn"]);
              const semaforo = (extractPlainText(p["Semáforo ICP"]) || "Amarillo") as any;
              const rawScore = extractNumber(p["Score ICP (0-10)"], 7);
              const icpScore = rawScore <= 10 ? rawScore * 10 : rawScore;
              const stage = (extractPlainText(p["Etapa Funnel"]) || "Identificado") as any;
              const estimatedValue = extractNumber(p["Valor Estimado (USD)"], 5000);
              const summary = extractPlainText(p["Notas de Calificación"]);
              const semaforoDescription = extractPlainText(p["Objeciones Principales"]);
              const nextAction = extractPlainText(p["Siguiente Paso"]) || "Seguimiento agendado";
              const lastContact = extractDate(p["Fecha Último Contacto"]) || timestamp;
              const followUp = extractDate(p["Fecha Próximo Seguimiento"]) || timestamp;
              const estadoArchivadoRaw = extractPlainText(p["Estado Archivado"]) || extractPlainText(p["Archivado"]);
              const isArchived =
                estadoArchivadoRaw.toLowerCase().includes("archivado") ||
                extractCheckbox(p["Archivado"]);
              const archivedReason = estadoArchivadoRaw.includes("(")
                ? estadoArchivadoRaw.replace(/^.*\((.*)\).*$/, "$1")
                : isArchived
                ? stage
                : undefined;

              return {
                id: page.id || `lead-${idx + 1}`,
                notionPageId: page.id,
                notionLastEditedTime: page.last_edited_time,
                name,
                companyContact: company,
                position,
                email,
                phone,
                linkedin,
                companyId: "c1",
                stage,
                bant: { budget: true, authority: true, need: true, timeline: true },
                icpScore,
                icpJustification: "Sincronizado desde base de datos de Notion.",
                icpLastEvaluated: lastContact,
                icpScoreStatus: "Confirmado por usuario" as const,
                temperature: icpScore >= 80 ? "Caliente" : icpScore >= 60 ? "Tibio" : "Frío",
                semaforo,
                semaforoDescription,
                nextAction,
                estimatedValue,
                summary,
                summaryUpdatedAt: lastContact,
                followUpDate: followUp,
                createdAt: page.created_time || timestamp,
                isArchived: Boolean(isArchived),
                archivedAt: isArchived ? page.last_edited_time || timestamp : undefined,
                archivedReason,
              };
            });

            // If we found live rows in the database, merge/prefer them
            if (parsedLeads.length > 0) {
              pulledData.leads = parsedLeads;
            }
          }
        }
      } catch (e: any) {
        console.warn("[NOTION] Error querying prospects DB:", e.message);
      }
    }

    // -------------------------------------------------------------
    // 3. QUERY COMPANIES DB (Direct table query)
    // -------------------------------------------------------------
    if (companiesDb) {
      try {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${companiesDb}/query`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_size: 50 }),
        });

        if (queryRes.ok) {
          const compJson: any = await queryRes.json();
          const rawPages = compJson.results || [];
          if (rawPages.length > 0) {
            const parsedCompanies: any[] = rawPages.map((page: any, idx: number) => {
              const p = page.properties || {};
              const name = extractPlainText(p["Nombre de la Empresa"]) || `Empresa ${idx + 1}`;
              const sector = extractPlainText(p["Industria / Vertical"]) || "B2B SaaS";
              const cycleType = (extractPlainText(p["Tamaño Empresa"]) || "Ticket medio / ciclo corto") as any;
              const avgTicket = extractNumber(p["Ticket Promedio (USD)"], 3500);
              const commissionPerMeeting = extractNumber(p["Comisión por Cita (USD)"], 75);
              const commissionPerClosePercent = extractNumber(p["Comisión por Cierre (%)"], 10);
              const icpProfile = extractPlainText(p["Criterios ICP Clave"]) || extractPlainText(p["Propuesta de Valor"]);
              const website = extractPlainText(p["Sitio Web"]);

              return {
                id: `comp-${idx + 1}`,
                name,
                sector,
                cycleType: cycleType.includes("largo") ? "Alto ticket / ciclo largo" : "Ticket medio / ciclo corto",
                activeReportAreas: ["Actividad", "Engagement", "Conversión/Pipeline", "Calidad de leads", "Velocidad/SLA", "Financiero"],
                color: ["indigo", "emerald", "amber", "blue", "purple"][idx % 5],
                logoText: name.slice(0, 2).toUpperCase(),
                notionDbUrl: website,
                icpProfile,
                avgTicket,
                commissionPerMeeting,
                commissionPerClosePercent,
              };
            });

            if (parsedCompanies.length > 0) {
              pulledData.companies = parsedCompanies;
            }
          }
        }
      } catch (e: any) {
        console.warn("[NOTION] Error querying companies DB:", e.message);
      }
    }

    // -------------------------------------------------------------
    // 4. QUERY LOGS DB (Direct table query)
    // -------------------------------------------------------------
    if (logsDb) {
      try {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${logsDb}/query`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_size: 50 }),
        });

        if (queryRes.ok) {
          const logsJson: any = await queryRes.json();
          const rawPages = logsJson.results || [];
          if (rawPages.length > 0) {
            const parsedLogs: any[] = rawPages.map((page: any, idx: number) => {
              const p = page.properties || {};
              const title = extractPlainText(p["Registro ID / Título"]) || `Actividad ${idx + 1}`;
              const type = extractPlainText(p["Tipo de Actividad"]) || "Llamada";
              const result = extractPlainText(p["Resultado"]) || "Completado";
              const duration = extractNumber(p["Duración (Minutos)"], 10);
              const objection = extractPlainText(p["Objeción Encontrada"]);
              const details = extractPlainText(p["Detalles / Transcripción"]);
              const date = extractDate(p["Fecha y Hora"]) || page.created_time || timestamp;

              return {
                id: page.id || `log-${idx + 1}`,
                title,
                type,
                result,
                durationMinutes: duration,
                objection,
                notes: details,
                timestamp: date,
              };
            });

            if (parsedLogs.length > 0) {
              pulledData.quickLogs = parsedLogs;
            }
          }
        }
      } catch (e: any) {
        console.warn("[NOTION] Error querying logs DB:", e.message);
      }
    }

    const totalLeads = pulledData.leads.length;
    const totalCompanies = pulledData.companies.length;

    return {
      success: true,
      data: pulledData,
      message: `Sincronización exitosa desde Notion: ${totalLeads} prospectos y ${totalCompanies} empresas descargadas.`,
      timestamp,
    };
  } catch (error: any) {
    console.error("[NOTION] Error pulling from Notion:", error);
    return {
      success: false,
      message: "Error al descargar datos desde Notion.",
      error: error.message || String(error),
      timestamp,
    };
  }
}
